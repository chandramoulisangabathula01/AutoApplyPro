import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import { CheckIcon, CrownIcon, ZapIcon } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripePublicKey) {
  console.warn('VITE_STRIPE_PUBLIC_KEY not found in environment variables');
}
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const SubscribeForm = ({ priceId, planName }: { priceId: string; planName: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/settings',
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: `You are now subscribed to ${planName}!`,
      });
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full"
      >
        {isLoading ? "Processing..." : `Subscribe to ${planName}`}
      </Button>
    </form>
  );
};

const PlanCard = ({ 
  title, 
  price, 
  period, 
  features, 
  isPopular, 
  onSelect,
  priceId 
}: { 
  title: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  onSelect: (priceId: string, planName: string) => void;
  priceId: string;
}) => (
  <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <Badge className="bg-primary text-primary-foreground">
          <CrownIcon className="h-3 w-3 mr-1" />
          Most Popular
        </Badge>
      </div>
    )}
    <CardHeader>
      <CardTitle className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <div className="text-3xl font-bold text-foreground mb-1">{price}</div>
        <div className="text-muted-foreground">{period}</div>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        onClick={() => onSelect(priceId, title)}
        className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
        variant={isPopular ? 'default' : 'outline'}
      >
        {title === 'Free Trial' ? 'Start Free Trial' : `Choose ${title}`}
      </Button>
    </CardContent>
  </Card>
);

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<{ priceId: string; planName: string } | null>(null);
  const { toast } = useToast();

  const handlePlanSelect = async (priceId: string, planName: string) => {
    if (planName === 'Free Trial') {
      // Handle free trial signup
      window.location.href = '/profile';
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/create-subscription", { priceId });
      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setSelectedPlan({ priceId, planName });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    }
  };

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Subscribe" subtitle="Choose your plan" />
        <div className="p-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Payment System Not Configured</h3>
              <p className="text-muted-foreground">
                The payment system is not currently configured. Please contact support for assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (clientSecret && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Complete Your Subscription" />
        <div className="p-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment for {selectedPlan.planName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm priceId={selectedPlan.priceId} planName={selectedPlan.planName} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Choose Your Plan" subtitle="Start free, upgrade when you're ready" />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Feature Highlight */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-8 mb-8 text-white text-center">
          <ZapIcon className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Supercharge Your Job Search</h2>
          <p className="text-lg opacity-90">
            Let AI handle the heavy lifting while you focus on landing your dream job
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PlanCard
            title="Free Trial"
            price="$0"
            period="7 days free"
            features={[
              "5 job applications",
              "Basic profile setup",
              "Application tracking",
              "Email support"
            ]}
            onSelect={handlePlanSelect}
            priceId="free"
          />

          <PlanCard
            title="Monthly Pro"
            price="$29"
            period="per month"
            features={[
              "Unlimited job applications",
              "AI response generation",
              "Browser extension access",
              "Advanced application tracking",
              "Priority email support",
              "Weekly progress reports"
            ]}
            isPopular={true}
            onSelect={handlePlanSelect}
            priceId="price_monthly_pro"
          />

          <PlanCard
            title="Lifetime Access"
            price="$299"
            period="one-time payment"
            features={[
              "Everything in Monthly Pro",
              "Lifetime updates",
              "Advanced AI features",
              "Premium support",
              "Early access to new features",
              "Custom integrations"
            ]}
            onSelect={handlePlanSelect}
            priceId="price_lifetime"
          />
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">Can I cancel anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, debit cards, and digital wallets through our secure payment processor.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">Is the browser extension included?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, the Firefox browser extension is included with all paid plans. Chrome extension coming soon.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">Do you offer refunds?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
