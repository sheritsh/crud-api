import { IncomingMessage, ServerResponse } from 'node:http';
import { UserController } from '../controllers/user.controller.js';

export class Router {
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
  }

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

  private async handleUserRoutes(
    req: IncomingMessage,
    res: ServerResponse,
    url: string,
  ): Promise<void> {
    const method = req.method || '';
    const urlParts = url.split('/');
    const userId = urlParts[3];

    switch (method) {
      case 'GET':
        if (userId) {
          await this.userController.getUserById(req, res, userId);
        } else {
          await this.userController.getAllUsers(req, res);
        }
        break;

      case 'POST':
        if (!userId) {
          await this.userController.createUser(req, res);
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Resource not found' }));
        }
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
