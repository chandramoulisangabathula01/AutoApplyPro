import {
  users,
  resumes,
  jobApplications,
  aiResponses,
  type User,
  type UpsertUser,
  type Resume,
  type InsertResume,
  type JobApplication,
  type InsertJobApplication,
  type AiResponse,
  type InsertAiResponse,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  updateUserStripeInfo(id: string, data: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionPlan?: string; subscriptionStatus?: string }): Promise<User>;
  
  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getUserResumes(userId: string): Promise<Resume[]>;
  getActiveResume(userId: string): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<void>;
  setActiveResume(userId: string, resumeId: number): Promise<void>;
  
  // Job application operations
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getUserJobApplications(userId: string): Promise<JobApplication[]>;
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  updateJobApplicationStatus(id: number, status: string, responseDate?: Date, notes?: string): Promise<JobApplication>;
  
  // AI response operations
  createAiResponse(response: InsertAiResponse): Promise<AiResponse>;
  getUserAiResponses(userId: string): Promise<AiResponse[]>;
  getAiResponseByQuestion(userId: string, question: string): Promise<AiResponse | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, data: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionPlan?: string; subscriptionStatus?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Resume operations
  async createResume(resume: InsertResume): Promise<Resume> {
    // Set all other resumes as inactive
    await db
      .update(resumes)
      .set({ isActive: false })
      .where(eq(resumes.userId, resume.userId));

    const [newResume] = await db
      .insert(resumes)
      .values(resume)
      .returning();
    return newResume;
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.uploadedAt));
  }

  async getActiveResume(userId: string): Promise<Resume | undefined> {
    const [resume] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.userId, userId), eq(resumes.isActive, true)));
    return resume;
  }

  async deleteResume(id: number): Promise<void> {
    await db.delete(resumes).where(eq(resumes.id, id));
  }

  async setActiveResume(userId: string, resumeId: number): Promise<void> {
    // Set all resumes as inactive
    await db
      .update(resumes)
      .set({ isActive: false })
      .where(eq(resumes.userId, userId));

    // Set the selected resume as active
    await db
      .update(resumes)
      .set({ isActive: true })
      .where(eq(resumes.id, resumeId));
  }

  // Job application operations
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [newApplication] = await db
      .insert(jobApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  async getUserJobApplications(userId: string): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.appliedAt));
  }

  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    const [application] = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, id));
    return application;
  }

  async updateJobApplicationStatus(id: number, status: string, responseDate?: Date, notes?: string): Promise<JobApplication> {
    const updateData: Partial<JobApplication> = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (responseDate) updateData.responseDate = responseDate;
    if (notes !== undefined) updateData.notes = notes;

    const [application] = await db
      .update(jobApplications)
      .set(updateData)
      .where(eq(jobApplications.id, id))
      .returning();
    return application;
  }

  // AI response operations
  async createAiResponse(response: InsertAiResponse): Promise<AiResponse> {
    const [newResponse] = await db
      .insert(aiResponses)
      .values(response)
      .returning();
    return newResponse;
  }

  async getUserAiResponses(userId: string): Promise<AiResponse[]> {
    return await db
      .select()
      .from(aiResponses)
      .where(eq(aiResponses.userId, userId))
      .orderBy(desc(aiResponses.createdAt));
  }

  async getAiResponseByQuestion(userId: string, question: string): Promise<AiResponse | undefined> {
    const [response] = await db
      .select()
      .from(aiResponses)
      .where(and(eq(aiResponses.userId, userId), eq(aiResponses.question, question)));
    return response;
  }
}

export const storage = new DatabaseStorage();
