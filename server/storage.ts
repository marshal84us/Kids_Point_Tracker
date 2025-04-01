import { users, type User, type InsertUser, type Points } from "@shared/schema";
import * as fs from 'fs/promises';
import * as path from 'path';

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

// Path to the JSON file that stores points data
const pointsFilePath = path.resolve('data/points.json');

export class JsonFileStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
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
    try {
      // Read points from JSON file
      const data = await fs.readFile(pointsFilePath, 'utf8');
      return JSON.parse(data) as Points;
    } catch (error) {
      // If the file doesn't exist or is invalid, return default empty points
      console.error('Error reading points file:', error);
      const defaultPoints = { adrian: [], emma: [] };
      
      // Try to create the default file
      try {
        await fs.writeFile(pointsFilePath, JSON.stringify(defaultPoints, null, 2));
      } catch (writeError) {
        console.error('Error creating default points file:', writeError);
      }
      
      return defaultPoints;
    }
  }

  async updatePoints(points: Points): Promise<Points> {
    try {
      // Write points to JSON file
      await fs.writeFile(pointsFilePath, JSON.stringify(points, null, 2));
      return points;
    } catch (error) {
      console.error('Error writing points file:', error);
      throw new Error('Failed to save points to file');
    }
  }

  async resetPoints(): Promise<Points> {
    const emptyPoints = {
      adrian: [],
      emma: []
    };
    
    try {
      // Reset points in JSON file
      await fs.writeFile(pointsFilePath, JSON.stringify(emptyPoints, null, 2));
      return emptyPoints;
    } catch (error) {
      console.error('Error resetting points file:', error);
      throw new Error('Failed to reset points');
    }
  }
}

export const storage = new JsonFileStorage();
