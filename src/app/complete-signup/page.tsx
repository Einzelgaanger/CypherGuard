"use client";

import { useState } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from 'convex/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppLayout } from '@/components/layout/AppLayout';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../../convex/_generated/api';

export default function CompleteSignupPage() {
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'enter-temp' | 'create-password' | 'complete'>('enter-temp');

  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pre-fill email if provided in URL
  const urlEmail = searchParams.get('email');
  
  // Query to check if temp credentials exist
  const pendingSetup = useQuery(
    api.admin.getPendingAuthSetup, 
    email ? { email } : "skip"
  );
  
  const markSetupUsed = useMutation(api.admin.markAuthSetupUsed);
  const createUserRole = useMutation(api.simpleAuth.createUserRole);

  // Set email from URL params
  useState(() => {
    if (urlEmail) {
      setEmail(urlEmail);
    }
  });

  const handleVerifyTempCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pendingSetup || Array.isArray(pendingSetup)) {
      setError('No pending setup found for this email address.');
      return;
    }

    if (pendingSetup.tempPassword !== tempPassword) {
      setError('Invalid temporary password. Please check with your administrator.');
      return;
    }

    if (pendingSetup.expiresAt < Date.now()) {
      setError('Temporary password has expired. Please contact your administrator.');
      return;
    }

    setStep('create-password');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Create the auth account
      await signIn("password", { 
        email, 
        password: newPassword,
        flow: "signUp"
      });

      // Create user role after successful auth account creation
      if (pendingSetup && !Array.isArray(pendingSetup)) {
        try {
          // Create user role with role information
          await createUserRole({
            email: pendingSetup.email,
            firstName: pendingSetup.firstName || "User",
            lastName: pendingSetup.lastName || "",
            role: pendingSetup.role || "guest",
          });
        } catch (profileError) {
          console.error("Failed to create user role:", profileError);
          // Continue - they can create role later
        }
      }

      // Mark the temporary setup as used
      await markSetupUsed({ email });
      
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (step === 'complete') {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto py-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold text-green-800">
                Account Created Successfully!
              </CardTitle>
              <CardDescription className="text-green-700">
                Your account has been set up and you're now logged in.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">
              Complete Your Registration
            </CardTitle>
            <CardDescription>
              {step === 'enter-temp' 
                ? "Enter the temporary credentials provided by your administrator"
                : "Create a secure password for your account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'enter-temp' ? (
              <form onSubmit={handleVerifyTempCredentials} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tempPassword">Temporary Password</Label>
                  <Input
                    id="tempPassword"
                    type="password"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="Enter temporary password"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    This was provided by your administrator when your account was approved.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full">
                  Verify Credentials
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a secure password"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Must be at least 8 characters long.
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('enter-temp')}
                  className="w-full"
                >
                  Back
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 