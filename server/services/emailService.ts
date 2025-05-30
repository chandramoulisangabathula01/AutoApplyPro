import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const config: EmailConfig = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      };

      this.transporter = nodemailer.createTransport(config);
    }
  }

  async sendApplicationStatusUpdate(
    userEmail: string,
    userName: string,
    jobTitle: string,
    company: string,
    newStatus: string
  ) {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return false;
    }

    const statusMessages = {
      under_review: 'Your application is now under review',
      interview: 'Congratulations! You have an interview opportunity',
      offer: 'Amazing news! You received a job offer',
      rejected: 'Unfortunately, your application was not selected'
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || 'Your application status has been updated';

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: userEmail,
        subject: `Application Update: ${jobTitle} at ${company}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Status Update</h2>
            <p>Hi ${userName},</p>
            <p>${message} for the position of <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
            <p>You can view more details in your AutoApply Pro dashboard.</p>
            <p>Best of luck!</p>
            <p>The AutoApply Pro Team</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWeeklyReport(
    userEmail: string,
    userName: string,
    stats: {
      applicationsThisWeek: number;
      totalApplications: number;
      responses: number;
      interviews: number;
    }
  ) {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Your Weekly Job Search Report',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Weekly Job Search Report</h2>
            <p>Hi ${userName},</p>
            <p>Here's your job search progress for this week:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>This Week's Activity</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>${stats.applicationsThisWeek}</strong> new applications submitted</li>
                <li style="margin: 10px 0;"><strong>${stats.responses}</strong> responses received</li>
                <li style="margin: 10px 0;"><strong>${stats.interviews}</strong> interviews scheduled</li>
              </ul>
            </div>
            <p>Total applications to date: <strong>${stats.totalApplications}</strong></p>
            <p>Keep up the great work! Visit your dashboard to track your progress.</p>
            <p>The AutoApply Pro Team</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send weekly report:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();