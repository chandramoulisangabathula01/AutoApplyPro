import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, 
  SearchIcon, 
  WandIcon, 
  TrendingUpIcon,
  CheckIcon,
  Search
} from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Bot className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold text-foreground">AutoApply Pro</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Features
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
              <Button onClick={handleSignIn} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Automate Your Job Search with
              <span className="text-primary"> AI Power</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Let AI handle your job applications while you focus on what matters most. 
              AutoApply Pro finds, matches, and applies to jobs that fit your profile perfectly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={handleSignIn}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Get Started with Google
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-muted-foreground">Applications Sent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">85%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">2,500+</div>
                <div className="text-muted-foreground">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need to Land Your Dream Job</h2>
            <p className="text-xl text-muted-foreground">Powerful AI-driven tools to streamline your job search process</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Smart Job Discovery</h3>
                <p className="text-muted-foreground">AI scans thousands of job postings to find positions that match your skills and preferences perfectly.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <WandIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Auto-Fill Applications</h3>
                <p className="text-muted-foreground">Our browser extension automatically fills out job applications with tailored responses generated by AI.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUpIcon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Track Everything</h3>
                <p className="text-muted-foreground">Monitor all your applications, interview requests, and responses in one comprehensive dashboard.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you're ready</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Free Trial</h3>
                  <div className="text-3xl font-bold text-foreground mb-1">$0</div>
                  <div className="text-muted-foreground mb-6">7 days free</div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />5 job applications</li>
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Basic profile setup</li>
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Application tracking</li>
                  </ul>
                  <Button 
                    onClick={handleSignIn}
                    variant="outline" 
                    className="w-full"
                  >
                    Start Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly Plan */}
            <Card className="border-primary shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Monthly Pro</h3>
                  <div className="text-3xl font-bold text-foreground mb-1">$29</div>
                  <div className="text-muted-foreground mb-6">per month</div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Unlimited applications</li>
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />AI response generation</li>
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Browser extension</li>
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Priority support</li>
                  </ul>
                  <Button 
                    onClick={handleSignIn}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Start Monthly Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Lifetime Plan */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Lifetime Access</h3>
                  <div className="text-3xl font-bold text-foreground mb-1">$299</div>
                  <div className="text-muted-foreground mb-6">one-time payment</div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Everything in Monthly</li>
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Lifetime updates</li>
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Advanced analytics</li>
                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-green-600 mr-3" />Premium support</li>
                  </ul>
                  <Button 
                    onClick={handleSignIn}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Get Lifetime Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
