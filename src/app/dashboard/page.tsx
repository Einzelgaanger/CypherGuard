"use client";

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Home, ArrowRight, Users } from 'lucide-react';

export default function DashboardPage() {
  const dashboardOptions = [
    {
      title: "Resident Dashboard",
      description: "Manage guest invitations and view your visits",
      href: "/resident/dashboard",
      icon: Home,
      features: ["Create invitations", "Share guest links", "Track visitor history"],
      color: "blue"
    },
    {
      title: "Admin Dashboard", 
      description: "Monitor and manage all estate visitors",
      href: "/admin/dashboard",
      icon: Shield,
      features: ["Real-time monitoring", "Visitor check-out", "Security oversight"],
      color: "red"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            CypherSec Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your dashboard based on your role in the estate management system.
          </p>
        </div>

        {/* Dashboard Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {dashboardOptions.map((option) => (
            <Card key={option.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 w-16 h-16 rounded-lg flex items-center justify-center ${
                  option.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  <option.icon className={`w-8 h-8 ${
                    option.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                  }`} />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-base">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Link href={option.href}>
                  <Button 
                    className={`w-full group ${
                      option.color === 'blue' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    Access {option.title}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Quick Actions</h3>
          <div className="flex justify-center gap-4">
            <Link href="/check-in">
              <Button variant="outline">
                Guest Check-In
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>

        {/* Info Note */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center text-blue-800">
                <h4 className="font-medium mb-2">🔐 Role-Based Access</h4>
                <p className="text-sm">
                  Each dashboard provides role-specific functionality. Choose the appropriate 
                  dashboard for your responsibilities within the estate management system.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 