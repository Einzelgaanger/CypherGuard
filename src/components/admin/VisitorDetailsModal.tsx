"use client";

import { useQuery } from 'convex/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Clock, Car, Phone, MapPin, History } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { formatDateTime, formatDate } from '@/lib/utils';

interface VisitorDetailsModalProps {
  visitId: Id<"visits"> | null;
  onClose: () => void;
}

export function VisitorDetailsModal({ visitId, onClose }: VisitorDetailsModalProps) {
  const details = useQuery(
    api.admin.getVisitorDetails, 
    visitId ? { visitId } : "skip"
  );

  if (!visitId || !details) {
    return null;
  }

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={!!visitId} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visitor Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Guest Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {details.guest?.photoUrl && (
                <div className="md:col-span-1">
                  <img
                    src={details.guest.photoUrl}
                    alt="Guest"
                    className="w-full rounded-lg object-cover aspect-square"
                  />
                </div>
              )}
              
              <div className={`space-y-3 ${details.guest?.photoUrl ? 'md:col-span-2' : 'md:col-span-3'}`}>
                <div>
                  <p className="font-medium">{details.guest?.name}</p>
                  <p className="text-sm text-gray-600">ID: {details.guest?.idNumber}</p>
                </div>
                
                {details.guest?.vehicleRegistration && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{details.guest.vehicleRegistration}</span>
                  </div>
                )}
                
                {details.guest?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{details.guest.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Visit Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Current Visit
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Check-in Time</p>
                <p className="font-medium">
                  {formatDateTime(details.visit.checkinTime)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{formatDuration(details.duration)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Purpose</p>
                <Badge variant="outline">{details.visit.purpose}</Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={
                  details.visit.status === "checked_in" ? "default" :
                  details.visit.status === "checked_out" ? "secondary" : "destructive"
                }>
                  {details.visit.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {details.resident && (
              <div>
                <p className="text-sm text-gray-600">Host</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{details.resident.name} - Unit {details.resident.unitNumber}</span>
                </div>
              </div>
            )}

            {details.visit.adminNotes && (
              <div>
                <p className="text-sm text-gray-600">Admin Notes</p>
                <p className="text-sm bg-gray-50 p-2 rounded">{details.visit.adminNotes}</p>
              </div>
            )}
          </div>

          {/* Visit History */}
          {details.guestHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Visits
                </h3>
                
                <div className="space-y-2">
                  {details.guestHistory.map((visit: any) => (
                    <div key={visit._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">
                          {formatDate(visit.checkinTime)}
                        </p>
                        <p className="text-xs text-gray-600">{visit.purpose}</p>
                      </div>
                      <Badge variant="secondary">
                        {visit.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 