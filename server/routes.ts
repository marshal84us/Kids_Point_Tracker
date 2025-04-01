import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pointsSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Define API routes
  
  // GET /api/points - Get current points for both children
  app.get("/api/points", async (_req: Request, res: Response) => {
    try {
      const points = await storage.getPoints();
      res.json(points);
    } catch (error) {
      console.error("Error getting points:", error);
      res.status(500).json({ message: "Failed to get points" });
    }
  });

  // POST /api/points - Update points for both children
  app.post("/api/points", async (req: Request, res: Response) => {
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

  // POST /api/points/reset - Reset all points
  app.post("/api/points/reset", async (_req: Request, res: Response) => {
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
