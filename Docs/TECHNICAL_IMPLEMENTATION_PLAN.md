# CypherSec Check-In MVP - Technical Implementation Plan

## 1. Executive Summary

This technical implementation plan outlines the architecture, technology stack, and development roadmap for CypherSec's Check-In MVP - a digital visitor management system for gated estates. The solution will be built using modern web technologies with a focus on security, scalability, and user experience.

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI with Radix primitives
- **State Management**: React Server Components + Convex real-time subscriptions
- **Forms**: React Hook Form with Zod validation
- **File Upload**: Native HTML5 with Convex file storage

### Backend
- **Platform**: Convex (serverless backend-as-a-service)
- **Database**: Convex (real-time NoSQL with ACID transactions)
- **Authentication**: Convex Auth with custom OTP implementation
- **File Storage**: Convex file storage
- **Real-time**: Convex subscriptions
- **Scheduled Jobs**: Convex cron jobs

### Infrastructure & Services
- **Hosting**: Vercel (Frontend) + Convex (Backend)
- **SMS Gateway**: Twilio or Africa's Talking (Kenya focus)
- **Email Service**: Resend or SendGrid
- **Analytics**: Convex analytics + custom dashboard
- **Monitoring**: Vercel Analytics + Sentry for error tracking

### Security & Compliance
- **Encryption**: TLS 1.3 in transit, AES-256 at rest (Convex default)
- **Authentication**: Multi-factor with OTP
- **Access Control**: RBAC with Convex auth
- **Audit Logging**: Immutable audit trails in Convex
- **Data Protection**: Kenya DPA 2019 compliance

## 3. System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile/Web    │    │   Admin Panel   │    │  QR Code Entry  │
│   (Guests)      │    │   (Guards)      │    │   (Gate)        │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
          ┌─────────────────────────────────────────────┐
          │           Next.js Frontend                  │
          │        (Vercel Deployment)                  │
          └─────────────────┬───────────────────────────┘
                            │
          ┌─────────────────────────────────────────────┐
          │             Convex Backend                  │
          │   ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
          │   │Database │ │Real-time│ │File Storage │  │
          │   │         │ │Sync     │ │             │  │
          │   └─────────┘ └─────────┘ └─────────────┘  │
          └─────────────────┬───────────────────────────┘
                            │
          ┌─────────────────────────────────────────────┐
          │          External Services                  │
          │   ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
          │   │SMS/OTP  │ │Email    │ │Analytics    │  │
          │   │Service  │ │Service  │ │& Monitoring │  │
          │   └─────────┘ └─────────┘ └─────────────┘  │
          └─────────────────────────────────────────────┘
```

### Component Architecture
```
Frontend (Next.js)
├── app/
│   ├── (guest)/
│   │   ├── check-in/
│   │   └── invitation/[token]/
│   ├── (resident)/
│   │   ├── dashboard/
│   │   └── invitations/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── visitors/
│   │   └── reports/
│   └── api/
├── components/
│   ├── ui/ (Shadcn components)
│   ├── forms/
│   ├── dashboard/
│   └── shared/
└── lib/
    ├── convex/
    ├── utils/
    └── validations/
```

## 4. Database Schema (Convex)

### Core Entities

```typescript
// users table
interface User {
  _id: Id<"users">;
  _creationTime: number;
  email: string;
  phone?: string;
  role: "guest" | "resident" | "admin";
  isActive: boolean;
}

// residents table
interface Resident {
  _id: Id<"residents">;
  _creationTime: number;
  userId: Id<"users">;
  estateId: Id<"estates">;
  unitNumber: string;
  name: string;
  isVerified: boolean;
}

// guests table
interface Guest {
  _id: Id<"guests">;
  _creationTime: number;
  name: string;
  idNumber: string;
  vehicleRegistration?: string;
  photoStorageId?: Id<"_storage">;
  phone?: string;
  email?: string;
}

// invitations table
interface Invitation {
  _id: Id<"invitations">;
  _creationTime: number;
  residentId: Id<"residents">;
  guestName: string;
  guestIdNumber: string;
  guestPhone?: string;
  vehicleRegistration?: string;
  token: string; // unique invitation token
  expiresAt: number;
  isUsed: boolean;
  arrivalWindow: {
    from: number;
    to: number;
  };
}

// visits table
interface Visit {
  _id: Id<"visits">;
  _creationTime: number;
  guestId: Id<"guests">;
  residentId?: Id<"residents">;
  invitationId?: Id<"invitations">;
  estateId: Id<"estates">;
  checkinTime: number;
  checkoutTime?: number;
  purpose: string;
  status: "checked_in" | "checked_out" | "overstay";
  adminNotes?: string;
  checkedInBy?: Id<"users">; // admin who verified
}

// estates table
interface Estate {
  _id: Id<"estates">;
  _creationTime: number;
  name: string;
  address: string;
  settings: {
    overstayThresholdHours: number;
    requirePhotoUpload: boolean;
    allowWalkIns: boolean;
  };
}

// audit_logs table
interface AuditLog {
  _id: Id<"audit_logs">;
  _creationTime: number;
  userId?: Id<"users">;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
```

### Database Indexes

```typescript
// Convex schema with indexes
export default defineSchema({
  users: defineTable({
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("guest"), v.literal("resident"), v.literal("admin")),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  residents: defineTable({
    userId: v.id("users"),
    estateId: v.id("estates"),
    unitNumber: v.string(),
    name: v.string(),
    isVerified: v.boolean(),
  }).index("by_estate", ["estateId"])
    .index("by_user", ["userId"]),

  guests: defineTable({
    name: v.string(),
    idNumber: v.string(),
    vehicleRegistration: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_id_number", ["idNumber"]),

  invitations: defineTable({
    residentId: v.id("residents"),
    guestName: v.string(),
    guestIdNumber: v.string(),
    guestPhone: v.optional(v.string()),
    vehicleRegistration: v.optional(v.string()),
    token: v.string(),
    expiresAt: v.number(),
    isUsed: v.boolean(),
    arrivalWindow: v.object({
      from: v.number(),
      to: v.number(),
    }),
  }).index("by_token", ["token"])
    .index("by_resident", ["residentId"])
    .index("by_expiry", ["expiresAt"]),

  visits: defineTable({
    guestId: v.id("guests"),
    residentId: v.optional(v.id("residents")),
    invitationId: v.optional(v.id("invitations")),
    estateId: v.id("estates"),
    checkinTime: v.number(),
    checkoutTime: v.optional(v.number()),
    purpose: v.string(),
    status: v.union(v.literal("checked_in"), v.literal("checked_out"), v.literal("overstay")),
    adminNotes: v.optional(v.string()),
    checkedInBy: v.optional(v.id("users")),
  }).index("by_estate_status", ["estateId", "status"])
    .index("by_guest", ["guestId"])
    .index("by_checkin_time", ["checkinTime"]),

  estates: defineTable({
    name: v.string(),
    address: v.string(),
    settings: v.object({
      overstayThresholdHours: v.number(),
      requirePhotoUpload: v.boolean(),
      allowWalkIns: v.boolean(),
    }),
  }),

  audit_logs: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.any(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_action", ["action"]),
});
```

## 5. API Design (Convex Functions)

### Authentication Functions

```typescript
// convex/auth.ts
export const sendOTP = mutation({
  args: { 
    phone: v.string(),
    type: v.union(v.literal("login"), v.literal("verification"))
  },
  handler: async (ctx, args) => {
    // Generate 6-digit OTP
    // Store in temporary table with expiry
    // Send via SMS service
    // Return success/failure
  },
});

export const verifyOTP = mutation({
  args: { 
    phone: v.string(), 
    otp: v.string() 
  },
  handler: async (ctx, args) => {
    // Verify OTP from temporary table
    // Create/update user session
    // Return auth token
  },
});
```

### Guest Functions

```typescript
// convex/guests.ts
export const registerGuest = mutation({
  args: {
    name: v.string(),
    idNumber: v.string(),
    vehicleRegistration: v.optional(v.string()),
    purpose: v.string(),
    hostInfo: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    invitationToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate invitation if provided
    // Create/update guest record
    // Create visit record
    // Send notifications
    // Return visit details and digital pass
  },
});

export const uploadGuestPhoto = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate upload URL for guest photo
    return await ctx.storage.generateUploadUrl();
  },
});
```

### Resident Functions

```typescript
// convex/residents.ts
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
    // Verify resident authentication
    // Generate unique invitation token
    // Create invitation record
    // Send invitation link via SMS/email
    // Return invitation details
  },
});

export const getMyInvitations = query({
  args: {},
  handler: async (ctx) => {
    // Get current resident from auth
    // Return active invitations with status
  },
});
```

### Admin Functions

```typescript
// convex/admin.ts
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
    // Verify admin authentication
    // Return filtered visitor data
    // Include real-time status updates
  },
});

export const checkoutVisitor = mutation({
  args: { 
    visitId: v.id("visits"),
    adminNotes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Verify admin authentication
    // Update visit checkout time
    // Log audit trail
    // Send notifications if needed
  },
});

export const generateReport = query({
  args: {
    estateId: v.id("estates"),
    dateRange: v.object({
      from: v.number(),
      to: v.number(),
    }),
    format: v.union(v.literal("csv"), v.literal("pdf")),
  },
  handler: async (ctx, args) => {
    // Verify admin authentication
    // Query visits in date range
    // Format data for export
    // Return download URL or data
  },
});
```

### Real-time Subscriptions

```typescript
// convex/subscriptions.ts
export const subscribeToVisitors = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    // Return real-time visitor data
    // Updates automatically via Convex subscriptions
  },
});
```

## 6. Frontend Implementation

### 6.1 Route Structure

```typescript
// app/layout.tsx - Root layout with providers
// app/(guest)/layout.tsx - Guest-specific layout
// app/(resident)/layout.tsx - Resident-specific layout  
// app/(admin)/layout.tsx - Admin-specific layout

// Guest Routes
// app/(guest)/check-in/page.tsx - Walk-in registration
// app/(guest)/invitation/[token]/page.tsx - Pre-invited guest check-in
// app/(guest)/success/page.tsx - Check-in confirmation

// Resident Routes
// app/(resident)/auth/page.tsx - OTP login
// app/(resident)/dashboard/page.tsx - Main dashboard
// app/(resident)/invitations/page.tsx - Manage invitations
// app/(resident)/invitations/new/page.tsx - Create invitation

// Admin Routes
// app/(admin)/auth/page.tsx - Admin login
// app/(admin)/dashboard/page.tsx - Real-time visitor dashboard
// app/(admin)/visitors/page.tsx - Visitor management
// app/(admin)/reports/page.tsx - Export and analytics
```

### 6.2 Key Components

```typescript
// components/forms/GuestRegistrationForm.tsx
interface GuestRegistrationFormProps {
  invitationToken?: string;
  onSuccess: (visitData: any) => void;
}

// components/dashboard/VisitorCard.tsx
interface VisitorCardProps {
  visit: Visit;
  guest: Guest;
  onCheckout: (visitId: string) => void;
  showActions?: boolean;
}

// components/dashboard/RealTimeVisitorList.tsx
interface RealTimeVisitorListProps {
  estateId: string;
  filter: 'all' | 'expected' | 'checked_in';
}

// components/invitations/InvitationCard.tsx
interface InvitationCardProps {
  invitation: Invitation;
  onShare: (token: string) => void;
  onDelete: (id: string) => void;
}
```

### 6.3 Real-time Updates

```typescript
// hooks/useRealTimeVisitors.ts
export const useRealTimeVisitors = (estateId: string) => {
  const visitors = useQuery(api.subscriptions.subscribeToVisitors, { 
    estateId 
  });
  
  return {
    visitors: visitors ?? [],
    isLoading: visitors === undefined,
  };
};

// hooks/useResidentInvitations.ts
export const useResidentInvitations = () => {
  const invitations = useQuery(api.residents.getMyInvitations);
  
  return {
    invitations: invitations ?? [],
    isLoading: invitations === undefined,
  };
};
```

## 7. Security Implementation

### 7.1 Authentication & Authorization

```typescript
// convex/auth.ts - Custom auth implementation
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();
  },
});

// middleware/auth.ts - Route protection
export const requireAuth = (handler: any) => {
  return async (ctx: any, args: any) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return handler(ctx, { ...args, currentUser: user });
  };
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (handler: any) => {
    return requireAuth(async (ctx: any, args: any) => {
      if (!roles.includes(args.currentUser.role)) {
        throw new Error("Insufficient permissions");
      }
      return handler(ctx, args);
    });
  };
};
```

### 7.2 Data Validation

```typescript
// lib/validations/guest.ts
export const guestRegistrationSchema = z.object({
  name: z.string().min(2).max(100),
  idNumber: z.string().min(5).max(20),
  vehicleRegistration: z.string().optional(),
  purpose: z.enum(['business', 'personal', 'delivery', 'maintenance']),
  hostInfo: z.string().min(2).max(200),
});

// lib/validations/invitation.ts
export const invitationSchema = z.object({
  guestName: z.string().min(2).max(100),
  guestIdNumber: z.string().min(5).max(20),
  guestPhone: z.string().optional(),
  vehicleRegistration: z.string().optional(),
  arrivalWindow: z.object({
    from: z.number(),
    to: z.number(),
  }),
});
```

### 7.3 Audit Logging

```typescript
// convex/audit.ts
export const logAuditEvent = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    details: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    await ctx.db.insert("audit_logs", {
      userId: user?._id,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      details: args.details,
      ipAddress: ctx.auth.getUserIdentity()?.ipAddress,
      userAgent: ctx.auth.getUserIdentity()?.userAgent,
    });
  },
});
```

## 8. Performance Optimization

### 8.1 Frontend Optimization

```typescript
// app/layout.tsx - Performance monitoring
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// components/ui/LazyImage.tsx - Optimized image loading
import Image from 'next/image';
import { useState } from 'react';

export const LazyImage = ({ src, alt, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative">
      {isLoading && <div className="animate-pulse bg-gray-200" />}
      <Image
        src={src}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
};
```

### 8.2 Database Optimization

```typescript
// Efficient queries with proper indexing
export const getActiveVisitors = query({
  args: { estateId: v.id("estates") },
  handler: async (ctx, args) => {
    // Use index for efficient querying
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => 
        q.eq("estateId", args.estateId).eq("status", "checked_in")
      )
      .order("desc")
      .take(100);
    
    // Batch fetch related data
    const guestIds = visits.map(v => v.guestId);
    const guests = await Promise.all(
      guestIds.map(id => ctx.db.get(id))
    );
    
    return visits.map((visit, index) => ({
      ...visit,
      guest: guests[index],
    }));
  },
});
```

## 9. Testing Strategy

### 9.1 Unit Testing

```typescript
// __tests__/utils/validation.test.ts
import { guestRegistrationSchema } from '@/lib/validations/guest';

describe('Guest Registration Validation', () => {
  test('should validate correct guest data', () => {
    const validData = {
      name: 'John Doe',
      idNumber: '12345678',
      purpose: 'business',
      hostInfo: 'Unit 123',
    };
    
    expect(() => guestRegistrationSchema.parse(validData)).not.toThrow();
  });
  
  test('should reject invalid guest data', () => {
    const invalidData = {
      name: 'J',
      idNumber: '123',
      purpose: 'invalid',
      hostInfo: '',
    };
    
    expect(() => guestRegistrationSchema.parse(invalidData)).toThrow();
  });
});
```

### 9.2 Integration Testing

```typescript
// __tests__/api/guests.test.ts
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../convex/_generated/api';

describe('Guest Registration API', () => {
  let t: ConvexTestingHelper;
  
  beforeEach(async () => {
    t = new ConvexTestingHelper();
  });
  
  test('should register a walk-in guest', async () => {
    const result = await t.mutation(api.guests.registerGuest, {
      name: 'John Doe',
      idNumber: '12345678',
      purpose: 'business',
      hostInfo: 'Unit 123',
    });
    
    expect(result).toHaveProperty('visitId');
    expect(result).toHaveProperty('digitalPass');
  });
});
```

### 9.3 E2E Testing

```typescript
// e2e/guest-registration.spec.ts
import { test, expect } from '@playwright/test';

test('guest can complete walk-in registration', async ({ page }) => {
  await page.goto('/check-in');
  
  await page.fill('[name="name"]', 'John Doe');
  await page.fill('[name="idNumber"]', '12345678');
  await page.selectOption('[name="purpose"]', 'business');
  await page.fill('[name="hostInfo"]', 'Unit 123');
  
  await page.click('[type="submit"]');
  
  await expect(page.locator('text=Check-in Successful')).toBeVisible();
  await expect(page.locator('[data-testid="digital-pass"]')).toBeVisible();
});
```

## 10. Deployment Strategy

### 10.1 Environment Setup

```typescript
// Environment Variables
CONVEX_DEPLOYMENT=your-convex-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 10.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx convex deploy --prod

  deploy-frontend:
    needs: [test, deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 11. Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup and environment configuration
- [ ] Database schema implementation in Convex
- [ ] Basic authentication system (OTP)
- [ ] Core UI components with Shadcn
- [ ] Guest registration form and validation

### Phase 2: Core Features (Weeks 3-4)
- [ ] Walk-in guest registration flow
- [ ] Resident authentication and dashboard
- [ ] Invitation creation and management
- [ ] Basic admin dashboard
- [ ] Real-time visitor updates

### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Photo upload functionality
- [ ] Advanced admin features (checkout, notes)
- [ ] Audit logging and security measures
- [ ] Report generation (CSV/PDF)
- [ ] SMS and email notifications

### Phase 4: Polish & Deploy (Weeks 7-8)
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security audit and penetration testing
- [ ] Documentation and training materials
- [ ] Production deployment and monitoring

## 12. Monitoring & Analytics

### 12.1 Application Monitoring

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export const captureException = (error: Error, context?: any) => {
  Sentry.captureException(error, { extra: context });
};

export const captureUserActivity = (action: string, userId?: string) => {
  Sentry.addBreadcrumb({
    message: action,
    level: 'info',
    data: { userId },
  });
};
```

### 12.2 Business Metrics

```typescript
// convex/analytics.ts
export const getUsageMetrics = query({
  args: {
    estateId: v.id("estates"),
    period: v.union(v.literal("day"), v.literal("week"), v.literal("month")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }[args.period];
    
    const startTime = now - periodMs;
    
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_estate_status", (q) => q.eq("estateId", args.estateId))
      .filter((q) => q.gte(q.field("checkinTime"), startTime))
      .collect();
    
    return {
      totalVisits: visits.length,
      walkIns: visits.filter(v => !v.invitationId).length,
      preRegistered: visits.filter(v => v.invitationId).length,
      averageStayTime: calculateAverageStayTime(visits),
      peakHours: calculatePeakHours(visits),
    };
  },
});
```

## 13. Risk Mitigation

### 13.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|---------|-------------|------------|
| Convex service outage | High | Low | Implement offline mode with local storage sync |
| SMS delivery failures | Medium | Medium | Multiple SMS providers + fallback to email |
| High concurrent load | Medium | Medium | Implement rate limiting and caching |
| Data corruption | High | Low | Regular backups + transaction rollback capabilities |

### 13.2 Security Risks

| Risk | Impact | Mitigation |
|------|---------|------------|
| Data breaches | High | Encryption at rest/transit, regular security audits |
| Unauthorized access | High | Multi-factor authentication, session management |
| DDoS attacks | Medium | Cloudflare protection, rate limiting |
| Injection attacks | Medium | Input validation, parameterized queries |

## 14. Compliance & Data Protection

### 14.1 Kenya DPA 2019 Compliance

```typescript
// components/ConsentFlow.tsx
export const ConsentFlow = () => {
  return (
    <div className="space-y-4">
      <h3>Data Protection Notice</h3>
      <p>Your personal data will be processed in accordance with Kenya's Data Protection Act 2019...</p>
      
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" required />
          <span>I consent to processing of my personal data for visitor management</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input type="checkbox" />
          <span>I consent to receiving SMS notifications about my visit</span>
        </label>
      </div>
    </div>
  );
};
```

### 14.2 Data Retention Policy

```typescript
// convex/dataRetention.ts
export const cleanupExpiredData = internalMutation({
  handler: async (ctx) => {
    const retentionPeriod = 365 * 24 * 60 * 60 * 1000; // 1 year
    const cutoffTime = Date.now() - retentionPeriod;
    
    // Clean up old visits
    const oldVisits = await ctx.db
      .query("visits")
      .withIndex("by_checkin_time", (q) => q.lt("checkinTime", cutoffTime))
      .collect();
    
    for (const visit of oldVisits) {
      await ctx.db.delete(visit._id);
    }
    
    // Clean up expired invitations
    const expiredInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", Date.now()))
      .collect();
    
    for (const invitation of expiredInvitations) {
      await ctx.db.delete(invitation._id);
    }
  },
});

// Schedule cleanup job
const crons = cronJobs();
crons.daily("cleanup expired data", { hourUTC: 2 }, internal.dataRetention.cleanupExpiredData);
```

## 15. Success Metrics

### 15.1 Technical KPIs
- Page load time < 2 seconds (95th percentile)
- API response time < 500ms (95th percentile)
- 99.9% uptime SLA
- Zero data loss incidents
- < 1% error rate

### 15.2 Business KPIs
- Registration completion rate > 90%
- User adoption rate (residents creating invitations)
- Reduction in manual log-book usage
- Admin efficiency improvements
- Security incident reduction

---

This technical implementation plan provides a comprehensive roadmap for building CypherSec's Check-In MVP using modern, scalable technologies while maintaining security and compliance requirements. The phased approach ensures deliverable milestones and manageable complexity throughout the development process. 