import { User } from './user.model';

class Database {
  private users: User[] = [];

  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  createUser(user: User): User {
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updatedUser: User): User | undefined {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users[index] = updatedUser;
      return updatedUser;
    }
    return undefined;
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const db = new Database();
