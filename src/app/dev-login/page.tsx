"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function DevLoginPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Get users from database
  const allUsers = useQuery(api.admin.getAllUsers, {});

  const mockLogin = (user: any) => {
    // Store mock auth state in localStorage for development
    localStorage.setItem('dev_user', JSON.stringify({
      id: user._id,
      email: user.email,
      role: user.role,
      isAuthenticated: true,
    }));
    setSelectedUser(user);
  };

  const clearAuth = () => {
    localStorage.removeItem('dev_user');
    setSelectedUser(null);
  };

  // Check current dev auth state
  const devUser = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('dev_user') || 'null')
    : null;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Development Login</h1>
          <p className="text-gray-600 mt-2">
            This is a development-only page to test the user management system
          </p>
          <Badge variant="outline" className="mt-2">DEV ONLY</Badge>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            {devUser ? (
              <div className="space-y-2">
                <p><strong>Logged in as:</strong> {devUser.email}</p>
                <p><strong>Role:</strong> {devUser.role}</p>
                <p><strong>User ID:</strong> {devUser.id}</p>
                <Button onClick={clearAuth} variant="outline" size="sm">
                  Clear Auth State
                </Button>
              </div>
            ) : (
              <p>No dev auth state set</p>
            )}
          </CardContent>
        </Card>

        {/* Available Users */}
        <Card>
          <CardHeader>
            <CardTitle>Available Test Users</CardTitle>
            <CardDescription>
              Click on a user to simulate being logged in as them
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allUsers ? (
              <div className="space-y-3">
                                 {allUsers.map((user: any) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      onClick={() => mockLogin(user)}
                      size="sm"
                      variant="outline"
                    >
                      Login as this user
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Loading users...</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/register'}
                variant="outline" 
                className="w-full justify-start"
              >
                → Test User Registration
              </Button>
              <Button 
                onClick={() => window.location.href = '/admin/users'}
                variant="outline" 
                className="w-full justify-start"
                disabled={!devUser || devUser.role !== 'admin'}
              >
                → Admin User Management
                {(!devUser || devUser.role !== 'admin') && ' (Need admin role)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 