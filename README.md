# CRUD API

A simple CRUD API implementation using Node.js with TypeScript and in-memory database.

## Features

- RESTful API endpoints for user management
- TypeScript implementation
- In-memory database
- Horizontal scaling with Node.js Cluster
- Comprehensive test coverage
- CORS support
- Error handling

## API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/{userId}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{userId}` - Update user
- `DELETE /api/users/{userId}` - Delete user

## User Object Structure

```typescript
{
  id: string;        // UUID
  username: string;  // Required
  age: number;       // Required
  hobbies: string[]; // Required, can be empty
}
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file with the following content:
   ```
   PORT=4000
   ```

## Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run start:prod` - Start production server
- `npm run start:multi` - Start multiple instances with load balancing

- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run lint:fix` - Fix linting issues

## Horizontal Scaling

The application supports horizontal scaling using Node.js Cluster API. When running in multi-instance mode:

- A load balancer runs on the main port (default: 4000)
- Worker instances run on subsequent ports (4001, 4002, etc.)
- The number of workers equals the number of available CPU cores minus 1
- Requests are distributed using a round-robin algorithm
- The in-memory database is shared between all workers
