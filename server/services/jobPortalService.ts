import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary?: string;
  url: string;
  postedDate: Date;
  source: 'linkedin' | 'indeed' | 'glassdoor';
}

export interface JobSearchParams {
  keywords: string;
  location?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  datePosted?: string;
}

export class JobPortalService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async searchLinkedInJobs(params: JobSearchParams): Promise<Job[]> {
    // LinkedIn Jobs API integration would go here
    // This requires LinkedIn API credentials and proper authentication
    console.log('LinkedIn API integration not configured');
    return [];
  }

  async searchIndeedJobs(params: JobSearchParams): Promise<Job[]> {
    // Indeed API integration would go here
    // This requires Indeed Publisher API credentials
    console.log('Indeed API integration not configured');
    return [];
  }

  async searchGlassdoorJobs(params: JobSearchParams): Promise<Job[]> {
    // Glassdoor API integration would go here
    // This requires Glassdoor API credentials
    console.log('Glassdoor API integration not configured');
    return [];
  }

  async searchAllPortals(params: JobSearchParams): Promise<Job[]> {
    const [linkedinJobs, indeedJobs, glassdoorJobs] = await Promise.all([
      this.searchLinkedInJobs(params),
      this.searchIndeedJobs(params),
      this.searchGlassdoorJobs(params)
    ]);

    return [...linkedinJobs, ...indeedJobs, ...glassdoorJobs];
  }

  async calculateJobMatch(job: Job, userProfile: any): Promise<number> {
    if (!userProfile) return 0;

    const prompt = `
    Analyze how well this job matches the user's profile and return a match percentage (0-100).

    Job Details:
    - Title: ${job.title}
    - Company: ${job.company}
    - Description: ${job.description}
    - Requirements: ${job.requirements}

    User Profile:
    - Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
    - Desired Job Titles: ${userProfile.desiredJobTitles || 'Not specified'}
    - Preferred Locations: ${userProfile.preferredLocations || 'Not specified'}
    - Industries: ${userProfile.industries || 'Not specified'}

    Return only a number between 0-100 representing the match percentage.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const matchPercentage = parseInt(response.replace(/\D/g, ''));
      return Math.min(Math.max(matchPercentage || 0, 0), 100);
    } catch (error) {
      console.error('Error calculating job match:', error);
      return 0;
    }
  }

  async generateCoverLetter(job: Job, userProfile: any): Promise<string> {
    const prompt = `
    Generate a professional cover letter for this job application.

    Job Details:
    - Title: ${job.title}
    - Company: ${job.company}
    - Description: ${job.description}

    User Profile:
    - Name: ${userProfile.fullName || userProfile.firstName + ' ' + userProfile.lastName}
    - Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
    - Desired Job Titles: ${userProfile.desiredJobTitles || 'Not specified'}

    Write a compelling cover letter that highlights relevant experience and skills.
    Keep it professional, concise (3-4 paragraphs), and personalized to the company and role.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating cover letter:', error);
      return '';
    }
  }
}

export const jobPortalService = new JobPortalService();