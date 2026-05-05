# Phase 2: Core Features (Weeks 3-4)

## 🎯 Phase Objectives

Implement core user workflows including complete guest registration, resident authentication and invitation management, basic admin dashboard, and real-time visitor updates.

## 📋 Prerequisites

- Phase 1 completed with all acceptance criteria met
- Database schema and authentication system operational
- Core UI components library functional
- Development environment fully configured

## 🗓️ Timeline: 2 Weeks

### Week 3: Guest Registration & Resident Dashboard
### Week 4: Admin Dashboard & Real-time Features

---

## 📝 Detailed Implementation Tasks

### Task 2.1: Complete Guest Registration Flow (Days 15-17)

#### 2.1.1 Enhanced Guest Functions

```typescript
// convex/guests.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const registerGuest = mutation({
  args: {
    name: v.string(),
    idNumber: v.string(),
    vehicleRegistration: v.optional(v.string()),
    purpose: v.string(),
    hostInfo: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    invitationToken: v.optional(v.string()),
    estateId: v.id("estates"),
  },
  handler: async (ctx, args) => {
    let invitation = null;
    let resident = null;

    // Validate invitation if provided
    if (args.invitationToken) {
      invitation = await ctx.db
        .query("invitations")
        .withIndex("by_token", (q) => q.eq("token", args.invitationToken))
        .filter((q) => 
          q.and(
            q.eq(q.field("isUsed"), false),
            q.gt(q.field("expiresAt"), Date.now())
          )
        )
        .first();

      if (!invitation) {
        throw new Error("Invalid or expired invitation");
      }

      // Get resident info
      resident = await ctx.db.get(invitation.residentId);
    }

    // Create or update guest record
    let guest = await ctx.db
      .query("guests")
      .withIndex("by_id_number", (q) => q.eq("idNumber", args.idNumber))
      .first();

    if (guest) {
      // Update existing guest
      await ctx.db.patch(guest._id, {
        name: args.name,
        vehicleRegistration: args.vehicleRegistration,
        photoStorageId: args.photoStorageId,
      });
    } else {
      // Create new guest
      const guestId = await ctx.db.insert("guests", {
        name: args.name,
        idNumber: args.idNumber,
        vehicleRegistration: args.vehicleRegistration,
        photoStorageId: args.photoStorageId,
      });
      guest = await ctx.db.get(guestId);
    }

    // Create visit record
    const visitId = await ctx.db.insert("visits", {
      guestId: guest!._id,
      residentId: resident?._id,
      invitationId: invitation?._id,
      estateId: args.estateId,
      checkinTime: Date.now(),
      purpose: args.purpose,
      status: "checked_in",
    });

    // Mark invitation as used if provided
    if (invitation) {
      await ctx.db.patch(invitation._id, { isUsed: true });
    }

    // Log audit event
    await ctx.db.insert("audit_logs", {
      action: "guest_checkin",
      entityType: "visit",
      entityId: visitId,
      details: {
        guestName: args.name,
        idNumber: args.idNumber,
        hasInvitation: !!invitation,
        residentUnit: resident?.unitNumber,
      },
    });

    const visit = await ctx.db.get(visitId);
    
    return {
      success: true,
      visit: visit,
      guest: guest,
      digitalPass: {
        visitId,
        guestName: args.name,
        checkinTime: visit!.checkinTime,
        purpose: args.purpose,
        hostInfo: args.hostInfo,
        qrCode: `VISIT_${visitId}_${Date.now()}`,
      },
    };
  },
});

export const uploadGuestPhoto = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getVisitByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Parse token to extract visit ID
    const parts = args.token.split('_');
    if (parts.length < 2 || parts[0] !== 'VISIT') {
      return null;
    }

    const visitId = parts[1];
    const visit = await ctx.db.get(visitId as any);
    
    if (!visit) return null;

    const guest = await ctx.db.get(visit.guestId);
    
    return {
      visit,
      guest,
    };
  },
});
```

#### 2.1.2 Enhanced Guest Registration Component

```typescript
// components/forms/GuestRegistrationForm.tsx
"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
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
}

export function GuestRegistrationForm({ 
  onSuccess, 
  invitationToken, 
  estateId 
}: GuestRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    vehicleRegistration: '',
    purpose: '',
    hostInfo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const registerGuest = useMutation(api.guests.registerGuest);
  const generateUploadUrl = useMutation(api.guests.uploadGuestPhoto);

  const handlePhotoUpload = async (file: File) => {
    setPhotoUploading(true);
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const { storageId } = await response.json();
      return storageId;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validatedData = guestSchema.parse(formData);
      
      let photoStorageId;
      if (photoFile) {
        photoStorageId = await handlePhotoUpload(photoFile);
      }

      const result = await registerGuest({
        ...validatedData,
        photoStorageId,
        invitationToken,
        estateId,
      });
      
      onSuccess(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Guest Registration
          {invitationToken && (
            <Badge variant="secondary">Pre-invited</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Please fill in your details to check in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              required
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="idNumber">ID/Passport Number</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              placeholder="12345678"
              required
            />
            {errors.idNumber && <p className="text-sm text-red-600">{errors.idNumber}</p>}
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
            <Label htmlFor="photo">Photo (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo')?.click()}
                className="flex-1"
                disabled={photoUploading}
              >
                <Camera className="w-4 h-4 mr-2" />
                {photoFile ? 'Change Photo' : 'Add Photo'}
              </Button>
              {photoFile && (
                <Badge variant="secondary">{photoFile.name}</Badge>
              )}
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600">{errors.submit}</p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || photoUploading}
          >
            {loading ? 'Registering...' : 'Check In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### 2.1.3 Digital Pass Component

```typescript
// components/guest/DigitalPass.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, CheckCircle, Clock, User, Car } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  const checkinDate = new Date(visitData.checkinTime);

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
                {checkinDate.toLocaleDateString()} at {checkinDate.toLocaleTimeString()}
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
```

**Acceptance Criteria**: ✅ Guest registration complete with photo upload, digital pass generated, audit trail working

### Task 2.2: Resident Dashboard & Invitation Management (Days 18-20)

#### 2.2.1 Resident Functions

```typescript
// convex/residents.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateRandomToken } from "../lib/utils";

export const createInvitation = mutation({
  args: {
    guestName: v.string(),
    guestIdNumber: v.string(),
    guestPhone: v.optional(v.string()),
    vehicleRegistration: v.optional(v.string()),
    arrivalWindow: v.object({
      from: v.number(),
      to: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Get current resident (implement auth check)
    // For now, get first resident as demo
    const resident = await ctx.db.query("residents").first();
    if (!resident) {
      throw new Error("Resident not found");
    }

    // Generate unique invitation token
    const token = generateRandomToken(12);

    // Check if guest already has pending invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_resident", (q) => q.eq("residentId", resident._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("guestIdNumber"), args.guestIdNumber),
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .first();

    if (existingInvitation) {
      throw new Error("Active invitation already exists for this guest");
    }

    const invitationId = await ctx.db.insert("invitations", {
      residentId: resident._id,
      guestName: args.guestName,
      guestIdNumber: args.guestIdNumber,
      guestPhone: args.guestPhone,
      vehicleRegistration: args.vehicleRegistration,
      token,
      expiresAt: args.arrivalWindow.to,
      isUsed: false,
      arrivalWindow: args.arrivalWindow,
    });

    // Log audit event
    await ctx.db.insert("audit_logs", {
      userId: resident.userId,
      action: "invitation_created",
      entityType: "invitation",
      entityId: invitationId,
      details: {
        guestName: args.guestName,
        guestIdNumber: args.guestIdNumber,
        residentUnit: resident.unitNumber,
      },
    });

    const invitation = await ctx.db.get(invitationId);
    
    // TODO: Send invitation via SMS/email in Phase 3
    
    return {
      success: true,
      invitation,
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${token}`,
    };
  },
});

export const getMyInvitations = query({
  args: { residentId: v.optional(v.id("residents")) },
  handler: async (ctx, args) => {
    if (!args.residentId) {
      // Get first resident as demo
      const resident = await ctx.db.query("residents").first();
      if (!resident) return [];
      args.residentId = resident._id;
    }

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId!))
      .order("desc")
      .take(20);

    return invitations.map(invitation => ({
      ...invitation,
      isExpired: invitation.expiresAt < Date.now(),
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${invitation.token}`,
    }));
  },
});

export const deleteInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.isUsed) {
      throw new Error("Cannot delete used invitation");
    }

    await ctx.db.delete(args.invitationId);

    // Log audit event
    await ctx.db.insert("audit_logs", {
      action: "invitation_deleted",
      entityType: "invitation",
      entityId: args.invitationId,
      details: {
        guestName: invitation.guestName,
        guestIdNumber: invitation.guestIdNumber,
      },
    });

    return { success: true };
  },
});

export const getResidentProfile = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;

    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "resident") return null;

    const resident = await ctx.db
      .query("residents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .first();

    if (!resident) return null;

    const estate = await ctx.db.get(resident.estateId);

    return {
      ...resident,
      user,
      estate,
    };
  },
});
```

#### 2.2.2 Utility Functions

```typescript
// convex/lib/utils.ts
export function generateRandomToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

#### 2.2.3 Resident Dashboard Component

```typescript
// components/resident/ResidentDashboard.tsx
"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Calendar, Clock } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { InvitationCard } from './InvitationCard';
import { CreateInvitationForm } from './CreateInvitationForm';

interface ResidentDashboardProps {
  userId: Id<"users">;
}

export function ResidentDashboard({ userId }: ResidentDashboardProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const profile = useQuery(api.residents.getResidentProfile, { userId });
  const invitations = useQuery(api.residents.getMyInvitations, {
    residentId: profile?._id,
  });

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading profile...</p>
      </div>
    );
  }

  const activeInvitations = invitations?.filter(inv => 
    !inv.isUsed && !inv.isExpired
  ) || [];
  const usedInvitations = invitations?.filter(inv => inv.isUsed) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {profile.name}</CardTitle>
          <CardDescription>
            Unit {profile.unitNumber} • {profile.estate?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeInvitations.length}
              </div>
              <p className="text-sm text-gray-500">Active Invitations</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {usedInvitations.length}
              </div>
              <p className="text-sm text-gray-500">Completed Visits</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {invitations?.filter(inv => inv.isExpired && !inv.isUsed).length || 0}
              </div>
              <p className="text-sm text-gray-500">Expired</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invitations Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Guest Invitations</CardTitle>
              <CardDescription>
                Manage your guest invitations and check-ins
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Invitation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({activeInvitations.length})
              </TabsTrigger>
              <TabsTrigger value="used">
                Used ({usedInvitations.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({invitations?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeInvitations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active invitations</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(true)}
                    className="mt-2"
                  >
                    Create your first invitation
                  </Button>
                </div>
              ) : (
                activeInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation._id}
                    invitation={invitation}
                    showActions={true}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="used" className="space-y-4">
              {usedInvitations.map((invitation) => (
                <InvitationCard
                  key={invitation._id}
                  invitation={invitation}
                  showActions={false}
                />
              ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {invitations?.map((invitation) => (
                <InvitationCard
                  key={invitation._id}
                  invitation={invitation}
                  showActions={!invitation.isUsed}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Invitation Modal */}
      {showCreateForm && (
        <CreateInvitationForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
```

#### 2.2.4 Invitation Card Component

```typescript
// components/resident/InvitationCard.tsx
"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Copy, Share, MoreVertical, Trash, Calendar, Clock, User, Car } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

interface InvitationCardProps {
  invitation: any;
  showActions: boolean;
}

export function InvitationCard({ invitation, showActions }: InvitationCardProps) {
  const [copying, setCopying] = useState(false);
  
  const deleteInvitation = useMutation(api.residents.deleteInvitation);

  const handleCopyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(invitation.invitationLink);
      toast.success('Invitation link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    } finally {
      setCopying(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Guest Invitation',
          text: `You're invited to visit ${invitation.guestName}`,
          url: invitation.invitationLink,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this invitation?')) {
      try {
        await deleteInvitation({ invitationId: invitation._id });
        toast.success('Invitation deleted');
      } catch (error) {
        toast.error('Failed to delete invitation');
      }
    }
  };

  const arrivalDate = new Date(invitation.arrivalWindow.from);
  const expiryDate = new Date(invitation.arrivalWindow.to);

  return (
    <Card className={`${invitation.isUsed ? 'bg-green-50 border-green-200' : 
                     invitation.isExpired ? 'bg-gray-50 border-gray-200' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{invitation.guestName}</span>
              <Badge variant={
                invitation.isUsed ? "default" : 
                invitation.isExpired ? "secondary" : "outline"
              }>
                {invitation.isUsed ? "Used" : 
                 invitation.isExpired ? "Expired" : "Active"}
              </Badge>
            </div>

            <div className="text-sm text-gray-600">
              ID: {invitation.guestIdNumber}
            </div>

            {invitation.vehicleRegistration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Car className="w-4 h-4" />
                {invitation.vehicleRegistration}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {arrivalDate.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {arrivalDate.toLocaleTimeString()} - {expiryDate.toLocaleTimeString()}
              </div>
            </div>

            {showActions && !invitation.isExpired && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={copying}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copying ? 'Copying...' : 'Copy Link'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            )}
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Acceptance Criteria**: ✅ Resident dashboard functional, invitation creation/management working, invitation links shareable

### Task 2.3: Basic Admin Dashboard (Days 21-22)

#### 2.3.1 Admin Functions

```typescript
// convex/admin.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardData = query({
  args: { 
    estateId: v.id("estates"),
    filter: v.optional(v.union(
      v.literal("expected"), 
      v.literal("checked_in"), 
      v.literal("all")
    ))
  },
  handler: async (ctx, args) => {
    // Get all visits for the estate
    let visitsQuery = ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId));

    if (args.filter === "checked_in") {
      visitsQuery = visitsQuery.filter((q) => q.eq(q.field("status"), "checked_in"));
    } else if (args.filter === "expected") {
      // Get pending invitations for expected guests
      const now = Date.now();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const expectedInvitations = await ctx.db
        .query("invitations")
        .filter((q) => 
          q.and(
            q.eq(q.field("isUsed"), false),
            q.gte(q.field("arrivalWindow").from, todayStart.getTime()),
            q.lte(q.field("arrivalWindow").from, todayEnd.getTime())
          )
        )
        .collect();

      return {
        visits: [],
        expectedGuests: expectedInvitations.map(inv => ({
          type: 'expected',
          invitation: inv,
          expectedArrival: inv.arrivalWindow.from,
        })),
      };
    }

    const visits = await visitsQuery
      .order("desc")
      .take(50);

    // Fetch related data
    const visitData = await Promise.all(
      visits.map(async (visit) => {
        const guest = await ctx.db.get(visit.guestId);
        const resident = visit.residentId ? await ctx.db.get(visit.residentId) : null;
        const invitation = visit.invitationId ? await ctx.db.get(visit.invitationId) : null;

        return {
          ...visit,
          guest,
          resident,
          invitation,
          duration: visit.checkoutTime ? 
            visit.checkoutTime - visit.checkinTime : 
            Date.now() - visit.checkinTime,
        };
      })
    );

    return {
      visits: visitData,
      expectedGuests: args.filter === "all" ? [] : undefined,
    };
  },
});

export const checkoutVisitor = mutation({
  args: { 
    visitId: v.id("visits"),
    adminNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.visitId);
    if (!visit) {
      throw new Error("Visit not found");
    }

    if (visit.status === "checked_out") {
      throw new Error("Visitor already checked out");
    }

    await ctx.db.patch(args.visitId, {
      checkoutTime: Date.now(),
      status: "checked_out",
      adminNotes: args.adminNotes,
    });

    // Log audit event
    await ctx.db.insert("audit_logs", {
      action: "visitor_checkout",
      entityType: "visit",
      entityId: args.visitId,
      details: {
        adminNotes: args.adminNotes,
      },
    });

    return { success: true };
  },
});

export const getEstateSettings = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.estateId);
  },
});
```

#### 2.3.2 Admin Dashboard Component

```typescript
// components/admin/AdminDashboard.tsx
"use client";

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Filter
} from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { VisitorCard } from './VisitorCard';
import { ExpectedGuestCard } from './ExpectedGuestCard';

interface AdminDashboardProps {
  estateId: Id<"estates">;
}

export function AdminDashboard({ estateId }: AdminDashboardProps) {
  const [filter, setFilter] = useState<"all" | "checked_in" | "expected">("checked_in");

  const dashboardData = useQuery(api.admin.getDashboardData, { 
    estateId, 
    filter 
  });
  const estateSettings = useQuery(api.admin.getEstateSettings, { estateId });

  const visits = dashboardData?.visits || [];
  const expectedGuests = dashboardData?.expectedGuests || [];

  // Calculate stats
  const checkedInCount = visits.filter(v => v.status === "checked_in").length;
  const overstayCount = visits.filter(v => {
    if (v.status !== "checked_in" || !estateSettings) return false;
    const overstayThreshold = estateSettings.settings.overstayThresholdHours * 60 * 60 * 1000;
    return (Date.now() - v.checkinTime) > overstayThreshold;
  }).length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Today</p>
                <p className="text-2xl font-bold text-blue-600">{expectedGuests.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overstays</p>
                <p className="text-2xl font-bold text-orange-600">{overstayCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Today</p>
                <p className="text-2xl font-bold text-gray-600">{visits.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Visitor Management</CardTitle>
              <CardDescription>
                Monitor and manage current visitors
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="checked_in">
                Currently In ({checkedInCount})
              </TabsTrigger>
              <TabsTrigger value="expected">
                Expected ({expectedGuests.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Today ({visits.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checked_in" className="space-y-4">
              {visits.filter(v => v.status === "checked_in").length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No visitors currently checked in</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {visits
                    .filter(v => v.status === "checked_in")
                    .map((visit) => (
                      <VisitorCard
                        key={visit._id}
                        visit={visit}
                        overstayThreshold={estateSettings?.settings.overstayThresholdHours || 8}
                        showActions={true}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="expected" className="space-y-4">
              {expectedGuests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No expected guests today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expectedGuests.map((guest) => (
                    <ExpectedGuestCard
                      key={guest.invitation._id}
                      invitation={guest.invitation}
                      expectedArrival={guest.expectedArrival}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {visits.map((visit) => (
                  <VisitorCard
                    key={visit._id}
                    visit={visit}
                    overstayThreshold={estateSettings?.settings.overstayThresholdHours || 8}
                    showActions={visit.status === "checked_in"}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Acceptance Criteria**: ✅ Admin dashboard shows real-time visitor data, checkout functionality working, expected guests displayed

### Task 2.4: Real-time Updates & Subscriptions (Days 23-24)

#### 2.4.1 Real-time Subscription Functions

```typescript
// convex/subscriptions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const subscribeToVisitors = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId))
      .filter((q) => q.eq(q.field("status"), "checked_in"))
      .order("desc")
      .collect();

    // Fetch related data
    const visitData = await Promise.all(
      visits.map(async (visit) => {
        const guest = await ctx.db.get(visit.guestId);
        const resident = visit.residentId ? await ctx.db.get(visit.residentId) : null;

        return {
          ...visit,
          guest,
          resident,
        };
      })
    );

    return visitData;
  },
});

export const subscribeToInvitations = query({
  args: { residentId: v.id("residents") },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_resident", (q) => q.eq("residentId", args.residentId))
      .order("desc")
      .take(10);

    return invitations.map(invitation => ({
      ...invitation,
      isExpired: invitation.expiresAt < Date.now(),
    }));
  },
});
```

#### 2.4.2 Real-time Hooks

```typescript
// lib/hooks/useRealTimeVisitors.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export const useRealTimeVisitors = (estateId: Id<"estates">) => {
  const visitors = useQuery(api.subscriptions.subscribeToVisitors, { 
    estateId 
  });
  
  return {
    visitors: visitors ?? [],
    isLoading: visitors === undefined,
  };
};

// lib/hooks/useRealTimeInvitations.ts
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export const useRealTimeInvitations = (residentId: Id<"residents">) => {
  const invitations = useQuery(api.subscriptions.subscribeToInvitations, { 
    residentId 
  });
  
  return {
    invitations: invitations ?? [],
    isLoading: invitations === undefined,
  };
};
```

**Acceptance Criteria**: ✅ Real-time updates working across all dashboards, data synchronizes automatically

### Task 2.5: Route Implementation & Navigation (Days 25-28)

#### 2.5.1 Route Structure

```typescript
// app/(guest)/check-in/page.tsx
"use client";

import { useState } from 'react';
import { GuestRegistrationForm } from '@/components/forms/GuestRegistrationForm';
import { DigitalPass } from '@/components/guest/DigitalPass';
import { AppLayout } from '@/components/layout/AppLayout';

export default function CheckInPage() {
  const [registrationData, setRegistrationData] = useState(null);

  const handleRegistrationSuccess = (data: any) => {
    setRegistrationData(data);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
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
            estateId={process.env.NEXT_PUBLIC_DEFAULT_ESTATE_ID!}
          />
        )}
      </div>
    </AppLayout>
  );
}

// app/(guest)/invitation/[token]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { GuestRegistrationForm } from '@/components/forms/GuestRegistrationForm';
import { DigitalPass } from '@/components/guest/DigitalPass';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';

interface InvitationPageProps {
  params: { token: string };
}

export default function InvitationPage({ params }: InvitationPageProps) {
  const [registrationData, setRegistrationData] = useState(null);
  
  // TODO: Add invitation validation query

  const handleRegistrationSuccess = (data: any) => {
    setRegistrationData(data);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pre-Invited Guest</h1>
          <p className="text-gray-600 mt-2">
            You've been invited! Please complete your check-in.
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
            invitationToken={params.token}
            estateId={process.env.NEXT_PUBLIC_DEFAULT_ESTATE_ID!}
          />
        )}
      </div>
    </AppLayout>
  );
}

// app/(resident)/dashboard/page.tsx
"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { ResidentDashboard } from '@/components/resident/ResidentDashboard';
import { OTPForm } from '@/components/forms/OTPForm';
import { AppLayout } from '@/components/layout/AppLayout';

export default function ResidentDashboardPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">Resident Login</h1>
          <OTPForm onSuccess={() => {}} />
        </div>
      </AppLayout>
    );
  }

  if (user?.role !== 'resident') {
    return (
      <AppLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>This area is for residents only.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ResidentDashboard userId={user.id} />
    </AppLayout>
  );
}

// app/(admin)/dashboard/page.tsx
"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { OTPForm } from '@/components/forms/OTPForm';
import { AppLayout } from '@/components/layout/AppLayout';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>
          <OTPForm onSuccess={() => {}} />
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
      <AdminDashboard estateId={process.env.NEXT_PUBLIC_DEFAULT_ESTATE_ID!} />
    </AppLayout>
  );
}
```

**Acceptance Criteria**: ✅ All main routes functional, authentication-protected routes working, navigation between flows smooth

---

## 🎯 Phase 2 Acceptance Criteria

Before proceeding to Phase 3, ensure all the following criteria are met:

### ✅ Functional Requirements
- [ ] Complete guest registration flow with photo upload working
- [ ] Digital pass generation and QR code display functional
- [ ] Resident authentication and dashboard operational
- [ ] Invitation creation, sharing, and management working
- [ ] Admin dashboard with real-time visitor monitoring
- [ ] Guest checkout functionality working
- [ ] All user roles properly authenticated and authorized

### ✅ Technical Requirements
- [ ] Real-time data updates across all dashboards
- [ ] Invitation token system working securely
- [ ] File upload and storage operational
- [ ] Database queries optimized with proper indexing
- [ ] All forms validate input correctly
- [ ] Error handling implemented throughout

### ✅ User Experience
- [ ] Responsive design working on mobile and desktop
- [ ] Navigation flows intuitive and complete
- [ ] Loading states and error messages user-friendly
- [ ] Digital pass clearly displays visit information
- [ ] Admin dashboard provides clear visitor overview

### ✅ Data Integrity
- [ ] Audit logs capture all critical actions
- [ ] Visit records accurately track check-in/out times
- [ ] Invitation expiration and usage tracking working
- [ ] No duplicate guest records for same ID number
- [ ] Database relationships properly maintained

## 🚀 Next Steps

Once Phase 2 is complete, proceed to [Phase 3: Advanced Features](./phase-3-advanced-features.md) which will implement:
- Enhanced photo upload with camera capture
- Advanced admin features (bulk operations, detailed reports)
- SMS and email notification system
- Report generation and export functionality
- Overstay monitoring and alerts

## 📚 Resources

- [Convex Real-time Subscriptions](https://docs.convex.dev/client/react/useQuery)
- [Next.js Dynamic Routes](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes)
- [Shadcn/UI Tabs Component](https://ui.shadcn.com/docs/components/tabs)
- [QR Code Generation](https://www.npmjs.com/package/qrcode.react) 