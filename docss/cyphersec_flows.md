# CypherSec Check-In — Page Flows & Component Architecture

> POC scope: hardcoded credentials via `.env`, mock data throughout, no live backend calls.

---

## Roles & Credentials (POC)

| Role | Email | Password (env key) |
|------|-------|---------------------|
| Admin | admin@cyphersec.io | `VITE_ADMIN_PASS` |
| Tenant (Unit 4A) | tenant.4a@cyphersec.io | `VITE_TENANT_PASS` |
| Tenant (Unit 7B) | tenant.7b@cyphersec.io | `VITE_TENANT_PASS` |
| Guard | guard@cyphersec.io | `VITE_GUARD_PASS` |

---

## 1. Public / Unauthenticated

### 1.1 Landing Page `/`

**Purpose:** Marketing-style splash and role entry point.

**Sections:**
- Hero: estate name, tagline, "Powered by CypherSec" badge
- Three CTA cards: "I'm a Resident" → `/login?role=tenant` | "Guard Login" → `/login?role=guard` | "Admin" → `/login?role=admin`
- Feature strip: Real-time visibility / Instant alerts / Audit trail / Resident pre-registration
- Footer: version, estate name

**Extra flows:**
- Visiting a restricted route while unauthenticated → redirect to `/login` with `?redirect=` param

---

### 1.2 Login Page `/login`

**Purpose:** Single login page that morphs per role.

**Components:**
- `RoleTabSelector` — tabs: Admin / Tenant / Guard (pre-selected by query param)
- `LoginForm` — email + password fields, "Remember me", Submit
- `ErrorToast` — invalid credentials
- `ForgotPasswordNote` — "Contact your estate admin" (POC: no flow)

**Logic:**
- On success → redirect to role-specific dashboard
- Role stored in `localStorage` / context

---

## 2. Admin Role

### 2.1 Admin Dashboard `/admin`

**Purpose:** Birds-eye operational view of the entire estate.

**Sidebar nav items:**
- Dashboard (home)
- Visitors (live + history)
- Tenants
- Guards
- Alerts
- Reports
- Settings

**Dashboard widgets:**
- `StatBar` row: Total visitors today / Currently on-site / Overstays / Pending pre-registrations
- `LiveVisitorFeed` — real-time scrolling list of active check-ins (name, unit, time in, status badge)
- `AlertsPanel` — top 3 unread alerts with severity colour (red/amber/blue)
- `OccupancyDonut` — units with active visitors vs empty
- `WeeklyVisitorChart` — bar chart, last 7 days
- `RecentActivityLog` — last 10 audit actions (check-in, check-out, alert, registration)

---

### 2.2 Visitors Page `/admin/visitors`

**Tabs:**
1. **Active** — currently checked-in
2. **Pre-registered** — upcoming, not yet arrived
3. **History** — all-time log with filters

**Table columns (Active):** Photo thumb | Name | ID No. | Visiting Unit | Checked In At | Duration | Status | Actions

**Actions per row:**
- `CheckOutButton` — marks visit ended
- `FlagButton` — opens `FlagModal`
- `ViewDetailsButton` → `VisitorDetailDrawer`

**`VisitorDetailDrawer`:**
- Full visitor card (photo, name, ID, phone, vehicle plate)
- Visit timeline (check-in, expected out, actual out)
- Notes field (admin can add)
- Audit log for this visit

**Filters (History tab):** Date range picker | Unit selector | Status multi-select | Search by name/ID

**Bulk actions:** Export CSV | Print PDF

---

### 2.3 Tenants Page `/admin/tenants`

**Purpose:** Admin creates and manages tenant accounts.

**Components:**
- `TenantTable` — Unit | Tenant Name | Email | Status | Last Active | Actions
- `CreateTenantModal`:
  - Unit number (dropdown of estate units)
  - Full name
  - Email
  - Phone
  - Auto-generates password (shown once, copy icon)
  - Send welcome note toggle (POC: console log)
- `EditTenantDrawer` — same fields, editable
- `DeactivateTenantConfirm` — soft-delete with reason

**Extra:** Per-tenant stats card: visitor count this month / active invitations

---

### 2.4 Guards Page `/admin/guards`

**Components:**
- `GuardTable` — Name | Badge No. | Shift | Status (On Duty / Off) | Last Login
- `CreateGuardModal` — same pattern as tenant but with shift field
- `ShiftScheduler` (POC: mock calendar UI, no backend) — weekly grid, assign guard per slot

---

### 2.5 Alerts Page `/admin/alerts`

**Tabs:** Unread | All | Overstays | Security

**Alert card:** Severity icon | Title | Description | Time | Related unit | Mark Read | Escalate

**`EscalateModal`:** Add note, choose method (Email / SMS / WhatsApp — POC: toast confirmation)

**Auto-generated mock alerts:**
- Visitor John Doe has been on-site 4h (expected 1h)
- Unknown vehicle at Gate 2
- Guard login from new device

---

### 2.6 Reports Page `/admin/reports`

**Report types:**
- Daily visitor summary
- Overstay incidents
- Tenant activity
- Guard shift log

**Controls:** Date range | Report type | Generate | Export PDF | Export CSV

**Preview:** `ReportPreviewPanel` — table + summary stats inline

---

### 2.7 Settings Page `/admin/settings`

**Sections:**
- Estate Profile: name, address, logo upload (POC: mock)
- Gate Config: overstay threshold (hours), walk-ins allowed toggle, photo required toggle
- Notification Config: guard alert channels, admin digest email time
- Branding: accent colour picker (propagates via CSS var)
- Change Password

---

## 3. Tenant Role

### 3.1 Tenant Dashboard `/tenant`

**Sidebar nav:** Dashboard | My Visitors | Pre-Register | Profile

**Widgets:**
- `WelcomeCard` — "Good morning, [Name] — Unit [X]"
- `UpcomingVisitorsCard` — next 3 expected visitors with countdown
- `ActiveVisitorCard` — if someone is currently on-site visiting them
- `QuickPreRegisterButton` — prominent CTA
- `RecentVisitHistory` — last 5 visits mini-table

---

### 3.2 My Visitors `/tenant/visitors`

**Tabs:** Current | Upcoming | Past

**Table:** Visitor name | Purpose | Date/Time | Status | Actions

**Actions:** View invite link | Revoke invite | Download pass (PDF QR)

---

### 3.3 Pre-Register Visitor `/tenant/pre-register`

**Form fields:**
- Visitor full name
- Visitor phone number
- Visitor ID number (optional pre-fill)
- Expected arrival date + time
- Expected departure time
- Purpose of visit (dropdown: Delivery / Maintenance / Guest / Other)
- Vehicle reg plate (optional)
- Notes to guard

**On submit:**
- Mock generates invitation token
- Shows `InviteSuccessModal`:
  - Shareable link (copy button)
  - QR code of the link (tenant can screenshot / WhatsApp to visitor)
  - "Send via SMS" button (POC: toast)

---

### 3.4 Tenant Profile `/tenant/profile`

- View unit, name, email, phone
- Change password
- Notification preferences (Email / SMS for check-in alerts)

---

## 4. Guard Role

### 4.1 Guard Dashboard `/guard`

**Layout:** Compact, high-contrast, tablet/desktop optimised for a security booth.

**Sidebar:** Dashboard | Check-In | On-Site | Overstays | Alerts | History

**Dashboard widgets:**
- `ShiftBanner` — current guard name, shift time, gate assignment
- `OnSiteCountBadge` — large number, visitors currently inside
- `OverstayAlert` — flashing red banner if any overstays
- `UpcomingArrivalsTable` — next 2 hours of pre-registered visitors
- `QuickCheckInButton` — prominent

---

### 4.2 Check-In Portal `/guard/check-in`

**Purpose:** Where guard processes a visitor arrival.

**Two entry paths:**

**Path A — Pre-Registered (via QR or invite link):**
- Guard scans QR with device camera (`QRScanner` component)
- OR pastes invite token manually
- System looks up invitation → shows pre-filled visitor card
- Guard confirms ID match (checkbox)
- Guard captures photo (webcam component, POC: mock upload)
- `ConfirmCheckInButton` → success toast + print pass option

**Path B — Walk-In:**
- Manual form:
  - Full name
  - ID number
  - Phone
  - Vehicle reg (optional)
  - Which unit / tenant they're visiting (searchable dropdown)
  - Purpose
  - Photo capture
- On submit: creates visit record, notifies tenant (POC: toast)
- Shows `VisitorPassModal` — printable card with name, unit, time, QR

**`VisitorPassModal` content:**
- Estate logo + name
- Visitor name + photo
- Visiting unit
- Check-in time
- Valid until (expected out)
- Unique visit QR code
- Print button

---

### 4.3 On-Site Visitors `/guard/on-site`

**Table:** Photo | Name | Unit | In Time | Expected Out | Duration | Status | Actions

**Actions:**
- `CheckOut` — marks as checked out, logs time
- `ExtendStay` — bumps expected out by +1h (with confirmation)
- `FlagAlert` — opens alert modal

**Visual cues:**
- Green row: on time
- Amber row: approaching overstay (within 30 min)
- Red row: overstay

---

### 4.4 Overstays `/guard/overstays`

**Dedicated filtered view** of on-site visitors past expected out.

**Card per overstay:**
- Visitor info
- Time over (e.g. "2h 14m past expected out")
- Tenant phone number (click to call — tel: link)
- `SendAlertToTenant` button (POC: toast)
- `NotifyAdmin` button
- `CheckOut` button

---

### 4.5 Alerts `/guard/alerts`

- Same alert list as admin but filtered to guard-relevant (no system config alerts)
- Can mark read
- Cannot escalate (that's admin only)
- `EmergencyAlertButton` — big red button → opens modal to send emergency alert to admin + all guards (POC: toast)

---

### 4.6 Visit History `/guard/history`

- Searchable/filterable table of today's completed visits
- Can re-print pass for any visit

---

## 5. Visitor Portal (Guard-operated)

This is embedded in `/guard/check-in` (Path B above), but also lives as a **standalone kiosk URL** `/visitor-portal` for deployments with a self-service tablet at the gate:

### 5.1 Kiosk Mode `/visitor-portal`

**Steps (wizard):**
1. **Welcome screen** — "Please tap to begin check-in"
2. **Entry type** — "I have an invite code" | "I'm a walk-in"
3. **Invite flow** — enter or scan code → confirm details
4. **Walk-in form** — name, ID, phone, unit visiting, purpose
5. **Photo capture** — webcam shot
6. **Confirmation** — "Your details have been sent to [Unit X]. The guard will confirm your entry."
7. **Pass display** — QR code on screen (guard scans to confirm)

**Design note:** Large touch targets, high contrast, minimal text per screen.

---

## 6. Additional Flows & Logic

### 6.1 Notification System (Mock)
- Every check-in → tenant gets toast notification (in-app) + console log "SMS sent"
- Every overstay trigger → guard dashboard badge increments + alert card appears
- Admin gets daily digest (mock: shown as a dismissible banner on login)

### 6.2 Audit Trail
- Every action (check-in, check-out, flag, tenant create, etc.) writes to mock `auditLog` array in context
- Admin can view full audit log in Settings → Audit Trail tab

### 6.3 Invitation Link Flow
- Tenant generates link → `https://cyphersec.estate/invite/[token]`
- Visitor opens link → sees estate name + their details + "Show this to the guard"
- Guard scans QR on visitor's phone → auto-fills check-in form

### 6.4 Emergency Protocol
- Guard hits emergency button → all guard dashboards show red banner (simulated via shared mock state)
- Admin sees critical alert immediately

### 6.5 Session & Auth
- POC: credentials checked against env vars
- Role stored in `sessionStorage`
- 8-hour auto-logout (mock timer)
- `/logout` clears session → back to landing

---

## 7. Component Library Summary

| Component | Used By |
|-----------|---------|
| `StatCard` | Admin, Guard dashboards |
| `DataTable` | All roles |
| `VisitorCard` | Guard, Admin |
| `AlertBanner` | Guard, Admin |
| `QRScanner` | Guard check-in, Kiosk |
| `QRDisplay` | Tenant pre-register, Kiosk |
| `PhotoCapture` | Guard check-in, Kiosk |
| `InviteModal` | Tenant |
| `VisitorPassModal` | Guard |
| `SidebarNav` | All authenticated |
| `RoleTabSelector` | Login |
| `DateRangePicker` | Admin reports, history |
| `ShiftBanner` | Guard |
| `EmergencyButton` | Guard |
| `AuditLogTable` | Admin settings |
| `NotificationToast` | All roles |
