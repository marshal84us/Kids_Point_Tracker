import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pointsSchema, loginSchema, UserRole, ChildType } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import session from 'express-session';

// Define types for session
declare module 'express-session' {
  interface SessionData {
    user?: {
      username: string;
      role: UserRole;
      authenticated: boolean;
      childView?: ChildType | null; // Which child's view (if applicable)
    };
  }
}

// Middleware to check authentication
const authenticateMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user || !req.session.user.authenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to check admin role
const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user || !req.session.user.authenticated || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(session({
    secret: 'kids-points-tracker-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
  }));

  // Define API routes
  
  // POST /api/login - User login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const { username, password } = result.data;
      
      // Authenticate user
      const authResult = await storage.authenticateUser(username, password);
      
      if (authResult.authenticated && authResult.role) {
        // Set session data
        req.session.user = {
          username,
          role: authResult.role,
          authenticated: true,
          childView: authResult.childView
        };
        
        res.json({ 
          authenticated: true, 
          role: authResult.role,
          username,
          childView: authResult.childView
        });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // POST /api/logout - User logout
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  // GET /api/session - Get current session data
  app.get("/api/session", (req: Request, res: Response) => {
    if (req.session.user && req.session.user.authenticated) {
      res.json({ 
        authenticated: true,
        role: req.session.user.role,
        username: req.session.user.username,
        childView: req.session.user.childView
      });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  // GET /api/points - Get points based on user role and childView (requires auth)
  app.get("/api/points", authenticateMiddleware, async (req: Request, res: Response) => {
    try {
      const points = await storage.getPoints();
      
      // If admin, return all points
      if (req.session.user && req.session.user.role === 'admin') {
        return res.json(points);
      }
      
      // If child user with specific childView, return only their points
      if (req.session.user && req.session.user.childView) {
        const childView = req.session.user.childView;
        // Create a response with only the child's points visible
        const filteredPoints = {
          [childView]: points[childView],
          // Set the other child's points to empty array
          [childView === 'adrian' ? 'emma' : 'adrian']: []
        };
        return res.json(filteredPoints);
      }
      
      // Fallback to returning all points (shouldn't happen with proper setup)
      res.json(points);
    } catch (error) {
      console.error("Error getting points:", error);
      res.status(500).json({ message: "Failed to get points" });
    }
  });

  // POST /api/points - Update points for both children (requires admin role)
  app.post("/api/points", authenticateMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = pointsSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      // Update points
      const points = await storage.updatePoints(result.data);
      res.json(points);
    } catch (error) {
      console.error("Error updating points:", error);
      res.status(500).json({ message: "Failed to update points" });
    }
  });

  // POST /api/points/reset - Reset all points (requires admin role)
  app.post("/api/points/reset", authenticateMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
    try {
      const points = await storage.resetPoints();
      res.json(points);
    } catch (error) {
      console.error("Error resetting points:", error);
      res.status(500).json({ message: "Failed to reset points" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
