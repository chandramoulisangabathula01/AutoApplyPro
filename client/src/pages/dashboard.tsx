import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import { 
  Layers, 
  ReplyIcon, 
  CalendarIcon, 
  TrophyIcon,
  ArrowUpIcon,
  PlusIcon,
  BellIcon,
  Bot,
  BuildingIcon
} from "lucide-react";

export default function Dashboard() {
  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Calculate stats from applications
  const stats = {
    totalApplications: applications.length,
    responses: applications.filter((app: any) => app.status === 'under_review' || app.status === 'interview').length,
    interviews: applications.filter((app: any) => app.status === 'interview').length,
    successRate: applications.length > 0 ? Math.round((applications.filter((app: any) => app.status === 'interview' || app.status === 'offer').length / applications.length) * 100) : 0
  };

  const recentApplications = applications.slice(0, 3);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'outline' as const, label: 'Pending' },
      'applied': { variant: 'secondary' as const, label: 'Applied' },
      'under_review': { variant: 'default' as const, label: 'Under Review' },
      'interview': { variant: 'default' as const, label: 'Interview', className: 'bg-green-100 text-green-800' },
      'rejected': { variant: 'destructive' as const, label: 'Rejected' },
      'offer': { variant: 'default' as const, label: 'Offer', className: 'bg-green-500 text-white' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalApplications}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                <span>12% from last week</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Responses</p>
                  <p className="text-3xl font-bold text-foreground">{stats.responses}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <ReplyIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                <span>{stats.totalApplications > 0 ? Math.round((stats.responses / stats.totalApplications) * 100) : 0}% response rate</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                  <p className="text-3xl font-bold text-foreground">{stats.interviews}</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-full">
                  <CalendarIcon className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                <span>{stats.totalApplications > 0 ? Math.round((stats.interviews / stats.totalApplications) * 100) : 0}% interview rate</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold text-foreground">{stats.successRate}%</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                  <TrophyIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                <span>Above average</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications & AI Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications yet. Start applying to jobs!</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/job-search'}>
                    Search Jobs
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((application: any) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <BuildingIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{application.jobTitle}</h4>
                          <p className="text-sm text-muted-foreground">{application.company}</p>
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <Button variant="ghost" onClick={() => window.location.href = '/applications'}>
                      View All Applications
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card>
            <CardHeader>
              <CardTitle>AI Application Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="bg-primary rounded-full p-2 mr-3">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-2">
                      Ready to help you create compelling application responses! 
                      Upload your resume and set your preferences to get started.
                    </p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => window.location.href = '/profile'}
                      >
                        Complete Profile
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = '/job-search'}
                      >
                        Find Jobs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cover Letter Generation</span>
                  <span className="text-sm font-medium text-green-600">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auto-Fill Responses</span>
                  <span className="text-sm font-medium text-green-600">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Job Matching</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => window.location.href = '/job-search'}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Start Job Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
