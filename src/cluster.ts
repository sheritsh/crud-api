import cluster from 'node:cluster';
import os from 'node:os';
import { createServer, request } from 'node:http';
import { config } from 'dotenv';
import { Router } from './routes/router.js';

config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const numCPUs = os.cpus().length - 1;

const workerPorts = new Map();
let currentWorkerIndex = 0;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking for ${numCPUs} CPUs`);

  for (let i = 0; i < numCPUs; i++) {
    const workerPort = PORT + i + 1;
    const worker = cluster.fork({ PORT: workerPort });
    workerPorts.set(worker.id, workerPort);
  }

  const availablePorts = Array.from(workerPorts.values());

  // Round-robin
  const balancer = createServer(async (req, res) => {
    if (availablePorts.length === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'No available workers' }));
      return;
    }

    // Round-robin: next port
    const targetPort = availablePorts[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % availablePorts.length;

    console.log(`Request was balanced to PORT: ${targetPort}`);

    const proxyReq = request(
      {
        hostname: 'localhost',
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    if (req.method === 'POST' || req.method === 'PUT') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }

    proxyReq.on('error', (error) => {
      console.error(`Proxy request error to port ${targetPort}:`, error);
      res.writeHead(500);
      res.end(JSON.stringify({ message: 'Internal Server Error', error: error.message }));
    });
  });

  balancer.listen(PORT, () => {
    console.log(`Load balancer is running on port ${PORT}`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code})`);

    const deadWorkerPort = workerPorts.get(worker.id);
    workerPorts.delete(worker.id);

    const index = availablePorts.indexOf(deadWorkerPort);
    if (index !== -1) {
      availablePorts.splice(index, 1);
    }

    const newWorker = cluster.fork({ PORT: deadWorkerPort });
    workerPorts.set(newWorker.id, deadWorkerPort);
    availablePorts.push(deadWorkerPort);

    if (currentWorkerIndex >= availablePorts.length) {
      currentWorkerIndex = 0;
    }
  });
} else {
  const workerPort = parseInt(process.env.PORT || (PORT + 1).toString(), 10);
  const router = new Router();
  const server = createServer(async (req, res) => {
    await router.handleRequest(req, res);
  });

  server.listen(workerPort, () => {
    console.log(`Worker ${process.pid} is running on port ${workerPort}`);
  });
}
