import { users, type User, type InsertUser, type Points } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Points related methods
  getPoints(): Promise<Points>;
  updatePoints(points: Points): Promise<Points>;
  resetPoints(): Promise<Points>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private points: Points;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    // Initialize with empty points for both children
    this.points = {
      adrian: [],
      emma: []
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Points related methods
  async getPoints(): Promise<Points> {
    return this.points;
  }

  async updatePoints(points: Points): Promise<Points> {
    this.points = points;
    return this.points;
  }

  async resetPoints(): Promise<Points> {
    this.points = {
      adrian: [],
      emma: []
    };
    return this.points;
  }
}

export const storage = new MemStorage();
