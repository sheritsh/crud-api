import { IncomingMessage, ServerResponse } from 'node:http';

export class Router {
  constructor() {}

  async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = req.url || '';
    const method = req.method || '';

    // CORS for requests
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    // CORS for responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handling unexisted routes
    try {
      if (url.startsWith('/api/users')) {
        await this.handleUserRoutes(req, res, url);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Resource not found' }));
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal server error: ' + error }));
    }
  }

  // Todo: implement handlers for routes
  private async handleUserRoutes(
    req: IncomingMessage,
    res: ServerResponse,
    // url: string,
  ): Promise<void> {
    const method = req.method || '';

    switch (method) {
      case 'GET':
        break;

      case 'POST':
        break;

      case 'PUT':
        break;

      case 'DELETE':
        break;

      default:
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Method not allowed' }));
    }
  }
}
