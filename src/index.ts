import { createServer } from 'node:http';
import { config } from 'dotenv';
import { Router } from './routes/router.js';

config();

const PORT = process.env.PORT || 4000;
const router = new Router();

const server = createServer(async (req, res) => {
  await router.handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
