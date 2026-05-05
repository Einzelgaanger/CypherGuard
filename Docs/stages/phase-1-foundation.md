# Phase 1: Foundation & Setup (Weeks 1-2)

## 🎯 Phase Objectives

Establish the foundational infrastructure for the CypherSec Check-In MVP, including project setup, database architecture, basic authentication system, and core UI components.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository access
- Convex account created
- Vercel account for deployment
- Code editor (VS Code recommended)

## 🗓️ Timeline: 2 Weeks

### Week 1: Project Setup & Database
### Week 2: Authentication & Core UI

---

## 📝 Detailed Implementation Tasks

### Task 1.1: Project Initialization (Day 1)

#### 1.1.1 Create Next.js Application

```bash
# Create new Next.js project
npx create-next-app@14 cypherguard-checkin --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd cypherguard-checkin

# Install additional dependencies
pnpm install @radix-ui/react-icons @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select class-variance-authority clsx tailwind-merge lucide-react

# Install development dependencies
pnpm install -D @types/node prettier prettier-plugin-tailwindcss
```

#### 1.1.2 Install Shadcn/UI

```bash
# Initialize Shadcn/UI
npx shadcn-ui@latest init

# Install core components
npx shadcn-ui@latest add button input label card form select textarea badge alert-dialog dropdown-menu
```

#### 1.1.3 Configure Prettier and ESLint

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Acceptance Criteria**: ✅ Next.js app runs successfully, Shadcn/UI components work, linting passes

### Task 1.2: Convex Backend Setup (Day 2)

#### 1.2.1 Install and Configure Convex

```bash
# Install Convex
pnpm install convex

# Initialize Convex
npx convex dev
```

#### 1.2.2 Environment Configuration

```bash
# .env.local
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

#### 1.2.3 Convex Provider Setup

```typescript
// app/ConvexClientProvider.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

```typescript
// app/layout.tsx
import { ConvexClientProvider } from "./ConvexClientProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

**Acceptance Criteria**: ✅ Convex connection established, can deploy functions

### Task 1.3: Database Schema Implementation (Days 3-4)

#### 1.3.1 Define Core Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

  // Temporary OTP storage
  otps: defineTable({
    phone: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
    isUsed: v.boolean(),
    type: v.union(v.literal("login"), v.literal("verification")),
  }).index("by_phone", ["phone"])
    .index("by_expiry", ["expiresAt"]),

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

#### 1.3.2 Create Sample Data Seeder

```typescript
// convex/seed.ts
import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Create sample estate
    const estateId = await ctx.db.insert("estates", {
      name: "Riverside Gardens Estate",
      address: "123 Riverside Drive, Nairobi",
      settings: {
        overstayThresholdHours: 8,
        requirePhotoUpload: false,
        allowWalkIns: true,
      },
    });

    // Create sample admin user
    const adminUserId = await ctx.db.insert("users", {
      email: "admin@cypher.com",
      phone: "+254700000000",
      role: "admin",
      isActive: true,
    });

    // Create sample resident
    const residentUserId = await ctx.db.insert("users", {
      email: "resident@example.com",
      phone: "+254700000001",
      role: "resident",
      isActive: true,
    });

    await ctx.db.insert("residents", {
      userId: residentUserId,
      estateId,
      unitNumber: "A-101",
      name: "John Resident",
      isVerified: true,
    });

    return { success: true, estateId, adminUserId, residentUserId };
  },
});
```

**Acceptance Criteria**: ✅ Schema deployed successfully, sample data seeded, indexes working

### Task 1.4: Basic Authentication System (Days 5-6)

#### 1.4.1 OTP Generation and Verification

```typescript
// convex/auth.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate and send OTP
export const sendOTP = mutation({
  args: { 
    phone: v.string(),
    type: v.union(v.literal("login"), v.literal("verification"))
  },
  handler: async (ctx, args) => {
    // Clean up expired OTPs
    const expired = await ctx.db
      .query("otps")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", Date.now()))
      .collect();
    
    for (const otp of expired) {
      await ctx.db.delete(otp._id);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    await ctx.db.insert("otps", {
      phone: args.phone,
      otp: otpCode,
      expiresAt,
      isUsed: false,
      type: args.type,
    });

    // TODO: Send SMS via Twilio/Africa's Talking
    console.log(`OTP for ${args.phone}: ${otpCode}`);
    
    return { success: true, message: "OTP sent successfully" };
  },
});

// Verify OTP
export const verifyOTP = mutation({
  args: { 
    phone: v.string(), 
    otp: v.string() 
  },
  handler: async (ctx, args) => {
    // Find valid OTP
    const otpRecord = await ctx.db
      .query("otps")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .filter((q) => 
        q.and(
          q.eq(q.field("otp"), args.otp),
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .first();

    if (!otpRecord) {
      throw new Error("Invalid or expired OTP");
    }

    // Mark OTP as used
    await ctx.db.patch(otpRecord._id, { isUsed: true });

    // Find or create user
    let user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("phone"), args.phone))
      .first();

    if (!user) {
      // Create new user (guest by default)
      const userId = await ctx.db.insert("users", {
        email: "", // Will be updated later if needed
        phone: args.phone,
        role: "guest",
        isActive: true,
      });
      user = await ctx.db.get(userId);
    }

    return { 
      success: true, 
      user: {
        id: user!._id,
        phone: user!.phone,
        role: user!.role,
        email: user!.email,
      }
    };
  },
});

// Get current user (for authentication checks)
export const getCurrentUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    
    const user = await ctx.db.get(args.userId);
    return user ? {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    } : null;
  },
});
```

#### 1.4.2 Authentication Hook

```typescript
// lib/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export const useAuth = () => {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useQuery(api.auth.getCurrentUser, { userId: userId || undefined });
  const sendOTP = useMutation(api.auth.sendOTP);
  const verifyOTP = useMutation(api.auth.verifyOTP);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId as Id<"users">);
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string, otp: string) => {
    try {
      const result = await verifyOTP({ phone, otp });
      if (result.success) {
        setUserId(result.user.id);
        localStorage.setItem('userId', result.user.id);
        return result.user;
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('userId');
  };

  const requestOTP = async (phone: string, type: "login" | "verification") => {
    return await sendOTP({ phone, type });
  };

  return {
    user: userId ? user : null,
    isLoading: isLoading || (userId && user === undefined),
    isAuthenticated: !!user,
    login,
    logout,
    requestOTP,
  };
};
```

**Acceptance Criteria**: ✅ OTP generation/verification working, user sessions managed

### Task 1.5: Core UI Components (Days 7-9)

#### 1.5.1 Layout Components

```typescript
// components/layout/AppLayout.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                CypherSec Check-In
              </h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

#### 1.5.2 Form Components

```typescript
// components/forms/OTPForm.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';

interface OTPFormProps {
  onSuccess: (user: any) => void;
}

export function OTPForm({ onSuccess }: OTPFormProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { requestOTP, login } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestOTP(phone, 'login');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(phone, otp);
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'Enter your phone number to receive an OTP'
            : 'Enter the OTP sent to your phone'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('phone')}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 1.5.3 Guest Registration Form (Basic)

```typescript
// components/forms/GuestRegistrationForm.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
}

export function GuestRegistrationForm({ onSuccess, invitationToken }: GuestRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    vehicleRegistration: '',
    purpose: '',
    hostInfo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validatedData = guestSchema.parse(formData);
      
      // TODO: Submit to Convex in Phase 2
      console.log('Guest registration:', validatedData);
      
      onSuccess({
        ...validatedData,
        invitationToken,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Guest Registration</CardTitle>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Acceptance Criteria**: ✅ All UI components render correctly, forms validate input, responsive design works

### Task 1.6: Testing & Validation (Days 10-14)

#### 1.6.1 Setup Testing Framework

```bash
# Install testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

#### 1.6.2 Unit Tests

```typescript
// __tests__/components/GuestRegistrationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GuestRegistrationForm } from '@/components/forms/GuestRegistrationForm';

describe('GuestRegistrationForm', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    mockOnSuccess.mockClear();
  });

  test('renders all form fields', () => {
    render(<GuestRegistrationForm onSuccess={mockOnSuccess} />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/id\/passport number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vehicle registration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/purpose of visit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/host information/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<GuestRegistrationForm onSuccess={mockOnSuccess} />);
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });
});
```

#### 1.6.3 Integration Tests

```typescript
// __tests__/convex/auth.test.ts
import { ConvexTestingHelper } from 'convex/testing';
import { api } from '../convex/_generated/api';

describe('Authentication Flow', () => {
  let t: ConvexTestingHelper;

  beforeEach(async () => {
    t = new ConvexTestingHelper();
  });

  test('should generate and verify OTP', async () => {
    const phone = '+254700000000';
    
    // Send OTP
    const sendResult = await t.mutation(api.auth.sendOTP, {
      phone,
      type: 'login'
    });
    
    expect(sendResult.success).toBe(true);

    // Get OTP from database (for testing)
    const otps = await t.query("otps", {});
    const otp = otps.find(o => o.phone === phone);
    expect(otp).toBeDefined();

    // Verify OTP
    const verifyResult = await t.mutation(api.auth.verifyOTP, {
      phone,
      otp: otp!.otp
    });

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.user.phone).toBe(phone);
  });
});
```

**Acceptance Criteria**: ✅ All tests pass, code coverage >80%, no critical bugs

---

## 🎯 Phase 1 Acceptance Criteria

Before proceeding to Phase 2, ensure all the following criteria are met:

### ✅ Technical Requirements
- [ ] Next.js 14 application runs without errors
- [ ] Convex backend connection established and functions deployable
- [ ] Database schema implemented with all indexes
- [ ] Sample data successfully seeded
- [ ] OTP authentication flow working end-to-end
- [ ] All core UI components render correctly
- [ ] Form validation working properly
- [ ] Responsive design works on mobile and desktop

### ✅ Code Quality
- [ ] TypeScript strict mode enabled with no errors
- [ ] ESLint configuration passes without warnings
- [ ] Prettier formatting consistent across codebase
- [ ] All functions and components properly typed
- [ ] Unit tests passing with >80% coverage
- [ ] Integration tests for auth flow passing

### ✅ Security
- [ ] Environment variables properly configured
- [ ] OTP expiration and cleanup working
- [ ] Input validation preventing malformed data
- [ ] No sensitive data exposed in client code

### ✅ Performance
- [ ] Initial page load < 3 seconds
- [ ] Convex functions respond < 1 second
- [ ] No memory leaks in components
- [ ] Optimized bundle size

## 🚀 Next Steps

Once Phase 1 is complete, proceed to [Phase 2: Core Features](./phase-2-core-features.md) which will implement:
- Complete guest registration with Convex integration
- Resident dashboard and invitation management
- Basic admin dashboard with real-time visitor lists
- End-to-end user flows

## 📚 Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/) 