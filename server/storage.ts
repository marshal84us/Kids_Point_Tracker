import { users, type User, type InsertUser, type Points, type AppUser, type Credentials, type UserRole, type ChildType } from "@shared/schema";
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
  
  // Authentication methods
  authenticateUser(username: string, password: string): Promise<{ authenticated: boolean, role: UserRole | null, childView?: ChildType | null }>;
  getCredentials(): Promise<Credentials>;
}

// Path to the JSON files
const pointsFilePath = path.resolve('data/points.json');
const credentialsFilePath = path.resolve('data/credentials.json');

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

  // Authentication methods
  async getCredentials(): Promise<Credentials> {
    try {
      // Read credentials from JSON file
      const data = await fs.readFile(credentialsFilePath, 'utf8');
      return JSON.parse(data) as Credentials;
    } catch (error) {
      console.error('Error reading credentials file:', error);
      throw new Error('Failed to read credentials');
    }
  }

  async authenticateUser(username: string, password: string): Promise<{ authenticated: boolean, role: UserRole | null, childView?: ChildType | null }> {
    try {
      const credentials = await this.getCredentials();
      const user = credentials.users.find(u => u.username === username && u.password === password);
      
      if (user) {
        // For child-specific users, set the childView based on username
        if (user.role === 'viewer') {
          if (username === 'adrian') {
            return { authenticated: true, role: user.role, childView: 'adrian' };
          } else if (username === 'emma') {
            return { authenticated: true, role: user.role, childView: 'emma' };
          }
        }
        
        // For admin users or other viewers, no specific childView
        return { authenticated: true, role: user.role, childView: null };
      }
      
      return { authenticated: false, role: null };
    } catch (error) {
      console.error('Authentication error:', error);
      return { authenticated: false, role: null };
    }
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
