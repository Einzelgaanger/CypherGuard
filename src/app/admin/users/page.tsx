"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { UserManagementDashboard } from '@/components/admin/UserManagementDashboard';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppLayout } from '@/components/layout/AppLayout';

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>
          <LoginForm onSuccess={() => {}} />
        </div>
      </AppLayout>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>This area is for administrators only.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user registration requests and existing user accounts.
          </p>
        </div>
        
        <UserManagementDashboard />
      </div>
    </AppLayout>
  );
} 