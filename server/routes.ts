import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertJobApplicationSchema, insertAiResponseSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Stripe from "stripe";
import { emailService } from "./services/emailService";
import { analyticsService } from "./services/analyticsService";
import { jobPortalService } from "./services/jobPortalService";

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found in environment variables');
}
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const user = await storage.updateUserProfile(userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Resume routes
  app.post('/api/resumes/upload', isAuthenticated, upload.single('resume'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const resume = await storage.createResume({
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        filePath: file.path,
        isActive: true,
      });

      res.json(resume);
    } catch (error) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ message: "Failed to upload resume" });
    }
  });

  app.get('/api/resumes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resumes = await storage.getUserResumes(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.delete('/api/resumes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      await storage.deleteResume(resumeId);
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // Job application routes
  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = insertJobApplicationSchema.parse({
        ...req.body,
        userId,
      });

      const application = await storage.createJobApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getUserJobApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put('/api/applications/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status, notes } = req.body;
      const responseDate = status !== 'pending' ? new Date() : undefined;

      const application = await storage.updateJobApplicationStatus(
        applicationId,
        status,
        responseDate,
        notes
      );
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // AI response generation routes
  app.post('/api/ai/generate-response', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { question, jobTitle, company, jobDescription } = req.body;

      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }

      // Get user profile for context
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create context for AI
      const prompt = `You are a professional career advisor helping users create compelling responses to job application questions.

User Profile:
- Name: ${user.fullName || user.firstName + ' ' + user.lastName}
- Skills: ${user.skills?.join(', ') || 'Not specified'}
- Job Preferences: ${user.desiredJobTitles || 'Not specified'}

Job Context:
- Position: ${jobTitle || 'Not specified'}
- Company: ${company || 'Not specified'}
- Description: ${jobDescription || 'Not specified'}

Question: ${question}

Please provide a professional, tailored response that highlights relevant experience and skills. Make it concise but compelling. Respond with only the answer text, no additional formatting or explanations.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const aiResponseText = response.text();
      
      // Save the AI response
      await storage.createAiResponse({
        userId,
        question,
        response: aiResponseText,
      });

      res.json({ response: aiResponseText });
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  app.get('/api/ai/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const responses = await storage.getUserAiResponses(userId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching AI responses:", error);
      res.status(500).json({ message: "Failed to fetch AI responses" });
    }
  });

  // Stripe payment routes
  if (stripe) {
    app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });

    app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { priceId } = req.body;
        
        let user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Check if user already has a subscription
        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          const latestInvoice = subscription.latest_invoice;
          let clientSecret = null;
          
          if (latestInvoice && typeof latestInvoice === 'object') {
            const invoice = latestInvoice as any;
            if (invoice.payment_intent && typeof invoice.payment_intent === 'object') {
              clientSecret = invoice.payment_intent.client_secret;
            }
          }
          
          return res.json({
            subscriptionId: subscription.id,
            clientSecret,
          });
        }

        // Create customer if doesn't exist
        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email || '',
            name: user.fullName || `${user.firstName} ${user.lastName}`,
          });
          customerId = customer.id;
          user = await storage.updateUserStripeInfo(userId, { stripeCustomerId: customerId });
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: priceId || process.env.STRIPE_PRICE_ID || 'price_default',
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        // Update user with subscription info
        await storage.updateUserStripeInfo(userId, {
          stripeSubscriptionId: subscription.id,
          subscriptionPlan: 'monthly',
          subscriptionStatus: 'active',
        });

        const latestInvoice = subscription.latest_invoice;
        let clientSecret = null;
        
        if (latestInvoice && typeof latestInvoice === 'object') {
          const invoice = latestInvoice as any;
          if (invoice.payment_intent && typeof invoice.payment_intent === 'object') {
            clientSecret = invoice.payment_intent.client_secret;
          }
        }

        res.json({
          subscriptionId: subscription.id,
          clientSecret,
        });
      } catch (error: any) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: "Error creating subscription: " + error.message });
      }
    });
  } else {
    app.post("/api/create-payment-intent", (req, res) => {
      res.status(500).json({ message: "Stripe not configured. Please set STRIPE_SECRET_KEY environment variable." });
    });

    app.post('/api/create-subscription', (req, res) => {
      res.status(500).json({ message: "Stripe not configured. Please set STRIPE_SECRET_KEY environment variable." });
    });
  }

  // Mock job search data (since no real job API specified)
  app.get('/api/jobs/search', isAuthenticated, async (req: any, res) => {
    try {
      // In a real implementation, this would integrate with job APIs like LinkedIn, Indeed, etc.
      // For now, returning empty array as per guidelines - no mock data
      res.json([]);
    } catch (error) {
      console.error("Error searching jobs:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
