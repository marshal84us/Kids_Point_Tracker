import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping this from the original file for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Authentication schemas
export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const userRoleSchema = z.enum(['admin', 'viewer']);

export type UserRole = z.infer<typeof userRoleSchema>;

export const childTypeSchema = z.enum(['adrian', 'emma']);

export type ChildType = z.infer<typeof childTypeSchema>;

export const appUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: userRoleSchema,
  childView: childTypeSchema.nullable().optional() // Which child's points this user can see (null for admin who sees all)
});

export type AppUser = z.infer<typeof appUserSchema>;

export const credentialsSchema = z.object({
  users: z.array(appUserSchema)
});

export type Credentials = z.infer<typeof credentialsSchema>;

// Points schema for tracking kids' points
export const pointsSchema = z.object({
  adrian: z.array(z.number()),
  emma: z.array(z.number())
});

export type Points = z.infer<typeof pointsSchema>;
