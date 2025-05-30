import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import { 
  TrendingUpIcon, 
  Users2Icon, 
  TargetIcon, 
  ClockIcon,
  BuildingIcon,
  PercentIcon,
  CalendarIcon,
  BarChart3Icon
} from "lucide-react";

interface ApplicationAnalytics {
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

interface UserMetrics {
  profileCompleteness: number;
  lastLoginDate: Date | null;
  accountAge: number;
  subscriptionStatus: string;
  totalJobsApplied: number;
}

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<ApplicationAnalytics>({
    queryKey: ["/api/analytics/applications"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<UserMetrics>({
    queryKey: ["/api/analytics/metrics"],
  });

  if (analyticsLoading || metricsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'applied': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-purple-100 text-purple-800',
      'interview': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'offer': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Analytics Dashboard" 
        subtitle="Track your job search performance and insights"
      />

      <div className="p-6 space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{analytics?.totalApplications || 0}</p>
                </div>
                <TargetIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">{analytics?.responseRate.toFixed(1) || 0}%</p>
                </div>
                <PercentIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interview Rate</p>
                  <p className="text-2xl font-bold">{analytics?.interviewRate.toFixed(1) || 0}%</p>
                </div>
                <Users2Icon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{analytics?.averageResponseTime.toFixed(0) || 0} days</p>
                </div>
                <ClockIcon className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="font-semibold">{analytics?.thisWeekApplications || 0} applications</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-semibold">{analytics?.thisMonthApplications || 0} applications</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {analytics?.successRate.toFixed(1) || 0}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users2Icon className="h-5 w-5 mr-2" />
                Profile Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profile Completeness</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${metrics?.profileCompleteness || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{metrics?.profileCompleteness || 0}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Account Age</span>
                  <span className="font-semibold">{metrics?.accountAge || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subscription</span>
                  <Badge variant="outline" className="capitalize">
                    {metrics?.subscriptionStatus || 'Free'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3Icon className="h-5 w-5 mr-2" />
                Applications by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.applicationsByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BuildingIcon className="h-5 w-5 mr-2" />
                Top Companies Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.topCompanies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                ) : (
                  analytics?.topCompanies.map((company, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{company.company}</span>
                      <Badge variant="outline">{company.count} applications</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUpIcon className="h-5 w-5 mr-2" />
              Application Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-1">
              {analytics?.applicationTrends.map((trend, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-blue-500 rounded-t w-full min-h-[4px]"
                    style={{ 
                      height: `${Math.max((trend.count / Math.max(...(analytics.applicationTrends.map(t => t.count)))) * 200, 4)}px` 
                    }}
                  ></div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(trend.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center mt-2">
              Daily application count over the last 30 days
            </div>
          </CardContent>
        </Card>

        {/* Insights and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics && analytics.responseRate < 10 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800">Improve Your Response Rate</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your current response rate is {analytics.responseRate.toFixed(1)}%. Consider customizing your applications more and following up with employers.
                  </p>
                </div>
              )}
              
              {metrics && metrics.profileCompleteness < 80 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800">Complete Your Profile</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your profile is {metrics.profileCompleteness}% complete. A complete profile helps with better job matching and auto-fill accuracy.
                  </p>
                </div>
              )}
              
              {analytics && analytics.thisWeekApplications === 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800">Stay Active</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    You haven't applied to any jobs this week. Consistent application activity improves your chances of landing interviews.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}