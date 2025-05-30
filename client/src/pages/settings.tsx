import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/header";
import { 
  CreditCardIcon, 
  BellIcon, 
  ShieldIcon, 
  LogOutIcon,
  CrownIcon,
  ExternalLinkIcon
} from "lucide-react";

export default function Settings() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getSubscriptionBadge = (plan: string) => {
    const planConfig = {
      'free': { variant: 'outline' as const, label: 'Free Trial', className: 'border-gray-300' },
      'monthly': { variant: 'default' as const, label: 'Monthly Pro', className: 'bg-primary text-primary-foreground' },
      'lifetime': { variant: 'default' as const, label: 'Lifetime Access', className: 'bg-yellow-500 text-white' }
    };
    
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.free;
    return (
      <Badge variant={config.variant} className={config.className}>
        <CrownIcon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-foreground">Current Plan</h3>
                  {getSubscriptionBadge(user?.subscriptionPlan || 'free')}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.subscriptionPlan === 'free' 
                    ? 'Upgrade to unlock unlimited features'
                    : user?.subscriptionPlan === 'monthly'
                    ? 'Billed monthly • Next billing date: Next month'
                    : 'Lifetime access • No recurring charges'
                  }
                </p>
              </div>
              <Button onClick={() => window.location.href = '/subscribe'}>
                {user?.subscriptionPlan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
              </Button>
            </div>

            {/* Plan Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-foreground">5</div>
                <div className="text-sm text-muted-foreground">
                  {user?.subscriptionPlan === 'free' ? 'Applications Left' : 'Applications This Month'}
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-foreground">✓</div>
                <div className="text-sm text-muted-foreground">
                  {user?.subscriptionPlan === 'free' ? 'Basic Features' : 'All Features'}
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {user?.subscriptionPlan === 'free' ? '✗' : '✓'}
                </div>
                <div className="text-sm text-muted-foreground">AI Responses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BellIcon className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your applications
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="job-alerts" className="text-sm font-medium">
                  Job Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about new job matches
                </p>
              </div>
              <Switch id="job-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ai-suggestions" className="text-sm font-medium">
                  AI Suggestions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive AI-powered application suggestions
                </p>
              </div>
              <Switch id="ai-suggestions" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-reports" className="text-sm font-medium">
                  Weekly Reports
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get weekly summaries of your job search progress
                </p>
              </div>
              <Switch id="weekly-reports" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldIcon className="h-5 w-5 mr-2" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visibility" className="text-sm font-medium">
                  Profile Visibility
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow your profile to be visible to potential employers
                </p>
              </div>
              <Switch id="profile-visibility" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-sharing" className="text-sm font-medium">
                  Data Sharing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data to improve AI recommendations
                </p>
              </div>
              <Switch id="data-sharing" defaultChecked />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Download Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Export all your application data and profile information
                  </p>
                </div>
                <Button variant="outline">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Browser Extension */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Extension</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-2">AutoApply Pro Extension</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Install our browser extension to auto-fill job applications with AI-generated responses
                </p>
                <div className="flex space-x-2">
                  <Badge variant="outline">Firefox</Badge>
                  <Badge variant="outline">Chrome (Coming Soon)</Badge>
                </div>
              </div>
              <Button>
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Install Extension
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Sign Out</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of your AutoApply Pro account
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
