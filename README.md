# AutoApply Pro - Automated Job Application Platform

AutoApply Pro is a comprehensive job application automation platform that streamlines the job search process with AI-powered responses, automated form filling, and advanced analytics.

## Features

### Core Functionality
- **User Authentication** - Secure login with Replit Auth
- **Resume Management** - Upload, manage, and auto-fill from resumes
- **AI-Powered Responses** - Generate tailored responses using Google Gemini 2.5 Flash
- **Application Tracking** - Track job applications with status updates and analytics
- **Email Notifications** - Automated email updates for application status changes

### Advanced Features
- **Browser Extension** - Firefox extension for automated form detection and filling
- **Job Portal Integration** - Search jobs across LinkedIn, Indeed, and Glassdoor
- **Advanced Analytics** - Comprehensive dashboard with insights and recommendations
- **Resume Parsing** - AI-powered extraction of resume data
- **Cover Letter Generation** - Automated cover letter creation for specific jobs
- **Subscription Management** - Stripe-powered subscription plans

### Browser Extension
- Detects job application forms automatically
- Auto-fills forms with user profile data
- Generates AI responses for application questions
- Works on major job sites (LinkedIn, Indeed, Glassdoor, Workday, etc.)

## Tech Stack

### Frontend
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Tailwind CSS + Shadcn/ui for styling
- React Hook Form for form management

### Backend
- Node.js with Express
- PostgreSQL with Drizzle ORM
- Google Gemini AI for response generation
- Stripe for payment processing
- Nodemailer for email notifications

### Browser Extension
- Manifest V3 for Firefox
- Content scripts for form detection
- Background service worker
- Popup interface

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key
- Stripe API keys (for subscriptions)

### Environment Variables
```
DATABASE_URL=postgresql://username:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
SESSION_SECRET=your_session_secret
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password
```

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:push`
5. Start the development server: `npm run dev`

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Login with Replit Auth
- `GET /api/logout` - Logout

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/photo` - Upload profile photo

### Resume Management
- `GET /api/resumes` - Get user resumes
- `POST /api/resumes` - Upload new resume
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resume/parse` - Parse resume with AI

### Job Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id/status` - Update application status

### AI Features
- `POST /api/ai/generate-response` - Generate AI response
- `POST /api/jobs/generate-cover-letter` - Generate cover letter
- `POST /api/jobs/calculate-match` - Calculate job match percentage

### Job Search
- `POST /api/jobs/search` - Search jobs across platforms
- `GET /api/analytics/applications` - Get application analytics
- `GET /api/analytics/metrics` - Get user metrics

### Subscriptions
- `POST /api/create-subscription` - Create Stripe subscription
- `POST /api/email/weekly-report` - Send weekly email report

## Browser Extension Installation

### Firefox
1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the `browser-extension` folder

### Chrome (Development)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` folder

## Subscription Plans

### Free Plan
- 5 applications per month
- Basic AI responses
- Limited analytics

### Pro Plan ($19/month)
- Unlimited applications
- Advanced AI features
- Full analytics dashboard
- Email notifications
- Priority support

### Lifetime Plan ($199 one-time)
- All Pro features
- Lifetime access
- Future feature updates

## Security Features

- Secure authentication with Replit Auth
- Encrypted user data storage
- HTTPS-only connections
- Session management with PostgreSQL
- Rate limiting on API endpoints

## Data Privacy

- User data is encrypted and stored securely
- No data sharing with third parties
- GDPR compliant data handling
- Users can export or delete their data

## Browser Extension Security

- Minimal permissions required
- No data stored locally
- Secure communication with main application
- Content scripts run in isolated environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support or questions:
- Email: support@autoapply-pro.com
- Documentation: https://docs.autoapply-pro.com
- GitHub Issues: https://github.com/autoapply-pro/issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

The application is designed to be deployed on Replit with automatic scaling and SSL certificates. Database migrations run automatically on deployment.

### Production Checklist
- [ ] Environment variables configured
- [ ] Database properly set up
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] Domain configured for Replit Auth
- [ ] Browser extension submitted to stores

## Roadmap

### Upcoming Features
- Chrome extension support
- Indeed API integration
- LinkedIn API integration
- Advanced job matching algorithms
- Team collaboration features
- API rate limiting improvements
- Mobile app (React Native)

### Version History
- v1.0.0 - Initial release with core features
- v1.1.0 - Added browser extension
- v1.2.0 - Advanced analytics and AI features
- v1.3.0 - Email notifications and job portal integration