import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Profile information
  fullName: varchar("full_name"),
  phone: varchar("phone"),
  linkedin: varchar("linkedin"),
  
  // Job preferences
  desiredJobTitles: text("desired_job_titles"),
  preferredLocations: text("preferred_locations"),
  industries: text("industries"),
  skills: jsonb("skills").$type<string[]>().default([]),
  
  // Subscription info
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionPlan: varchar("subscription_plan").default("free"), // free, monthly, lifetime
  subscriptionStatus: varchar("subscription_status").default("inactive"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Resumes table
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: varchar("file_type").notNull(),
  filePath: varchar("file_path").notNull(),
  isActive: boolean("is_active").default(true),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Job applications table
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Job details
  jobTitle: varchar("job_title").notNull(),
  company: varchar("company").notNull(),
  location: varchar("location"),
  jobUrl: varchar("job_url"),
  description: text("description"),
  requirements: text("requirements"),
  salary: varchar("salary"),
  
  // Application details
  status: varchar("status").default("pending"), // pending, applied, under_review, interview, rejected, offer
  appliedAt: timestamp("applied_at").defaultNow(),
  responseDate: timestamp("response_date"),
  notes: text("notes"),
  
  // AI-generated content
  coverLetter: text("cover_letter"),
  aiResponses: jsonb("ai_responses").$type<Record<string, string>>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-generated responses table for common questions
export const aiResponses = pgTable("ai_responses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  jobApplications: many(jobApplications),
  aiResponses: many(aiResponses),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
}));

export const aiResponsesRelations = relations(aiResponses, ({ one }) => ({
  user: one(users, {
    fields: [aiResponses.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  uploadedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiResponseSchema = createInsertSchema(aiResponses).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertAiResponse = z.infer<typeof insertAiResponseSchema>;
export type AiResponse = typeof aiResponses.$inferSelect;
