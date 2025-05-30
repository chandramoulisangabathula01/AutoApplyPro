import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BellIcon,
  PlusIcon,
  MenuIcon
} from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <BellIcon className="h-5 w-5 text-gray-400" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              3
            </Badge>
          </Button>

          {/* Custom Action */}
          {action || (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Application
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
