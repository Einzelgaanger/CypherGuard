"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, User, Car } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatTime } from '@/lib/utils';

interface DigitalPassProps {
  visitData: {
    visitId: string;
    guestName: string;
    checkinTime: number;
    purpose: string;
    hostInfo: string;
    qrCode: string;
  };
  guestData?: {
    vehicleRegistration?: string;
  };
  onClose?: () => void;
}

export function DigitalPass({ visitData, guestData, onClose }: DigitalPassProps) {

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Check-in Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={visitData.qrCode}
              size={150}
              level="M"
              includeMargin={true}
              className="border rounded-lg"
            />
          </div>

          {/* Visit Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{visitData.guestName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {formatDate(visitData.checkinTime)} at {formatTime(visitData.checkinTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">{visitData.purpose}</Badge>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600">Host:</p>
              <p className="font-medium">{visitData.hostInfo}</p>
            </div>

            {guestData?.vehicleRegistration && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{guestData.vehicleRegistration}</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Please show this QR code to security when requested. 
              Keep this pass visible during your visit.
            </p>
          </div>

          {onClose && (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 