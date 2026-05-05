"use client";

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InvitationManager } from '@/components/admin/InvitationManager';
import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Users, Home, User } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function ResidentDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Get current user and resident profile
  const currentUser = useQuery(api.auth.currentUser);
  const resident = useQuery(
    api.residents.getResidentProfile,
    currentUser ? { userId: undefined } : "skip"
  );
  
  // Loading state
  if (currentUser === undefined || (isAuthenticated && resident === undefined)) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto py-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-red-600">Authentication Required</CardTitle>
              <CardDescription>
                Please log in to access your resident dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm onSuccess={() => window.location.reload()} />
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/resident/login')}
                  className="w-full"
                >
                  Go to Resident Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // User authenticated but not a resident or no resident record found
  if (isAuthenticated && (!resident || currentUser?.role !== 'resident')) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto py-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-red-600">Access Error</CardTitle>
              <CardDescription>
                {currentUser?.role !== 'resident' 
                  ? "You are not registered as a resident. Please contact your estate administrator."
                  : "No resident record found. Please contact support for assistance."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Current user: {currentUser?.email} (Role: {currentUser?.role})
                </p>
                <div className="space-x-4">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/register')}
                  >
                    Request Registration
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/')}
                  >
                    Return Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Success - show resident dashboard (resident is guaranteed to exist here)
  if (!resident) return null; // Additional type guard

  return (
    <AppLayout>
      <div className="space-y-6 py-8">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-600" />
              Welcome, {resident.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Unit {resident.unitNumber}
              </span>
              {resident.estate && (
                <span>• {resident.estate.name}</span>
              )}
              {!resident.isVerified && (
                <span className="text-amber-600 font-medium">• Verification Pending</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-800">
                Manage your guest invitations below
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Create secure invitations with QR codes for your guests
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Alerts */}
        {!resident.isVerified && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-800">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="font-medium">Account Verification Pending</p>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Your resident account is awaiting verification by the estate administrator. 
                You can still create invitations, but some features may be limited.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Invitation Management */}
        <InvitationManager />
      </div>
    </AppLayout>
  );
} 