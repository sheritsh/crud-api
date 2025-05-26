import request from 'supertest';
import { createServer } from 'node:http';
import { Router } from '../routes/router.js';

describe('API Tests', () => {
  let server: any;
  let userId: string;

  beforeAll(() => {
    const router = new Router();
    server = createServer(async (req, res) => {
      await router.handleRequest(req, res);
    });
  });

  afterAll(() => {
    server.close();
  });

  it('should return empty array when no users exist', async () => {
    const response = await request(server).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should create a new user', async () => {
    const userData = {
      username: 'John Doe',
      age: 30,
      hobbies: ['reading', 'gaming'],
    };

    const response = await request(server).post('/api/users').send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(userData.username);
    expect(response.body.age).toBe(userData.age);
    expect(response.body.hobbies).toEqual(userData.hobbies);

    userId = response.body.id;
  });

  it('should get user by id', async () => {
    const response = await request(server).get(`/api/users/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  it('should update user', async () => {
    const updatedData = {
      username: 'John Updated',
      age: 31,
      hobbies: ['reading', 'gaming', 'coding'],
    };

    const response = await request(server).put(`/api/users/${userId}`).send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(updatedData.username);
    expect(response.body.age).toBe(updatedData.age);
    expect(response.body.hobbies).toEqual(updatedData.hobbies);
  });

  it('should delete user', async () => {
    const response = await request(server).delete(`/api/users/${userId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 when getting deleted user', async () => {
    const response = await request(server).get(`/api/users/${userId}`);
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid uuid', async () => {
    const response = await request(server).get('/api/users/invalid-uuid');
    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existing endpoint', async () => {
    const response = await request(server).get('/api/non-existing');
    expect(response.status).toBe(404);
  });
});
