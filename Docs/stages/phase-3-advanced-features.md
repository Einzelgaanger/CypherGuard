# Phase 3: Advanced Features (Weeks 5-6)

## 🎯 Phase Objectives

Implement advanced functionality including enhanced photo capture, sophisticated admin features, comprehensive notification systems, detailed reporting capabilities, and intelligent monitoring with automated alerts.

## 📋 Prerequisites

- Phase 2 completed with all acceptance criteria met
- Core user flows operational and tested
- Real-time updates functioning correctly
- Database relationships properly established

## 🗓️ Timeline: 2 Weeks

### Week 5: Photo System & Advanced Admin Features
### Week 6: Notifications, Reports & Monitoring

---

## 📝 Detailed Implementation Tasks

### Task 3.1: Enhanced Photo Upload System (Days 29-31)

#### 3.1.1 Camera Capture Component

```typescript
// components/photo/CameraCapture.tsx
"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (!capturedImage || !canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.8);
  }, [capturedImage, onCapture]);

  useState(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Photo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg"
              style={{ maxHeight: '300px' }}
            />
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full rounded-lg"
              style={{ maxHeight: '300px' }}
            />
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2 justify-center">
          {!capturedImage ? (
            <>
              <Button onClick={capturePhoto} disabled={!stream}>
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              <Button onClick={onCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={confirmPhoto} variant="default">
                <Check className="w-4 h-4 mr-2" />
                Use Photo
              </Button>
              <Button onClick={retakePhoto} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button onClick={onCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3.1.2 Enhanced Photo Upload Component

```typescript
// components/photo/PhotoUpload.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X } from 'lucide-react';
import { CameraCapture } from './CameraCapture';

interface PhotoUploadProps {
  onPhotoSelected: (file: File) => void;
  selectedPhoto?: File | null;
  onRemovePhoto?: () => void;
  required?: boolean;
}

export function PhotoUpload({ 
  onPhotoSelected, 
  selectedPhoto, 
  onRemovePhoto,
  required = false 
}: PhotoUploadProps) {
  const [showCamera, setShowCamera] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoSelected(file);
    }
  };

  const handleCameraCapture = (file: File) => {
    onPhotoSelected(file);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {selectedPhoto ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {selectedPhoto.name}
              </Badge>
              {onRemovePhoto && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {selectedPhoto && (
              <img
                src={URL.createObjectURL(selectedPhoto)}
                alt="Selected"
                className="w-full rounded-lg max-h-48 object-cover"
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {required ? 'Photo required for check-in' : 'Add a photo (optional)'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCamera(true)}
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm">Take Photo</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Upload File</span>
              </Button>
            </div>

            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Acceptance Criteria**: ✅ Camera capture working on mobile/desktop, photo preview and retake functionality, file upload fallback

### Task 3.2: Advanced Admin Features (Days 32-34)

#### 3.2.1 Bulk Operations

```typescript
// convex/admin.ts (additions)
export const bulkCheckout = mutation({
  args: { 
    visitIds: v.array(v.id("visits")),
    adminNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const visitId of args.visitIds) {
      try {
        const visit = await ctx.db.get(visitId);
        if (visit && visit.status === "checked_in") {
          await ctx.db.patch(visitId, {
            checkoutTime: Date.now(),
            status: "checked_out",
            adminNotes: args.adminNotes,
          });

          // Log audit event
          await ctx.db.insert("audit_logs", {
            action: "bulk_checkout",
            entityType: "visit",
            entityId: visitId,
            details: {
              adminNotes: args.adminNotes,
              bulkOperation: true,
            },
          });

          results.push({ visitId, success: true });
        } else {
          results.push({ visitId, success: false, error: "Invalid visit" });
        }
      } catch (error) {
        results.push({ visitId, success: false, error: (error as Error).message });
      }
    }

    return { results };
  },
});

export const getVisitorDetails = query({
  args: { visitId: v.id("visits") },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.visitId);
    if (!visit) return null;

    const guest = await ctx.db.get(visit.guestId);
    const resident = visit.residentId ? await ctx.db.get(visit.residentId) : null;
    const invitation = visit.invitationId ? await ctx.db.get(visit.invitationId) : null;

    // Get guest's visit history
    const guestHistory = await ctx.db
      .query("visits")
      .withIndex("by_guest", (q) => q.eq("guestId", visit.guestId))
      .filter((q) => q.neq(q.field("_id"), args.visitId))
      .order("desc")
      .take(5);

    // Get photo if exists
    let photoUrl = null;
    if (guest?.photoStorageId) {
      photoUrl = await ctx.storage.getUrl(guest.photoStorageId);
    }

    return {
      visit,
      guest: guest ? { ...guest, photoUrl } : null,
      resident,
      invitation,
      guestHistory,
      duration: visit.checkoutTime ? 
        visit.checkoutTime - visit.checkinTime : 
        Date.now() - visit.checkinTime,
    };
  },
});

export const flagVisitor = mutation({
  args: { 
    visitId: v.id("visits"),
    flag: v.union(v.literal("overstay"), v.literal("suspicious"), v.literal("resolved")),
    notes: v.string()
  },
  handler: async (ctx, args) => {
    const visit = await ctx.db.get(args.visitId);
    if (!visit) {
      throw new Error("Visit not found");
    }

    // Update visit status if flagging as overstay
    if (args.flag === "overstay" && visit.status === "checked_in") {
      await ctx.db.patch(args.visitId, { status: "overstay" });
    }

    // Log audit event
    await ctx.db.insert("audit_logs", {
      action: "visitor_flagged",
      entityType: "visit",
      entityId: args.visitId,
      details: {
        flag: args.flag,
        notes: args.notes,
      },
    });

    return { success: true };
  },
});
```

#### 3.2.2 Advanced Admin Dashboard Components

```typescript
// components/admin/VisitorDetailsModal.tsx
"use client";

import { useQuery } from 'convex/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Clock, Calendar, Car, Phone, MapPin, History } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

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
                  {new Date(details.visit.checkinTime).toLocaleString()}
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
                  {details.guestHistory.map((visit) => (
                    <div key={visit._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(visit.checkinTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">{visit.purpose}</p>
                      </div>
                      <Badge variant="secondary" size="sm">
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
```

**Acceptance Criteria**: ✅ Detailed visitor profiles with photos, visit history tracking, bulk operations, visitor flagging system

### Task 3.3: Notification System (Days 35-37)

#### 3.3.1 SMS Integration

```typescript
// convex/notifications.ts
import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const sendSMS = action({
  args: {
    to: v.string(),
    message: v.string(),
    type: v.union(v.literal("invitation"), v.literal("reminder"), v.literal("alert"))
  },
  handler: async (ctx, args) => {
    // Using Twilio or Africa's Talking for Kenya
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("SMS service not configured");
    }

    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: args.to,
          Body: args.message,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SMS failed: ${error}`);
      }

      const result = await response.json();

      // Log notification
      await ctx.runMutation("internal:notifications:logNotification", {
        type: "sms",
        recipient: args.to,
        message: args.message,
        status: "sent",
        externalId: result.sid,
        notificationType: args.type,
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      // Log failed notification
      await ctx.runMutation("internal:notifications:logNotification", {
        type: "sms",
        recipient: args.to,
        message: args.message,
        status: "failed",
        error: (error as Error).message,
        notificationType: args.type,
      });

      throw error;
    }
  },
});

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    type: v.union(v.literal("invitation"), v.literal("reminder"), v.literal("report"))
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      throw new Error("Email service not configured");
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CypherSec <noreply@cypher.com>',
          to: [args.to],
          subject: args.subject,
          html: args.html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Email failed: ${error}`);
      }

      const result = await response.json();

      // Log notification
      await ctx.runMutation("internal:notifications:logNotification", {
        type: "email",
        recipient: args.to,
        message: args.subject,
        status: "sent",
        externalId: result.id,
        notificationType: args.type,
      });

      return { success: true, messageId: result.id };
    } catch (error) {
      // Log failed notification
      await ctx.runMutation("internal:notifications:logNotification", {
        type: "email",
        recipient: args.to,
        message: args.subject,
        status: "failed",
        error: (error as Error).message,
        notificationType: args.type,
      });

      throw error;
    }
  },
});

export const sendInvitationNotification = action({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const resident = await ctx.db.get(invitation.residentId);
    if (!resident) {
      throw new Error("Resident not found");
    }

    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitation/${invitation.token}`;
    const arrivalDate = new Date(invitation.arrivalWindow.from);

    // Send SMS if phone number provided
    if (invitation.guestPhone) {
      const smsMessage = `You're invited to ${resident.name}'s residence on ${arrivalDate.toLocaleDateString()}. Check in here: ${invitationLink}`;
      
      await ctx.runAction("notifications:sendSMS", {
        to: invitation.guestPhone,
        message: smsMessage,
        type: "invitation",
      });
    }

    // Send email if available (could be collected during invitation creation)
    // Implementation would be similar to SMS

    return { success: true };
  },
});

// Internal function to log notifications
export const logNotification = internalMutation({
  args: {
    type: v.union(v.literal("sms"), v.literal("email")),
    recipient: v.string(),
    message: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    externalId: v.optional(v.string()),
    error: v.optional(v.string()),
    notificationType: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notification_logs", {
      type: args.type,
      recipient: args.recipient,
      message: args.message,
      status: args.status,
      externalId: args.externalId,
      error: args.error,
      notificationType: args.notificationType,
      timestamp: Date.now(),
    });
  },
});
```

#### 3.3.2 Notification Schema Addition

```typescript
// convex/schema.ts (addition)
notification_logs: defineTable({
  type: v.union(v.literal("sms"), v.literal("email")),
  recipient: v.string(),
  message: v.string(),
  status: v.union(v.literal("sent"), v.literal("failed")),
  externalId: v.optional(v.string()),
  error: v.optional(v.string()),
  notificationType: v.string(),
  timestamp: v.number(),
}).index("by_recipient", ["recipient"])
  .index("by_timestamp", ["timestamp"]),
```

**Acceptance Criteria**: ✅ SMS notifications working, email system functional, notification logging, invitation delivery automated

### Task 3.4: Report Generation System (Days 38-40)

#### 3.4.1 Report Functions

```typescript
// convex/reports.ts
import { query, action } from "./_generated/server";
import { v } from "convex/values";

export const generateVisitorReport = query({
  args: {
    estateId: v.id("estates"),
    dateRange: v.object({
      from: v.number(),
      to: v.number(),
    }),
    format: v.union(v.literal("summary"), v.literal("detailed")),
    filters: v.optional(v.object({
      purpose: v.optional(v.string()),
      status: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Get visits in date range
    let visits = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId))
      .filter((q) => 
        q.and(
          q.gte(q.field("checkinTime"), args.dateRange.from),
          q.lte(q.field("checkinTime"), args.dateRange.to)
        )
      )
      .collect();

    // Apply filters
    if (args.filters?.purpose) {
      visits = visits.filter(v => v.purpose === args.filters.purpose);
    }
    if (args.filters?.status) {
      visits = visits.filter(v => v.status === args.filters.status);
    }

    // Fetch related data for detailed report
    const visitData = await Promise.all(
      visits.map(async (visit) => {
        const guest = await ctx.db.get(visit.guestId);
        const resident = visit.residentId ? await ctx.db.get(visit.residentId) : null;
        
        return {
          ...visit,
          guest,
          resident,
          duration: visit.checkoutTime ? 
            visit.checkoutTime - visit.checkinTime : 
            Date.now() - visit.checkinTime,
        };
      })
    );

    // Generate summary statistics
    const summary = {
      totalVisits: visits.length,
      checkedInCount: visits.filter(v => v.status === "checked_in").length,
      checkedOutCount: visits.filter(v => v.status === "checked_out").length,
      overstayCount: visits.filter(v => v.status === "overstay").length,
      averageDuration: visitData.reduce((acc, v) => acc + v.duration, 0) / visitData.length,
      byPurpose: {
        business: visits.filter(v => v.purpose === "business").length,
        personal: visits.filter(v => v.purpose === "personal").length,
        delivery: visits.filter(v => v.purpose === "delivery").length,
        maintenance: visits.filter(v => v.purpose === "maintenance").length,
      },
      peakHours: calculatePeakHours(visits),
      uniqueGuests: new Set(visits.map(v => v.guestId)).size,
    };

    if (args.format === "summary") {
      return { summary, visits: [] };
    }

    return { summary, visits: visitData };
  },
});

export const exportReportCSV = action({
  args: {
    estateId: v.id("estates"),
    dateRange: v.object({
      from: v.number(),
      to: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const reportData = await ctx.runQuery("reports:generateVisitorReport", {
      estateId: args.estateId,
      dateRange: args.dateRange,
      format: "detailed",
    });

    // Generate CSV content
    const headers = [
      "Date",
      "Check-in Time",
      "Check-out Time",
      "Guest Name",
      "ID Number",
      "Vehicle",
      "Purpose",
      "Host",
      "Unit",
      "Duration (hours)",
      "Status",
    ];

    const rows = reportData.visits.map((visit) => [
      new Date(visit.checkinTime).toLocaleDateString(),
      new Date(visit.checkinTime).toLocaleTimeString(),
      visit.checkoutTime ? new Date(visit.checkoutTime).toLocaleTimeString() : "Still in",
      visit.guest?.name || "Unknown",
      visit.guest?.idNumber || "",
      visit.guest?.vehicleRegistration || "",
      visit.purpose,
      visit.resident?.name || "Walk-in",
      visit.resident?.unitNumber || "",
      (visit.duration / (1000 * 60 * 60)).toFixed(2),
      visit.status.replace('_', ' '),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return {
      content: csvContent,
      filename: `visitor-report-${new Date().toISOString().split('T')[0]}.csv`,
      summary: reportData.summary,
    };
  },
});

function calculatePeakHours(visits: any[]) {
  const hourCounts: { [hour: number]: number } = {};
  
  visits.forEach(visit => {
    const hour = new Date(visit.checkinTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const sortedHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));

  return sortedHours;
}
```

#### 3.4.2 Report Generation Component

```typescript
// components/admin/ReportGenerator.tsx
"use client";

import { useState } from 'react';
import { useQuery, useAction } from 'convex/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, BarChart3 } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface ReportGeneratorProps {
  estateId: Id<"estates">;
}

export function ReportGenerator({ estateId }: ReportGeneratorProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [format, setFormat] = useState<"summary" | "detailed">("summary");
  const [filters, setFilters] = useState({
    purpose: "",
    status: "",
  });
  const [generating, setGenerating] = useState(false);

  const reportData = useQuery(api.reports.generateVisitorReport, {
    estateId,
    dateRange: {
      from: new Date(dateRange.from).getTime(),
      to: new Date(dateRange.to + 'T23:59:59').getTime(),
    },
    format,
    filters: filters.purpose || filters.status ? filters : undefined,
  });

  const exportCSV = useAction(api.reports.exportReportCSV);

  const handleExportCSV = async () => {
    setGenerating(true);
    try {
      const result = await exportCSV({
        estateId,
        dateRange: {
          from: new Date(dateRange.from).getTime(),
          to: new Date(dateRange.to + 'T23:59:59').getTime(),
        },
      });

      // Create and download file
      const blob = new Blob([result.content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Visitor Report
          </CardTitle>
          <CardDescription>
            Create detailed reports of visitor activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter by Purpose</Label>
              <Select value={filters.purpose} onValueChange={(value) => setFilters(prev => ({ ...prev, purpose: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All purposes</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filter by Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="overstay">Overstay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExportCSV} disabled={generating}>
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Export CSV'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Report Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.summary.totalVisits}
                </div>
                <p className="text-sm text-gray-600">Total Visits</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reportData.summary.uniqueGuests}
                </div>
                <p className="text-sm text-gray-600">Unique Guests</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {reportData.summary.checkedInCount}
                </div>
                <p className="text-sm text-gray-600">Currently In</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatDuration(reportData.summary.averageDuration)}
                </div>
                <p className="text-sm text-gray-600">Avg. Duration</p>
              </div>
            </div>

            {/* By Purpose Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Visits by Purpose</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Business: {reportData.summary.byPurpose.business}
                </Badge>
                <Badge variant="outline">
                  Personal: {reportData.summary.byPurpose.personal}
                </Badge>
                <Badge variant="outline">
                  Delivery: {reportData.summary.byPurpose.delivery}
                </Badge>
                <Badge variant="outline">
                  Maintenance: {reportData.summary.byPurpose.maintenance}
                </Badge>
              </div>
            </div>

            {/* Peak Hours */}
            {reportData.summary.peakHours.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Peak Hours</h4>
                <div className="flex flex-wrap gap-2">
                  {reportData.summary.peakHours.map((peak, index) => (
                    <Badge key={peak.hour} variant={index === 0 ? "default" : "outline"}>
                      {peak.hour}:00 ({peak.count} visits)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Acceptance Criteria**: ✅ CSV/PDF reports generation, detailed analytics, customizable date ranges and filters, automated summary statistics

### Task 3.5: Overstay Monitoring & Alerts (Days 41-42)

#### 3.5.1 Monitoring System

```typescript
// convex/monitoring.ts
import { query, internalMutation } from "./_generated/server";
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const checkOverstays = internalMutation({
  handler: async (ctx) => {
    // Get all estates
    const estates = await ctx.db.query("estates").collect();

    for (const estate of estates) {
      const thresholdMs = estate.settings.overstayThresholdHours * 60 * 60 * 1000;
      const cutoffTime = Date.now() - thresholdMs;

      // Find visits that have exceeded threshold
      const overstayVisits = await ctx.db
        .query("visits")
        .withIndex("by_estate_status", (q) => 
          q.eq("estateId", estate._id).eq("status", "checked_in")
        )
        .filter((q) => q.lt(q.field("checkinTime"), cutoffTime))
        .collect();

      // Update status and send alerts
      for (const visit of overstayVisits) {
        await ctx.db.patch(visit._id, { status: "overstay" });

        // Log audit event
        await ctx.db.insert("audit_logs", {
          action: "overstay_detected",
          entityType: "visit",
          entityId: visit._id,
          details: {
            duration: Date.now() - visit.checkinTime,
            threshold: thresholdMs,
          },
        });

        // Create alert
        await ctx.db.insert("alerts", {
          type: "overstay",
          visitId: visit._id,
          estateId: estate._id,
          message: "Guest has overstayed the allowed duration",
          isRead: false,
          priority: "high",
          createdAt: Date.now(),
        });
      }
    }

    return { processed: estates.length };
  },
});

export const getActiveAlerts = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .filter((q) => 
        q.and(
          q.eq(q.field("estateId"), args.estateId),
          q.eq(q.field("isRead"), false)
        )
      )
      .order("desc")
      .take(20);

    // Fetch related visit data
    const alertsWithData = await Promise.all(
      alerts.map(async (alert) => {
        if (alert.visitId) {
          const visit = await ctx.db.get(alert.visitId);
          const guest = visit ? await ctx.db.get(visit.guestId) : null;
          return { ...alert, visit, guest };
        }
        return alert;
      })
    );

    return alertsWithData;
  },
});

export const markAlertRead = internalMutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { 
      isRead: true,
      readAt: Date.now(),
    });
  },
});

// Schedule the overstay check to run every 15 minutes
const crons = cronJobs();
crons.interval(
  "check overstays",
  { minutes: 15 },
  internal.monitoring.checkOverstays
);
```

#### 3.5.2 Alert Schema Addition

```typescript
// convex/schema.ts (addition)
alerts: defineTable({
  type: v.union(v.literal("overstay"), v.literal("security"), v.literal("system")),
  visitId: v.optional(v.id("visits")),
  estateId: v.id("estates"),
  message: v.string(),
  isRead: v.boolean(),
  priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  createdAt: v.number(),
  readAt: v.optional(v.number()),
}).index("by_estate_unread", ["estateId", "isRead"])
  .index("by_created", ["createdAt"]),
```

**Acceptance Criteria**: ✅ Automated overstay detection, real-time alerts system, configurable thresholds, alert management dashboard

---

## 🎯 Phase 3 Acceptance Criteria

Before proceeding to Phase 4, ensure all the following criteria are met:

### ✅ Advanced Photo System
- [ ] Camera capture working on mobile and desktop browsers
- [ ] Photo preview and retake functionality operational
- [ ] File upload fallback for unsupported devices
- [ ] Image optimization and storage working correctly
- [ ] Photos displayed correctly in visitor profiles

### ✅ Enhanced Admin Features
- [ ] Detailed visitor profiles with photo and history
- [ ] Bulk operations (checkout multiple visitors)
- [ ] Visitor flagging and notes system
- [ ] Advanced filtering and search capabilities
- [ ] Real-time dashboard updates with new features

### ✅ Notification System
- [ ] SMS notifications sending successfully
- [ ] Email notifications configured and working
- [ ] Invitation delivery automated
- [ ] Notification logging and failure handling
- [ ] Template system for different message types

### ✅ Reporting System
- [ ] CSV export with comprehensive data
- [ ] Customizable date ranges and filters
- [ ] Summary statistics calculation
- [ ] Peak hours and analytics working
- [ ] Report generation completing under 30 seconds

### ✅ Monitoring & Alerts
- [ ] Automated overstay detection running
- [ ] Real-time alerts appearing in admin dashboard
- [ ] Configurable threshold settings
- [ ] Alert acknowledgment and management
- [ ] Scheduled monitoring jobs operational

### ✅ Performance & Security
- [ ] Photo uploads completing within 10 seconds
- [ ] Report generation optimized for large datasets
- [ ] Notification delivery reliable (>95% success rate)
- [ ] All new features secured with proper authorization
- [ ] No performance degradation with additional features

## 🚀 Next Steps

Once Phase 3 is complete, proceed to [Phase 4: Polish & Deploy](./phase-4-polish-deploy.md) which will implement:
- Comprehensive testing suite with >90% coverage
- Performance optimization and monitoring
- Security audit and penetration testing
- Production deployment with CI/CD
- Documentation and training materials

## 📚 Resources

- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Resend Email API](https://resend.com/docs)
- [Convex Actions](https://docs.convex.dev/functions/actions)
- [Convex Cron Jobs](https://docs.convex.dev/scheduling/cron-jobs) 