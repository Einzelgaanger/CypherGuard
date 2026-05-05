"use client";

import { SelfRegistrationForm } from '@/components/auth/SelfRegistrationForm';
import { AppLayout } from '@/components/layout/AppLayout';

export default function RegisterPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">
            Request access to the CypherSec Check-In system. Your request will be reviewed by an administrator.
          </p>
        </div>

        <SelfRegistrationForm />
      </div>
    </AppLayout>
  );
} 