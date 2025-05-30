import { storage } from "../storage";
import { eq, gte, and, count, sql } from "drizzle-orm";
import { jobApplications, users } from "@shared/schema";
import { db } from "../db";

export interface ApplicationAnalytics {
  totalApplications: number;
  thisWeekApplications: number;
  thisMonthApplications: number;
  responseRate: number;
  interviewRate: number;
  successRate: number;
  averageResponseTime: number;
  topCompanies: Array<{ company: string; count: number }>;
  applicationsByStatus: Array<{ status: string; count: number }>;
  applicationTrends: Array<{ date: string; count: number }>;
}

export interface UserMetrics {
  profileCompleteness: number;
  lastLoginDate: Date | null;
  accountAge: number;
  subscriptionStatus: string;
  totalJobsApplied: number;
}

export class AnalyticsService {
  async getUserApplicationAnalytics(userId: string): Promise<ApplicationAnalytics> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all applications for user
    const allApplications = await storage.getUserJobApplications(userId);

    // Calculate basic metrics
    const totalApplications = allApplications.length;
    const thisWeekApplications = allApplications.filter(
      app => app.appliedAt && new Date(app.appliedAt) >= oneWeekAgo
    ).length;
    const thisMonthApplications = allApplications.filter(
      app => app.appliedAt && new Date(app.appliedAt) >= oneMonthAgo
    ).length;

    // Calculate rates
    const responsesReceived = allApplications.filter(
      app => app.status !== 'pending' && app.status !== 'applied'
    ).length;
    const interviews = allApplications.filter(
      app => app.status === 'interview'
    ).length;
    const offers = allApplications.filter(
      app => app.status === 'offer'
    ).length;

    const responseRate = totalApplications > 0 ? (responsesReceived / totalApplications) * 100 : 0;
    const interviewRate = totalApplications > 0 ? (interviews / totalApplications) * 100 : 0;
    const successRate = totalApplications > 0 ? ((interviews + offers) / totalApplications) * 100 : 0;

    // Calculate average response time
    const applicationsWithResponse = allApplications.filter(
      app => app.responseDate && app.appliedAt
    );
    const averageResponseTime = applicationsWithResponse.length > 0
      ? applicationsWithResponse.reduce((sum, app) => {
          if (app.responseDate && app.appliedAt) {
            const responseTime = new Date(app.responseDate).getTime() - new Date(app.appliedAt).getTime();
            return sum + responseTime;
          }
          return sum;
        }, 0) / applicationsWithResponse.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Top companies
    const companyCounts = allApplications.reduce((acc, app) => {
      if (app.company) {
        acc[app.company] = (acc[app.company] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const topCompanies = Object.entries(companyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    // Applications by status
    const statusCounts = allApplications.reduce((acc, app) => {
      if (app.status) {
        acc[app.status] = (acc[app.status] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const applicationsByStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }));

    // Application trends (last 30 days)
    const applicationTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = allApplications.filter(app => {
        if (app.appliedAt) {
          const appDate = new Date(app.appliedAt).toISOString().split('T')[0];
          return appDate === dateStr;
        }
        return false;
      }).length;
      applicationTrends.push({ date: dateStr, count });
    }

    return {
      totalApplications,
      thisWeekApplications,
      thisMonthApplications,
      responseRate: Math.round(responseRate * 100) / 100,
      interviewRate: Math.round(interviewRate * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      topCompanies,
      applicationsByStatus,
      applicationTrends
    };
  }

  async getUserMetrics(userId: string): Promise<UserMetrics> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const applications = await storage.getUserJobApplications(userId);
    const resumes = await storage.getUserResumes(userId);

    // Calculate profile completeness
    const profileFields = [
      user.fullName,
      user.email,
      user.phone,
      user.linkedin,
      user.desiredJobTitles,
      user.preferredLocations,
      user.industries,
      user.skills && user.skills.length > 0,
      resumes.length > 0
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompleteness = Math.round((completedFields / profileFields.length) * 100);

    // Calculate account age in days
    const accountAge = user.createdAt 
      ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      profileCompleteness,
      lastLoginDate: user.updatedAt ? new Date(user.updatedAt) : null,
      accountAge,
      subscriptionStatus: user.subscriptionStatus || 'inactive',
      totalJobsApplied: applications.length
    };
  }

  async getGlobalAnalytics() {
    // This would provide platform-wide analytics for admin users
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalApplications = await db.select({ count: count() }).from(jobApplications);
    
    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalApplications: totalApplications[0]?.count || 0,
      // Add more global metrics as needed
    };
  }
}

export const analyticsService = new AnalyticsService();