"use client";

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Home as HomeIcon,
  ArrowRight,
  Bug,
  Keyboard
} from 'lucide-react';

export default function Home() {
  const userTypes = [
    {
      title: "Guest Check-In",
      description: "Register as a visitor to the estate",
      icon: Users,
      href: "/check-in",
      variant: "default" as const,
      features: ["Photo upload", "Digital pass", "QR code generation"]
    },
    {
      title: "Dashboard Portal", 
      description: "Access resident or admin dashboards",
      icon: HomeIcon,
      href: "/dashboard",
      variant: "outline" as const,
      features: ["Role-based access", "Dashboard selection", "Secure navigation"]
    },
    {
      title: "Admin Dashboard",
      description: "Monitor and manage all visitors",
      icon: Shield,
      href: "/admin/dashboard", 
      variant: "secondary" as const,
      features: ["Real-time monitoring", "Visitor checkout", "Reports"]
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              CypherSec Check-In System
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Digital visitor management for gated estates. Secure, efficient, and audit-ready.
            </p>
          </div>
          
          {/* Phase 2 Status */}
          <div className="flex justify-center">
            <Badge variant="outline" className="text-sm px-4 py-2">
              Phase 2: Core Features Complete ✅
            </Badge>
          </div>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {userTypes.map((userType) => (
            <Card key={userType.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <userType.icon className="w-6 h-6 text-gray-600" />
                </div>
                <CardTitle className="text-xl">{userType.title}</CardTitle>
                <CardDescription>{userType.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  {userType.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={userType.href}>
                  <Button variant={userType.variant} className="w-full group">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Development Info */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Bug className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-medium text-orange-800">Development Mode</h3>
              </div>
              <p className="text-orange-700">
                Use the debug menu for easy navigation between all implemented pages.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
                <Keyboard className="w-4 h-4" />
                <span>Press</span>
                <kbd className="px-2 py-1 bg-orange-100 rounded text-xs">Ctrl+D</kbd>
                <span>or</span>
                <kbd className="px-2 py-1 bg-orange-100 rounded text-xs">⌘+D</kbd>
                <span>to open debug menu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <div className="text-center space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Implemented Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Guest Registration", 
              "Photo Upload", 
              "QR Code Generation",
              "Digital Passes",
              "Invitation Management",
              "Real-time Monitoring", 
              "Admin Dashboard",
              "Audit Logging"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
