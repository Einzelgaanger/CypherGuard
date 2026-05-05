import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
}

export function AppLayout({ children, className, showNavigation = false }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 mobile-safe tap-highlight-none",
      className
    )}>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                CypherSec Check-In
              </h1>
            </div>
            
            {showNavigation && (
              <div className="flex items-center">
                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-4">
                  <Button variant="ghost" size="sm" className="touch-target">
                    Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" className="touch-target">
                    Visitors
                  </Button>
                  <Button variant="ghost" size="sm" className="touch-target">
                    Reports
                  </Button>
                </nav>
                
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden touch-target"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile Navigation Menu */}
          {showNavigation && isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-3 space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start touch-target">
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start touch-target">
                Visitors
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start touch-target">
                Reports
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8",
        "smooth-scroll"
      )}>
        <div className="space-y-4 sm:space-y-6">
        {children}
        </div>
      </main>
    </div>
  );
} 