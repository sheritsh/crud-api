import { IncomingMessage, ServerResponse } from 'node:http';
import { v4 as uuidv4 } from 'uuid';
import { User, UserWithoutId } from '../models/user.model.js';
import { db } from '../models/db.model.js';

export class UserController {
  async getAllUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const users = db.getAllUsers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  }

  async getUserById(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    if (!this.isValidUUID(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID format' }));
      return;
    }

    const user = db.getUserById(id);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  }

  async createUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const body = await this.parseRequestBody(req);
      const userData = body as UserWithoutId;

      if (!this.validateUserData(userData)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Missing required fields' }));
        return;
      }

      const newUser: User = {
        id: uuidv4(),
        ...userData,
      };

      const createdUser = db.createUser(newUser);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(createdUser));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid request body: ' + error }));
    }
  }

  async updateUser(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    if (!this.isValidUUID(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID format' }));
      return;
    }

    try {
      const body = await this.parseRequestBody(req);
      const userData = body as UserWithoutId;

      if (!this.validateUserData(userData)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Missing required fields' }));
        return;
      }

      const updatedUser: User = {
        id,
        ...userData,
      };

      const result = db.updateUser(id, updatedUser);
      if (!result) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid request body: ' + error }));
    }
  }

  async deleteUser(req: IncomingMessage, res: ServerResponse, id: string): Promise<void> {
    if (!this.isValidUUID(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid user ID format' }));
      return;
    }

    const deleted = db.deleteUser(id);
    if (!deleted) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    res.writeHead(204);
    res.end();
  }

  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  private validateUserData(data: UserWithoutId): boolean {
    return (
      typeof data.username === 'string' &&
      typeof data.age === 'number' &&
      Array.isArray(data.hobbies) &&
      data.hobbies.every((hobby) => typeof hobby === 'string')
    );
  }

  private parseRequestBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', (error) => {
        reject(error);
      });
    });
  }
}
