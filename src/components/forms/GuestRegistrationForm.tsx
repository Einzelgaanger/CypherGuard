"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhotoUpload } from '@/components/photo/PhotoUpload';

import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { z } from 'zod';

const guestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  idNumber: z.string().min(5, 'ID number must be at least 5 characters'),
  vehicleRegistration: z.string().optional(),
  purpose: z.enum(['business', 'personal', 'delivery', 'maintenance']),
  hostInfo: z.string().min(2, 'Host information is required'),
});

interface GuestRegistrationFormProps {
  onSuccess: (data: any) => void;
  invitationToken?: string;
  estateId: Id<"estates">;
  prefilledData?: {
    name?: string;
    idNumber?: string;
    vehicleRegistration?: string;
    hostInfo?: string;
  };
}

export function GuestRegistrationForm({ 
  onSuccess, 
  invitationToken, 
  estateId,
  prefilledData
}: GuestRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: prefilledData?.name || '',
    idNumber: prefilledData?.idNumber || '',
    vehicleRegistration: prefilledData?.vehicleRegistration || '',
    purpose: '',
    hostInfo: prefilledData?.hostInfo || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Convex mutations
  const registerGuest = useMutation(api.guests.registerGuest);
  const uploadGuestPhoto = useMutation(api.guests.uploadGuestPhoto);

  const handlePhotoUpload = async (file: File): Promise<Id<"_storage"> | null> => {
    try {
      setUploading(true);
      
      // Get upload URL from Convex
      const uploadUrl = await uploadGuestPhoto();
      
      // Upload file to Convex storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
      
      const { storageId } = await response.json();
      return storageId;
    } catch (error) {
      console.error('Photo upload failed:', error);
      setErrors(prev => ({ ...prev, photo: 'Failed to upload photo. Please try again.' }));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validatedData = guestSchema.parse(formData);

      // Upload photo if selected
      let photoStorageId: Id<"_storage"> | undefined;
      if (selectedPhoto) {
        photoStorageId = await handlePhotoUpload(selectedPhoto) || undefined;
        if (selectedPhoto && !photoStorageId) {
          // Photo upload failed, stop submission
          return;
        }
      }

      // Submit to Convex
      const result = await registerGuest({
        name: validatedData.name,
        idNumber: validatedData.idNumber,
        vehicleRegistration: validatedData.vehicleRegistration,
        purpose: validatedData.purpose,
        hostInfo: validatedData.hostInfo,
        photoStorageId,
        invitationToken,
        estateId,
      });
      
      if (result.success) {
        onSuccess(result);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: (error as Error).message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoSelected = (file: File) => {
    setSelectedPhoto(file);
    if (errors.photo) {
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    if (errors.photo) {
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mobile-modal">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-responsive">
          Guest Registration
          {invitationToken && (
            <Badge variant="secondary">Pre-invited</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-responsive">
          Please fill in your details to check in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 mobile-form">
          <div>
            <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              className="mobile-input touch-target mt-2"
              autoComplete="name"
              required
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="idNumber" className="text-base font-medium">ID/Passport Number</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              placeholder="12345678"
              className="mobile-input touch-target mt-2"
              autoComplete="off"
              required
            />
            {errors.idNumber && <p className="text-sm text-red-600 mt-1">{errors.idNumber}</p>}
          </div>

          <div>
            <Label htmlFor="vehicleRegistration">Vehicle Registration (Optional)</Label>
            <Input
              id="vehicleRegistration"
              value={formData.vehicleRegistration}
              onChange={(e) => handleChange('vehicleRegistration', e.target.value)}
              placeholder="KAA 123A"
            />
          </div>

          <div>
            <Label htmlFor="purpose">Purpose of Visit</Label>
            <Select onValueChange={(value) => handleChange('purpose', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            {errors.purpose && <p className="text-sm text-red-600">{errors.purpose}</p>}
          </div>

          <div>
            <Label htmlFor="hostInfo">Host Information</Label>
            <Input
              id="hostInfo"
              value={formData.hostInfo}
              onChange={(e) => handleChange('hostInfo', e.target.value)}
              placeholder="Unit A-101 or John Smith"
              required
            />
            {errors.hostInfo && <p className="text-sm text-red-600">{errors.hostInfo}</p>}
          </div>

          <div>
            <Label>Photo (Optional)</Label>
            <PhotoUpload
              onPhotoSelected={handlePhotoSelected}
              selectedPhoto={selectedPhoto}
              onRemovePhoto={handleRemovePhoto}
              required={false}
            />
            {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full touch-target text-lg font-medium py-4 mt-6" 
            disabled={loading || uploading}
            size="lg"
          >
            {loading || uploading ? 'Processing...' : 'Check In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 