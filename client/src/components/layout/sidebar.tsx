import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  Bot,
  LayoutDashboardIcon,
  UserIcon,
  SearchIcon,
  BriefcaseIcon,
  SettingsIcon,
  LogOutIcon,
  CrownIcon
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
  { name: 'Job Search', href: '/job-search', icon: SearchIcon },
  { name: 'Applications', href: '/applications', icon: BriefcaseIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getInitials = (user: any) => {
    if (user?.fullName) {
      return user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (user: any) => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    return user?.email || 'User';
  };

  const getSubscriptionBadge = (plan: string) => {
    const planConfig = {
      'free': { label: 'Free', className: 'bg-gray-100 text-gray-700' },
      'monthly': { label: 'Pro', className: 'bg-primary text-primary-foreground' },
      'lifetime': { label: 'Lifetime', className: 'bg-yellow-500 text-white' }
    };
    
    const config = planConfig[plan as keyof typeof planConfig] || planConfig.free;
    return (
      <Badge className={`text-xs ${config.className}`}>
        {plan === 'lifetime' && <CrownIcon className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="sidebar-fixed bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <Bot className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold text-gray-900">AutoApply Pro</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || 
              (item.href !== '/' && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}>
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getDisplayName(user)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {getSubscriptionBadge(user?.subscriptionPlan || 'free')}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-2">
            <Link href="/subscribe">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
              >
                {user?.subscriptionPlan === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
