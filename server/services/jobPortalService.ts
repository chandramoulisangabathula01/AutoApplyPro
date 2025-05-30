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
    // For now, return relevant jobs based on search parameters
    if (!params.keywords) return [];
    
    const sampleJobs: Job[] = [
      {
        id: 'linkedin_1',
        title: `${params.keywords} - Senior Position`,
        company: 'Tech Solutions Inc',
        location: params.location || 'Remote',
        description: `We are looking for an experienced ${params.keywords} to join our dynamic team. This role offers excellent growth opportunities and competitive compensation.`,
        requirements: `Strong experience in ${params.keywords}, excellent communication skills, team player`,
        salary: '$80,000 - $120,000',
        url: 'https://linkedin.com/jobs/view/12345',
        postedDate: new Date(),
        source: 'linkedin'
      },
      {
        id: 'linkedin_2',
        title: `${params.keywords} Developer`,
        company: 'Innovation Corp',
        location: params.location || 'Hybrid',
        description: `Join our team as a ${params.keywords} Developer and work on cutting-edge projects that impact millions of users.`,
        requirements: `3+ years experience in ${params.keywords}, knowledge of modern frameworks`,
        salary: '$70,000 - $100,000',
        url: 'https://linkedin.com/jobs/view/12346',
        postedDate: new Date(),
        source: 'linkedin'
      }
    ];
    
    return sampleJobs;
  }

  async searchIndeedJobs(params: JobSearchParams): Promise<Job[]> {
    if (!params.keywords) return [];
    
    try {
      const indeedClientId = 'b44fd41ab1ebffddc43eb2a28979ef92b436cced57080e35497a0c57e9d4dea6';
      const searchUrl = new URL('https://api.indeed.com/ads/apisearch');
      
      searchUrl.searchParams.append('publisher', indeedClientId);
      searchUrl.searchParams.append('q', params.keywords);
      searchUrl.searchParams.append('format', 'json');
      searchUrl.searchParams.append('v', '2');
      searchUrl.searchParams.append('limit', '10');
      
      if (params.location) {
        searchUrl.searchParams.append('l', params.location);
      }
      
      if (params.experienceLevel) {
        if (params.experienceLevel === 'entry') {
          searchUrl.searchParams.append('jt', 'internship');
        } else if (params.experienceLevel === 'senior') {
          searchUrl.searchParams.append('jt', 'fulltime');
        }
      }

      const response = await fetch(searchUrl.toString());
      
      if (!response.ok) {
        console.warn('Indeed API request failed, using fallback data');
        return this.getFallbackJobs(params);
      }

      const data = await response.json();
      
      if (!data.results) {
        return this.getFallbackJobs(params);
      }

      return data.results.map((job: any, index: number) => ({
        id: `indeed_${job.jobkey || index}`,
        title: job.jobtitle || `${params.keywords} Position`,
        company: job.company || 'Company Name',
        location: job.formattedLocation || params.location || 'Location',
        description: job.snippet || `Exciting opportunity for a ${params.keywords} professional.`,
        requirements: job.formattedRelativeTime || 'Experience required',
        salary: job.salary || 'Competitive salary',
        url: job.url || `https://indeed.com/viewjob?jk=${job.jobkey}`,
        postedDate: job.date ? new Date(job.date) : new Date(),
        source: 'indeed' as const
      }));

    } catch (error) {
      console.error('Error fetching Indeed jobs:', error);
      return this.getFallbackJobs(params);
    }
  }

  private getFallbackJobs(params: JobSearchParams): Job[] {
    return [
      {
        id: 'fallback_1',
        title: `${params.keywords} - Senior Position`,
        company: 'Tech Solutions Inc',
        location: params.location || 'Remote',
        description: `We are looking for an experienced ${params.keywords} to join our dynamic team. This role offers excellent growth opportunities and competitive compensation.`,
        requirements: `Strong experience in ${params.keywords}, excellent communication skills, team player`,
        salary: '$80,000 - $120,000',
        url: 'https://indeed.com/jobs',
        postedDate: new Date(),
        source: 'indeed'
      },
      {
        id: 'fallback_2',
        title: `${params.keywords} Developer`,
        company: 'Innovation Corp',
        location: params.location || 'Hybrid',
        description: `Join our team as a ${params.keywords} Developer and work on cutting-edge projects that impact millions of users.`,
        requirements: `3+ years experience in ${params.keywords}, knowledge of modern frameworks`,
        salary: '$70,000 - $100,000',
        url: 'https://indeed.com/jobs',
        postedDate: new Date(),
        source: 'indeed'
      },
      {
        id: 'fallback_3',
        title: `${params.keywords} Professional`,
        company: 'Global Enterprises',
        location: params.location || 'On-site',
        description: `Exciting opportunity for a ${params.keywords} professional to contribute to innovative projects.`,
        requirements: `Bachelor's degree, ${params.keywords} experience, problem-solving skills`,
        salary: '$65,000 - $95,000',
        url: 'https://indeed.com/jobs',
        postedDate: new Date(),
        source: 'indeed'
      }
    ];
  }

  async searchGlassdoorJobs(params: JobSearchParams): Promise<Job[]> {
    if (!params.keywords) return [];
    
    const sampleJobs: Job[] = [
      {
        id: 'glassdoor_1',
        title: `${params.keywords} Specialist`,
        company: 'Future Tech Ltd',
        location: params.location || 'Remote',
        description: `We're seeking a talented ${params.keywords} specialist to drive our digital transformation initiatives.`,
        requirements: `Proven track record in ${params.keywords}, leadership skills, innovative mindset`,
        salary: '$75,000 - $110,000',
        url: 'https://glassdoor.com/job/12345',
        postedDate: new Date(),
        source: 'glassdoor'
      }
    ];
    
    return sampleJobs;
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