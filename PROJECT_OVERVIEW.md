# CypherGuard / CypherSec Check-In — Project Overview

This document describes the **CypherGuard** codebase (npm package name: `cypherguard-checkin`), marketed in the UI as **CypherSec Check-In**: a web application for **digital visitor management at gated estates**.

---

## Table of contents

1. [Purpose and problem statement](#1-purpose-and-problem-statement)  
2. [High-level architecture](#2-high-level-architecture)  
3. [Technology stack](#3-technology-stack)  
4. [User roles and personas](#4-user-roles-and-personas)  
5. [Application routes (Next.js App Router)](#5-application-routes-nextjs-app-router)  
6. [Data model (Convex schema)](#6-data-model-convex-schema)  
7. [Backend modules (`convex/`)](#7-backend-modules-convex)  
8. [Frontend structure (`src/`)](#8-frontend-structure-src)  
9. [Authentication and onboarding](#9-authentication-and-onboarding)  
10. [Real-time features](#10-real-time-features)  
11. [Reporting, notifications, and operations](#11-reporting-notifications-and-operations)  
12. [Documentation in this repository](#12-documentation-in-this-repository)  
13. [Local development](#13-local-development)  
14. [Implementation status and known gaps](#14-implementation-status-and-known-gaps)

---

## 1. Purpose and problem statement

**Goal:** Replace analogue **visitor logbooks** at gated residential estates with a **digital, structured, audit-friendly** system.

**Typical outcomes the product targets:**

- Guests can **self-register** or complete flows tied to a **resident invitation**.
- Residents can **pre-register guests**, share **invitation links**, and manage invitations.
- Estate **administrators or guards** monitor arrivals, perform **check-in/check-out**, see **alerts** (e.g. overstays), and produce **exports** for compliance or internal review.

The product positioning (from internal PRD material under `Docs/`) emphasizes **security visibility**, **consistent records**, and **lower operational friction** compared to paper processes.

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Next.js 14 App Router, React 18, Tailwind)        │
│  - Public guest flows, resident/admin dashboards            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Convex React client + Convex Auth
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex (serverless BaaS)                                     │
│  - Queries / mutations / actions                             │
│  - Real-time subscriptions                                   │
│  - File storage (guest photos)                               │
│  - Auth tables + HTTP routes for @convex-dev/auth            │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend:** Next.js, mostly **client components** where Convex hooks are used (`"use client"`).
- **Backend:** **Convex** functions colocated in `convex/`; types and API bindings are generated under `convex/_generated/`.
- **Auth:** **Convex Auth** (`@convex-dev/auth`) with password-based sign-in; additional helpers and **dev-only** login paths exist for local testing.

---

## 3. Technology stack

| Layer | Technology |
|--------|------------|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** |
| UI | **React 18**, **Tailwind CSS**, **shadcn-style** components (Radix primitives) |
| Forms / validation | **React Hook Form**, **Zod** |
| Backend | **Convex** (`convex` package) |
| Auth | **`@convex-dev/auth`**, **jose**, **jwt-decode** |
| QR / PDF | **qrcode.react**, **jsqr**, **jspdf**, **jspdf-autotable** |
| Toasts | **sonner** |

---

## 4. User roles and personas

The **`userRoles`** table models **exactly three roles** (see `convex/schema.ts`):

| Role | Typical use |
|------|-------------|
| **`guest`** | Visitor identity and visits; may also map to registered “guest” users where applicable. |
| **`resident`** | Estate resident: invitations, linked **resident** profile (unit, estate). |
| **`admin`** | Estate staff / security: dashboards, checkout, flags, user approvals, reports. |

**Registration requests** (`user_registration_requests`) restrict requested roles to **`resident`** or **`admin`** (guests are generally walk-in or invitation-driven, not self-requesting those roles in the same flow).

---

## 5. Application routes (Next.js App Router)

Routes live under `src/app/`. Summary:

| Path | Purpose |
|------|---------|
| `/` | Marketing-style **home**: links to guest check-in, dashboard hub, admin dashboard. |
| `/check-in` | **Guest walk-in registration** (`(guest)/check-in`). |
| `/invitation/[token]` | Guest flow using a **resident invitation token** (`(guest)/invitation/[token]`). |
| `/register` | **Self-registration** request for estate access (`(auth)/register`). |
| `/resident/login` | Resident **login**. |
| `/resident/dashboard` | Resident **invitations** and related UI. |
| `/admin/dashboard` | **Guard/admin** operational dashboard (visitors, checkout, alerts, etc.). |
| `/admin/users` | **User management** / registration approvals UI. |
| `/dashboard` | **Hub** to choose resident vs admin dashboard (not role-gated by itself). |
| `/complete-signup` | Finish account setup after approval (**temporary password** flow). |
| `/dev-login` | **Development** role impersonation / quick login (not for production). |
| `/migration` | **Data migration / admin utilities** (Convex-backed). |

Global layout wraps the app with **fonts**, **Convex + Convex Auth providers**, and a **debug menu** (development-oriented).

---

## 6. Data model (Convex schema)

Defined in `convex/schema.ts`. Convex **Auth** tables are merged in via `authTables` from `@convex-dev/auth/server`.

### Core domain

| Table | Role |
|-------|------|
| **`estates`** | Estate metadata and **settings** (overstay threshold hours, photo requirement, walk-ins allowed). |
| **`residents`** | Resident profile: estate, unit, name, verification flag; keyed in part by email for joins. |
| **`guests`** | Visitor identity: name, ID number, optional vehicle, phone, email, optional **photo** (`_storage` id). |
| **`invitations`** | Resident-issued invites: guest details, **opaque token**, expiry, arrival window, used flag. |
| **`visits`** | Check-in record: guest, optional resident/invitation, estate, times, purpose, status (`checked_in` / `checked_out` / `overstay`), admin notes. |

### Access control and onboarding

| Table | Role |
|-------|------|
| **`userRoles`** | Email + **role** (`guest` \| `resident` \| `admin`) + `isActive` + optional names. |
| **`user_registration_requests`** | Pending **resident/admin** signup requests for staff review. |
| **`pending_auth_setup`** | Post-approval **temporary password** and metadata until first real signup completes. |

### Security and communications

| Table | Role |
|-------|------|
| **`audit_logs`** | **Immutable-style** audit trail: action, entity type/id, JSON details, optional user/IP/user-agent. |
| **`notification_logs`** | Outbound **SMS/email** log lines (type, recipient, message, status, notification type, timestamp). |
| **`alerts`** | Estate-level **overstay / security / system** alerts with read state and priority. |

### Legacy / auxiliary

| Table | Role |
|-------|------|
| **`otps`** | OTP storage schema (phone, code, expiry); product docs reference SMS OTP; wiring may be partial—see [§14](#14-implementation-status-and-known-gaps). |

---

## 7. Backend modules (`convex/`)

| File | Responsibility |
|------|------------------|
| **`schema.ts`** | Database schema: domain + auth tables. |
| **`auth.ts`** | Convex Auth wiring (`convexAuth`), **`currentUser`**, **`createUserRole`**, **`getCurrentResident`**, re-exports `signIn` / `signOut` / `store`. |
| **`auth.config.ts`** | Auth provider configuration for Convex. |
| **`http.ts`** | HTTP router; registers **Convex Auth HTTP routes**. |
| **`admin.ts`** | Admin dashboard data, **checkout**, bulk checkout, visitor details, **flag** visitor, **registration review**, **user listing** and status/role updates, **pending auth setup** queries, **mark setup used**, stats. |
| **`guests.ts`** | **Guest registration**, photo upload mutation, **invitation validation**, visit lookup helpers. |
| **`residents.ts`** | **Create/list/delete invitations**, resident profile query. |
| **`userManagement.ts`** | **Registration request** submission, email verification hooks, profile reads/updates, listing requests. |
| **`notifications.ts`** | Welcome / setup-complete **email-style** mutations (logging + dev console output), **`sendSMS` / `sendEmail`** test mutations writing **`notification_logs`**. |
| **`reports.ts`** | Visitor **report query** and **CSV export action**. |
| **`subscriptions.ts`** | Long-lived **real-time subscription queries** for visitors, invitations, estate activity, alerts. |
| **`monitoring.ts`** | **Overstay checks**, **alerts** listing, mark read (includes internal mutations). |
| **`simpleAuth.ts`** | Auxiliary **current user** / **createUserRole** / resident resolution (overlaps conceptually with `auth.ts`—historical layering). |
| **`seed.ts`** | **`seedDatabase`** mutation for development/demo data. |
| **`migration.ts`** | One-off **migration / admin user creation** utilities. |
| **`cleanup.ts`** | **Cleanup / reset** style mutations for dev or support. |

Cron or scheduled jobs, if present, would typically live in a `crons.ts` or be referenced from Convex dashboard configuration; **overstay logic** is implemented in `monitoring.ts` for use by jobs or internal calls depending on deployment.

---

## 8. Frontend structure (`src/`)

### `src/app/`

Next.js **routes**, layouts, and **`ConvexClientProvider`** (Convex URL from `NEXT_PUBLIC_CONVEX_URL`).

### `src/components/`

| Area | Examples |
|------|----------|
| **`admin/`** | `InvitationManager`, `UserManagementDashboard`, `ReportGenerator`, `NotificationManager`, `VisitorDetailsModal`, `RegistrationRequestCard`. |
| **`auth/`** | `LoginForm`, `SelfRegistrationForm`. |
| **`forms/`** | `GuestRegistrationForm`, `OTPForm` (OTP path may be limited—see §14). |
| **`guest/`** | `DigitalPass` (post check-in UX). |
| **`photo/`** | `PhotoUpload`, `CameraCapture`. |
| **`qr/`** | `QRScanner` (e.g. gate / device camera flows). |
| **`layout/`** | `AppLayout` shared chrome. |
| **`debug/`** | `DebugMenu` for development. |
| **`ui/`** | shadcn-style primitives (button, card, dialog, tabs, etc.). |

### `src/lib/`

Hooks such as **`useAuth`** (wraps Convex Auth `signIn`/`signOut`, optional **dev user** from `localStorage`).

---

## 9. Authentication and onboarding

1. **Convex Auth (password)**  
   Primary path uses **`@convex-dev/auth`** (`signIn("password", …)` from the client).

2. **Self-service registration**  
   Users can submit **`user_registration_requests`**; **admins** approve or reject; approved users may receive **welcome** / setup messaging (see `notifications.ts`).

3. **`/complete-signup`**  
   Uses **URL search params** (`email`) and **`pending_auth_setup`** to validate a **temporary password**, then drives password account creation and **`markAuthSetupUsed`**.

4. **Dev login (`/dev-login`)**  
   Simulates roles via **`localStorage`** / dev paths for **local testing**; must not be relied on in production security models.

---

## 10. Real-time features

Convex **reactive queries** power live dashboards. `convex/subscriptions.ts` exposes subscription-oriented queries such as:

- Visitor stream for an estate  
- Invitations for a resident  
- Estate activity feed  
- Alerts feed  

The admin UI composes these for **near real-time** operational awareness (exact usage per page is in the respective `page.tsx` / admin components).

---

## 11. Reporting, notifications, and operations

- **Reports:** `reports.ts` supports visitor reporting and **CSV export** (action) for date-bounded extracts. Admin UI includes **PDF-oriented** tooling via **jsPDF** in components such as `ReportGenerator`.  
- **Notifications:** Production email/SMS providers are **not fully wired** in all paths; several flows **log** to `notification_logs` and **console** for development. Test SMS/email from **`NotificationManager`** hit **`sendSMS` / `sendEmail`** mutations.  
- **Monitoring:** Overstay detection and **alerts** support guard workflows (`monitoring.ts`, `alerts` table).  
- **Audit:** `audit_logs` records sensitive admin actions (approvals, status changes, etc.—see `admin.ts` patterns).

---

## 12. Documentation in this repository

| Location | Contents |
|----------|----------|
| **`Docs/PRD.MD`** | Product requirements: personas, use cases, functional breakdown. |
| **`Docs/TECHNICAL_IMPLEMENTATION_PLAN.md`** | Stack, architecture diagram, security/compliance notes. |
| **`Docs/stages/README.md`** | Phased implementation roadmap (Phases 1–4) and status. |
| **`Docs/stages/phase-*.md`** | Detailed phase guides. |
| **`convex/README.md`** | Convex-specific getting started. |
| **`EMAIL_INTEGRATION_GUIDE.md`** | Email provider integration notes (if present in tree). |

The root **`README.md`** is still the generic **create-next-app** template; **this file** (`PROJECT_OVERVIEW.md`) is the **project-specific** overview.

---

## 13. Local development

**Prerequisites:** Node.js, npm, a **Convex** project (deployment) and CLI auth.

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies. |
| `npm run dev` | Next.js **development** server (default port 3000). |
| `npm run build` | **Production** build (see note below). |
| `npm run start` | Serve **production** build. |
| `npm run lint` | ESLint. |
| `npx convex dev` | Sync functions, run Convex dev deployment, regenerate `_generated` in active development. |
| `npx convex codegen` | Regenerate Convex client types from functions. |

**Environment:** `NEXT_PUBLIC_CONVEX_URL` is required for the browser client (see `ConvexClientProvider.tsx`). Other variables may include `SITE_URL` and provider keys as you integrate email/SMS.

**Note on builds:** `next.config.mjs` may set **`eslint.ignoreDuringBuilds: true`** so that legacy lint noise does not block `next build`. Long-term, fixing lint and re-enabling build-time ESLint is recommended.

---

## 14. Implementation status and known gaps

Phased status is summarized under **`Docs/stages/README.md`** (e.g. Phase 2 marked complete for core flows; later phases partial).

Representative gaps or “MVP vs vision” items to be aware of:

- **Phone OTP:** Schema and UI pieces exist (`otps`, `OTPForm`), but **`useAuth`** may expose **`requestOTP`** as **not enabled** for Convex Auth’s current password-centric setup—verify before marketing OTP login.  
- **External messaging:** Many notification paths are **development logging** rather than live **Twilio / Resend** sends.  
- **Hardware:** Gate hardware (ANPR, barriers) is **out of scope** for the MVP described in `Docs/PRD.MD`.  
- **Dual auth helpers:** Both **`convex/auth.ts`** and **`convex/simpleAuth.ts`** expose overlapping concepts (`createUserRole`, `getCurrentResident`); new contributors should trace **which API** each page imports from `convex/_generated/api`.

---

## Naming

- **Repository / package:** CypherGuard (`cypherguard-checkin`).  
- **Product UI / metadata:** **CypherSec Check-In** (`src/app/page.tsx`, `layout.tsx` metadata, `public/manifest.json`).

---

*Generated as a living overview of the repository layout and intent. Update this file when architecture or major flows change.*
