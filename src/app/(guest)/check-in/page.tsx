"use client";

import { useState } from 'react';
import { GuestRegistrationForm } from '@/components/forms/GuestRegistrationForm';
import { DigitalPass } from '@/components/guest/DigitalPass';
import { AppLayout } from '@/components/layout/AppLayout';

// TODO: Replace with actual estate ID from environment or routing
const DEFAULT_ESTATE_ID = "k170xnrdb0eppstrtwxvn7yyf97mdkse" as any;

export default function CheckInPage() {
  const [registrationData, setRegistrationData] = useState<any>(null);

  const handleRegistrationSuccess = (data: any) => {
    setRegistrationData(data);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guest Check-In</h1>
          <p className="text-gray-600 mt-2">
            Welcome! Please complete your registration to check in.
          </p>
        </div>

        {registrationData ? (
          <DigitalPass
            visitData={registrationData.digitalPass}
            guestData={registrationData.guest}
            onClose={() => setRegistrationData(null)}
          />
        ) : (
          <GuestRegistrationForm
            onSuccess={handleRegistrationSuccess}
            estateId={DEFAULT_ESTATE_ID}
          />
        )}
      </div>
    </AppLayout>
  );
} 