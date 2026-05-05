"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Home, 
  Bug,
  Keyboard,
  ExternalLink,
  UserPlus,
  Settings,
  LogIn
} from 'lucide-react';

export function DebugMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Toggle debug menu with Ctrl/Cmd + D
  useEffect(() => {
    if (!isClient) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClient]);

  const navigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  // Don't render anything on the server or before client hydration
  if (!isClient) {
    return null;
  }

  const debugRoutes = [
    {
      category: "Main Pages",
      icon: Home,
      routes: [
        {
          name: "Homepage",
          path: "/",
          description: "Main landing page with navigation overview",
          icon: Home,
        },
      ],
    },
    {
      category: "Guest Pages",
      icon: Users,
      routes: [
        {
          name: "Walk-in Check-in",
          path: "/check-in",
          description: "Guest registration form with photo upload and digital pass",
          icon: UserCheck,
        },
        {
          name: "Pre-invited Guest",
          path: "/invitation/sample-token-123",
          description: "Check-in flow for guests with invitation tokens",
          icon: ExternalLink,
        },
        {
          name: "User Registration",
          path: "/register",
          description: "Self-registration form for new users requesting system access",
          icon: UserPlus,
        },
      ],
    },
    {
      category: "Authentication Pages",
      icon: LogIn,
      routes: [
        {
          name: "Resident Login",
          path: "/resident/login",
          description: "Dedicated login page for residents with authentication flow",
          icon: LogIn,
        },
        {
          name: "Complete Signup",
          path: "/complete-signup",
          description: "Account setup page for approved users with temporary credentials",
          icon: UserPlus,
        },
        {
          name: "Dev Login",
          path: "/dev-login",
          description: "Development-only login page for testing user roles",
          icon: Bug,
        },
      ],
    },
    {
      category: "Dashboard Pages", 
      icon: Shield,
      routes: [
        {
          name: "Main Dashboard",
          path: "/dashboard",
          description: "Dashboard selection page for role-based access",
          icon: Shield,
        },
        {
          name: "Resident Dashboard",
          path: "/resident/dashboard",
          description: "Invitation management and resident overview with authentication",
          icon: Home,
        },
        {
          name: "Admin Dashboard",
          path: "/admin/dashboard", 
          description: "Real-time visitor monitoring and management",
          icon: Shield,
        },
        {
          name: "User Management",
          path: "/admin/users",
          description: "Admin interface for managing user registration requests and accounts",
          icon: Settings,
        },
      ],
    },
    {
      category: "Development Tools",
      icon: Settings,
      routes: [
        {
          name: "Database Migration",
          path: "/migration",
          description: "Database cleanup utilities and admin user creation for testing",
          icon: Settings,
        },
      ],
    },
  ];

  // Only show in development (more permissive check)
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost')
  );
  
  // Show debug menu in development or on localhost
  if (isProduction && !isLocalhost) {
    return null;
  }

  // Debug logging (will be visible in browser console)
  if (isClient) {
    console.log('🐛 Debug Menu Status:', { 
      NODE_ENV: process.env.NODE_ENV, 
      isProduction, 
      isDevelopment, 
      isLocalhost,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
    });
  }

  return (
    <>
      {/* Debug toggle button - fixed position */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg border-orange-200 hover:bg-orange-50"
          title="Debug Menu (Ctrl/Cmd + D)"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>

      {/* Debug status indicator */}
      <div className="fixed bottom-16 right-4 z-40 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow border">
        🐛 Debug Active
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-orange-600" />
              Debug Navigation Menu
              <Badge variant="secondary">Development</Badge>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Quick navigation to all implemented pages for testing and development.
              <div className="flex items-center gap-1 mt-2 text-xs">
                <Keyboard className="w-3 h-3" />
                Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Ctrl+D</kbd> or{' '}
                <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">⌘+D</kbd> to toggle
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6">
            {debugRoutes.map((category) => (
              <Card key={category.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <category.icon className="w-5 h-5" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {category.routes.map((route) => (
                    <div
                      key={route.path}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <route.icon className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{route.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {route.description}
                          </p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            {route.path}
                          </code>
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate(route.path)}
                        size="sm"
                        variant="outline"
                      >
                        Visit
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Additional Debug Info */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="text-sm text-orange-800">
                  <h4 className="font-medium mb-2">📝 Implementation Status</h4>
                  <ul className="space-y-1 text-xs">
                    <li>✅ Phase 2 Core Features Completed</li>
                    <li>✅ Guest Registration with Photo Upload</li>
                    <li>✅ Digital Pass with QR Code Generation</li>
                    <li>✅ Resident Dashboard with Authentication</li>
                    <li>✅ Admin Dashboard with Real-time Interface</li>
                    <li>✅ Phase 3.7.1 User Management System</li>
                    <li>✅ Self-Registration with Admin Approval</li>
                    <li>✅ User Management Fixes & Authentication Flow</li>
                    <li>✅ Resident Login Page & TypeScript Fixes</li>
                    <li>✅ End-to-End User Journey Complete</li>
                    <li>🔄 Production Auth Account Creation Pending</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 