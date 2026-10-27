import type { User } from '../types.js';

export interface UserService {
  list(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(data: Omit<User, 'id'>): Promise<User>;
}

export class InMemoryUserService implements UserService {
  private users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
  ];

  async list(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const user: User = {
      id: String(this.users.length + 1),
      ...data,
    };
    this.users.push(user);
    return user;
  }
}

export const defaultUserService = new InMemoryUserService();
