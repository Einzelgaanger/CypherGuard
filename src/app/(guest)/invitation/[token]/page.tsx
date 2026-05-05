"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { GuestRegistrationForm } from '@/components/forms/GuestRegistrationForm';
import { DigitalPass } from '@/components/guest/DigitalPass';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  Car, 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';

// TODO: Replace with actual estate ID from environment or routing
const DEFAULT_ESTATE_ID = "k170xnrdb0eppstrtwxvn7yyf97mdkse" as any;

interface InvitationPageProps {
  params: { token: string };
}

export default function InvitationPage({ params }: InvitationPageProps) {
  const [registrationData, setRegistrationData] = useState<any>(null);
  
  // Query to validate invitation token
  const invitationData = useQuery(api.guests.validateInvitation, { token: params.token });

  const handleRegistrationSuccess = (data: any) => {
    setRegistrationData(data);
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getInvitationStatus = () => {
    if (!realInvitationData || 'error' in realInvitationData) return null;
    
    const now = Date.now();
    if (realInvitationData.isUsed) {
      return { label: 'Already Used', variant: 'destructive' as const, icon: XCircle };
    }
    if (realInvitationData.expiresAt < now) {
      return { label: 'Expired', variant: 'destructive' as const, icon: XCircle };
    }
    if (realInvitationData.arrivalWindow && realInvitationData.arrivalWindow.from > now) {
      return { label: 'Not Yet Valid', variant: 'secondary' as const, icon: Clock };
    }
    return { label: 'Valid', variant: 'default' as const, icon: CheckCircle };
  };

  // Use real invitation data or show loading/error states
  const realInvitationData = invitationData;

  const status = getInvitationStatus();
  const isValid = status?.label === 'Valid';

  // Loading state
  if (invitationData === undefined) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Validating invitation...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Invalid invitation
  if (!realInvitationData || 'error' in realInvitationData) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-8">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                This invitation token is invalid or has been tampered with.
              </p>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Token: </span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{params.token}</code>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.href = '/check-in'}
              >
                Walk-in Registration
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        {/* Invitation Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Pre-Authorized Invitation
              </CardTitle>
              {status && (
                <Badge variant={status.variant} className="flex items-center gap-1">
                  <status.icon className="w-3 h-3" />
                  {status.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Expected Guest:</span>
                  <span>{realInvitationData?.guestName || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">ID Number:</span>
                  <span>{realInvitationData?.guestIdNumber || 'N/A'}</span>
                </div>

                {realInvitationData?.vehicleRegistration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Vehicle:</span>
                    <span>{realInvitationData.vehicleRegistration}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Valid From:</span>
                  <span className="text-xs">{realInvitationData?.arrivalWindow ? formatDateTime(realInvitationData.arrivalWindow.from) : 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Valid Until:</span>
                  <span className="text-xs">{realInvitationData?.arrivalWindow ? formatDateTime(realInvitationData.arrivalWindow.to) : 'N/A'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Host:</span>
                  <span>{realInvitationData?.resident?.name || 'N/A'} ({realInvitationData?.resident?.unitNumber || 'N/A'})</span>
                </div>
              </div>
            </div>

            {!isValid && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Invitation Not Currently Valid
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {status?.label === 'Already Used' && 'This invitation has already been used.'}
                      {status?.label === 'Expired' && 'This invitation has expired.'}
                      {status?.label === 'Not Yet Valid' && 'This invitation is not yet valid. Please wait until the arrival window begins.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Form or Success Message */}
        {registrationData ? (
          <DigitalPass
            visitData={registrationData.digitalPass}
            guestData={registrationData.guest}
            onClose={() => setRegistrationData(null)}
          />
        ) : isValid ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Check-In</h2>
            <GuestRegistrationForm
              onSuccess={handleRegistrationSuccess}
              invitationToken={params.token}
              estateId={DEFAULT_ESTATE_ID}
              prefilledData={{
                name: realInvitationData?.guestName || '',
                idNumber: realInvitationData?.guestIdNumber || '',
                vehicleRegistration: realInvitationData?.vehicleRegistration || '',
                hostInfo: `${realInvitationData?.resident?.name || 'N/A'} - ${realInvitationData?.resident?.unitNumber || 'N/A'}`,
              }}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">
                Please contact your host or try again during the valid time window.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.href = '/check-in'}
              >
                Walk-in Registration Instead
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
} 