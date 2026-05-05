"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResidentLoginPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'resident') {
      router.push('/resident/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated && user?.role === 'resident') {
    return null; // Will redirect
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Resident Login</CardTitle>
            <CardDescription>
              Access your resident dashboard and manage guest invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onSuccess={() => router.push('/resident/dashboard')} />
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-800 underline">
              Request registration
            </a>
          </p>
        </div>
      </div>
    </AppLayout>
  );
} 