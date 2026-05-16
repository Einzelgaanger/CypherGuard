# CypherSec Check-In — Full UI/UX Design Specification

> POC build. All data mocked. No live backend. Credentials from `.env`.

---

## Design Philosophy

**Concept:** "Tactical Luxury" — the precision of a security operations centre fused with the polish of a premium SaaS product. This is not a generic enterprise CRUD app. Every screen should feel like someone *designed* it, not assembled it from a template.

**Emotional register:** Calm authority. The interface communicates control and safety without feeling cold or militaristic.

---

## Colour System

```css
/* Core palette */
--bg-base:       #0A0C10;   /* near-black — primary background */
--bg-surface:    #111318;   /* cards, panels */
--bg-elevated:   #1A1D24;   /* modals, drawers */
--bg-hover:      #1F232C;   /* hover states */

/* Accent — Electric Cyan */
--accent:        #00D4FF;   /* primary CTA, active states */
--accent-dim:    #00D4FF22; /* accent with 13% opacity */
--accent-glow:   0 0 20px #00D4FF55;

/* Status colours */
--status-green:  #00E5A0;   /* checked in, active, success */
--status-amber:  #F5A623;   /* approaching overstay, warning */
--status-red:    #FF3B5C;   /* overstay, danger, emergency */
--status-blue:   #4A8FFF;   /* info, system */
--status-purple: #9B59FF;   /* pre-registered, upcoming */

/* Typography */
--text-primary:  #F0F2F5;
--text-secondary:#8B95A5;
--text-muted:    #4A5468;
--text-accent:   #00D4FF;

/* Borders */
--border-subtle: #1E222B;
--border-active: #00D4FF44;
--border-danger: #FF3B5C44;
```

**Semantic usage:**
- Backgrounds always dark. No light mode in V1.
- Cyan (`--accent`) = primary actions, links, active nav
- Green = safe / confirmed / success
- Amber = caution / approaching threshold
- Red = danger / overstay / emergency
- Purple = future / scheduled / pre-registered

---

## Typography

```
Display / Headers:    "Syne" (Google Fonts) — geometric, distinctive
Body / UI text:       "DM Sans" (Google Fonts) — clean, highly legible
Monospace / codes:    "JetBrains Mono" — for IDs, tokens, timestamps
```

**Scale:**
```
--text-xs:   11px / 1.4 — labels, badges
--text-sm:   13px / 1.5 — secondary body, table cells
--text-base: 15px / 1.6 — primary body
--text-lg:   18px / 1.4 — card titles
--text-xl:   24px / 1.2 — section headers
--text-2xl:  32px / 1.1 — page titles
--text-3xl:  48px / 1.0 — hero / stat numbers
--text-hero: 72px / 0.95 — landing hero
```

**Font weights used:** 400 (body), 500 (UI labels), 600 (headings), 700 (stats/emphasis), 800 (hero)

---

## Spacing & Layout

**Grid:** 12-column, 24px gutters desktop / 16px mobile
**Sidebar width:** 240px (collapsed: 64px icon-only)
**Content max-width:** 1280px
**Card border-radius:** 12px (standard) / 8px (compact) / 16px (hero cards)
**Base spacing unit:** 4px

---

## Motion Principles

- Page transitions: 200ms fade + 8px slide-up on mount
- Card hover: `translateY(-2px)` + subtle shadow glow, 150ms ease
- Sidebar nav active: left border slides in (4px cyan), 150ms
- Stat numbers: count-up animation on load (800ms ease-out)
- Alert banners: slide in from top-right, 300ms
- Modals: scale(0.97) → scale(1) + fade, 200ms
- Overstay row highlight: subtle red pulse, 2s infinite
- Emergency button: radial pulse animation while active

---

## Shared UI Components

### Sidebar Navigation

```
Width: 240px | Background: --bg-surface | Border-right: 1px solid --border-subtle

Top section:
  [Logo: CypherSec wordmark in Syne, cyan accent on "Sec"]
  [Estate name in --text-secondary, 12px]

Nav items:
  Height: 44px | Padding: 0 16px | Border-radius: 8px | Margin: 2px 8px
  Icon (20px, Lucide) + label (14px, DM Sans 500)
  Inactive: --text-secondary icon, transparent bg
  Active: --accent icon + text, --accent-dim bg, 3px left border --accent
  Hover: --bg-hover bg, --text-primary

Bottom section:
  [User avatar (32px circle, initials fallback) + name + role badge]
  [Logout icon button]
```

### Stat Card

```
Background: --bg-surface
Border: 1px solid --border-subtle
Border-radius: 12px
Padding: 24px

Layout:
  Row 1: Icon (24px, coloured per stat) + label (12px, --text-secondary, uppercase, letter-spacing: 1px)
  Row 2: Value (48px, Syne 700, --text-primary)
  Row 3: Trend pill (↑ 12% vs yesterday) — green if positive, red if negative

Hover: border-color → --border-active, shadow: --accent-glow (subtle)
```

### Data Table

```
Header row: --bg-elevated | --text-secondary 11px uppercase | 1px bottom border --border-subtle
Body rows: --bg-surface | 52px height | 1px bottom border --border-subtle
Hover row: --bg-hover
Selected row: --accent-dim bg, --border-active left border

Columns: left-align text, right-align numbers and actions
Actions column: icon buttons (ghost), appear on row hover
Pagination: bottom, "Showing 1-25 of 143" + prev/next
```

### Badge / Status Pill

```
Padding: 4px 10px | Border-radius: 100px | Font: 11px DM Sans 600
checked_in:    bg --status-green/15,  text --status-green,  dot ●
checked_out:   bg --text-muted/15,    text --text-secondary, dot ●
overstay:      bg --status-red/15,    text --status-red,     dot ● (pulsing)
pre_registered:bg --status-purple/15, text --status-purple,  dot ●
on_duty:       bg --status-green/15,  text --status-green
off_duty:      bg --text-muted/15,    text --text-muted
```

### Button Variants

```
Primary:
  bg --accent | text #000 | font 14px 600 | border-radius 8px | padding 10px 20px
  hover: brightness(1.1) | active: scale(0.98)
  box-shadow: 0 4px 16px --accent/30

Secondary (Ghost):
  bg transparent | border 1px --border-subtle | text --text-secondary
  hover: border --accent/50, text --text-primary, bg --accent-dim

Danger:
  bg --status-red/10 | border --status-red/30 | text --status-red
  hover: bg --status-red/20

Icon button:
  40px × 40px | border-radius 8px | ghost variant
  hover: bg --bg-hover, colour --text-primary
```

### Input / Form Fields

```
Background: --bg-elevated
Border: 1px solid --border-subtle
Border-radius: 8px
Padding: 12px 16px
Font: 14px DM Sans 400, --text-primary
Placeholder: --text-muted

Focus: border-color --accent, box-shadow 0 0 0 3px --accent/15
Error: border-color --status-red, box-shadow 0 0 0 3px --status-red/15

Label: 12px, 600, --text-secondary, uppercase, letter-spacing 0.5px, margin-bottom 6px
Helper text: 12px, --text-muted
Error text: 12px, --status-red
```

### Modal / Drawer

```
Overlay: rgba(0,0,0,0.7), backdrop-filter blur(4px)
Modal panel: --bg-elevated, border-radius 16px, border 1px --border-subtle
  max-width varies: 480px (confirm), 640px (form), 800px (detail)
  padding 32px
  Header: title (20px Syne 600) + close icon (top-right)
  Footer: action buttons right-aligned

Drawer: slides from right, 480px wide, full height
  same background, border-left 1px --border-subtle
```

### Toast Notifications

```
Position: top-right, 24px from edges
Width: 360px
Background: --bg-elevated
Border-left: 4px solid [status colour]
Border-radius: 8px
Padding: 16px
Shadow: 0 8px 32px rgba(0,0,0,0.4)

Content: icon (20px) + title (14px 600) + message (13px --text-secondary)
Auto-dismiss: 4s
Dismiss X: top-right of toast
```

---

## Page-by-Page Specifications

---

### PAGE: Landing `/`

**Background:** Full-screen dark with a subtle radial gradient from deep navy (#0D1117) at top to --bg-base. Faint hexagonal grid pattern overlay (SVG, 3% opacity).

**Top bar (fixed):**
```
Left:  CypherSec logo (wordmark, 28px Syne 700)
       "Cypher" in --text-primary | "Sec" in --accent
Right: "Guard Login" (ghost button) | "Resident Login" (ghost button) | "Admin" (text link, --text-muted)
```

**Hero section:**
```
Centred, padding-top: 160px

Eyebrow: "ESTATE SECURITY INTELLIGENCE" — 11px, --accent, letter-spacing 4px, uppercase
H1: "Your Estate,     (72px, Syne 800, --text-primary)
     Always Secure"   (72px, Syne 800, with "Secure" underlined via cyan gradient)

Subtext: "Digital visitor management that gives residents peace of mind
          and guards the tools they actually need."
         (18px, DM Sans 400, --text-secondary, max-width 540px, centred)

[No CTA buttons — cards below serve as entry points]
```

**Role Entry Cards (3 cards, side by side, margin-top 72px):**

Card 1 — Resident:
```
Background: linear-gradient(135deg, #1A1D24, #111318)
Border: 1px solid --border-subtle
Border-radius: 16px
Padding: 40px 32px
Width: 320px

Icon: Home icon, 48px, --status-purple, inside circle bg --status-purple/10
Title: "Resident Portal" (20px, Syne 600, --text-primary)
Description: "Pre-register visitors, share invite links, track who's at your unit."
             (14px, DM Sans, --text-secondary, line-height 1.6)
CTA button: "Enter Resident Portal →" (primary, full width, margin-top 24px)

Hover: border-color --status-purple/50, translateY(-4px), shadow 0 20px 40px rgba(155,89,255,0.1)
```

Card 2 — Guard (centre, slightly taller — featured):
```
Background: linear-gradient(135deg, #0F1420, #0A1520)
Border: 1px solid --accent/30
Border-radius: 16px
Padding: 48px 32px
Width: 320px
box-shadow: 0 0 40px --accent/10

Icon: Shield icon, 48px, --accent, circle bg --accent-dim
Title: "Guard Station" (20px, Syne 600, --accent)
Description: "Check in visitors, monitor on-site activity, manage overstays and alerts."
CTA button: "Access Guard Panel →" (primary, full width)
"MOST USED" badge — top-right corner, --accent bg, black text, 10px 600

Hover: box-shadow intensifies, border --accent/60
```

Card 3 — Admin:
```
Icon: Settings/Sliders icon, --status-amber
Title: "Admin Console"
Description: "Full estate management — tenants, guards, reports, and system configuration."
CTA button: "Open Admin Console →" (primary, amber accent variant)

Hover: border-color --status-amber/50
```

**Feature strip (below cards, margin-top 96px):**
```
4 feature items, horizontal, dividers between:
  🛡 Real-time Visibility  |  ⚡ Instant Alerts  |  📋 Full Audit Trail  |  🔗 Shareable Invites

Each: icon (20px) + label (13px, --text-secondary)
Divider: 1px vertical, --border-subtle, 40px height
```

**Footer:**
```
Border-top: 1px --border-subtle
Padding: 24px 0
Text: "CypherSec Check-In • Estate Visitor Management • POC v0.1"
      (12px, --text-muted, centred)
```

---

### PAGE: Login `/login`

**Background:** Same dark base. Left half: faint estate building silhouette illustration (SVG, --bg-elevated tones, very subtle). Right half: login card.

Actually: **centred single card layout** — cleaner for POC.

**Login card:**
```
Width: 440px | centred | --bg-surface | border-radius 16px | border 1px --border-subtle
Padding: 48px 40px

Top: CypherSec logo (centred, 32px Syne 700)

Role tab selector:
  3 tabs: Admin | Resident | Guard
  Pill-style: --bg-elevated bg for container, active tab --accent text + --bg-hover bg
  Border-radius: 8px container, 6px active tab
  Font: 13px, 600

Form (below tabs, 24px gap):
  Email field (label: "EMAIL ADDRESS")
  Password field (label: "PASSWORD", toggle show/hide eye icon)
  Remember me: small checkbox + "Remember this device" (13px, --text-secondary)
  
Submit button: full width, "Sign In →", primary

Error state: red banner between tabs and form:
  bg --status-red/10 | border-left 3px --status-red | border-radius 6px | padding 12px 16px
  "⚠ Invalid credentials. Please try again."

Bottom: "Forgot access? Contact your estate admin." (12px, --text-muted, centred)
```

---

### PAGE: Admin Dashboard `/admin`

**Sidebar:** CypherSec logo + "Admin Console" role label in --status-amber badge

**Nav items:**
```
🏠 Dashboard      (active on this page)
👥 Visitors
🏢 Tenants
🛡 Guards
🔔 Alerts          [unread count badge in --status-red, 18px pill]
📊 Reports
⚙ Settings
```

**Main content area:**

**Page header:**
```
Left: "Dashboard" (32px, Syne 700) + "Sunrise Estate • Wednesday 14 May 2025" (14px, --text-secondary)
Right: [Notification bell icon (badge if alerts)] [Avatar + name]
```

**Stat cards row (4 cards, equal width):**
```
Card 1: Today's Visitors
  Icon: Users (--accent)
  Value: 47 (count-up animation)
  Trend: ↑ 12% vs yesterday

Card 2: Currently On-Site
  Icon: MapPin (--status-green)
  Value: 12
  Trend: (no trend, just "right now" label)

Card 3: Overstays
  Icon: Clock (--status-red, pulsing if >0)
  Value: 3
  Trend: ↑ 1 in last hour

Card 4: Pending Pre-Reg
  Icon: Calendar (--status-purple)
  Value: 8
  Trend: Arriving today
```

**Main grid (below stats, 2 columns 65/35):**

Left column:
```
"Live Visitor Feed" card:
  Header: title + "Auto-refreshes every 30s" (12px, --text-muted)
  List of 8 rows, each:
    [Photo circle 36px] [Name 14px 500] [Unit badge] [In time] [Status badge] [⋯ actions]
  "View all visitors →" link at bottom

"Weekly Visitor Chart" card (below):
  Header: "Visitor Volume — Last 7 Days"
  Bar chart: 7 bars, --accent fill with 40% opacity base, 100% on hover
  X-axis: Mon–Sun | Y-axis: 0–60
  Tooltip on bar: "Tuesday: 38 visitors"
```

Right column:
```
"Active Alerts" card:
  Header: "Alerts" + [View all] link
  3 alert rows:
    [Red dot] "Overstay: Unit 4A — John Doe (2h 14m)" — 2m ago
    [Amber dot] "Approaching overstay: Unit 7B — Mary W." — 8m ago
    [Blue dot] "New guard login: G-02 from unknown device" — 1h ago
  Each row: clickable, opens alert detail

"Occupancy Overview" card:
  Donut chart: "12 of 48 units have active visitors"
  Centre text: 25% (occupancy %)
  Legend: Active (cyan) / Empty (--bg-elevated)

"Recent Activity" card:
  Timeline list (10 items):
    [Time] [Action icon] [Description]
    "14:32  ✓  John Doe checked in — Unit 4A via Guard"
    "14:20  📧  Tenant 7B sent invite to Mary Wanjiru"
    "13:55  ⚠  Overstay alert triggered — Unit 2C"
    ...
```

---

### PAGE: Admin Visitors `/admin/visitors`

**Page header:** "Visitors" (32px Syne) + filter controls (date picker, status multi-select, search)

**Tabs:** Active (12) | Pre-Registered (8) | History

**Table — Active tab:**
```
Columns:
  [Photo 40px circle] | [Name + ID number below in --text-muted 12px] | [Unit] | [In Time] | [Duration] | [Status badge] | [Actions]

Duration: green if <1h, amber if 1-3h, red if >3h

Actions column (on row hover):
  [Check Out icon button, green] [Flag icon button, amber] [View icon button, cyan]

Empty state:
  Shield icon (64px, --text-muted) + "No active visitors right now"
```

**Visitor Detail Drawer (opens on View):**
```
Width: 520px, slides from right

Header:
  [Photo 80px circle] [Name 22px Syne 600] [Status badge] [Close X]

Section: "Visitor Information"
  ID Number: [mono 14px --accent]
  Phone: [with tel: link icon]
  Vehicle: [plate in mono badge] or "None"
  Email: [if captured]

Section: "Visit Details"
  Visiting: Unit [X] — [Tenant Name]
  Check-in: [time]
  Expected out: [time]
  Actual out: [time or "Still on-site"]
  Purpose: [label]

Section: "Timeline" (visual)
  Horizontal line: ● Check-in → (expected out marker) → ● Now
  Colour coded — green if on track, red if overstay

Section: "Admin Notes"
  Textarea (editable) + "Save Note" button

Section: "Audit Log for This Visit"
  Small timeline list: created, checked_in, flag (if any), checked_out

Bottom: [Check Out button] [Flag Visitor button]
```

---

### PAGE: Admin Tenants `/admin/tenants`

**Page header:** "Tenants" + [+ Create Tenant] button (primary, right)

**Table:**
```
[Unit badge] | [Name] | [Email] | [Phone] | [Status badge] | [Visitors this month: 12] | [Last active] | [Actions: Edit | Deactivate]
```

**Create Tenant Modal:**
```
Title: "Add New Tenant"

Fields:
  Unit Number (dropdown — scrollable list of estate units e.g. "1A", "1B"... "12F")
  Full Name (text)
  Email Address (text — becomes login)
  Phone Number (text, with +254 prefix selector)

Auto-generated password section:
  bg --bg-base | border-radius 8px | padding 16px
  Label: "TEMPORARY PASSWORD" (--text-muted, 11px uppercase)
  Password in JetBrains Mono, --accent, 18px
  [Copy icon button] on right
  "This password is auto-generated and shown only once." (12px, --text-muted)
  "Send welcome SMS" toggle (disabled in POC — greyed with "Coming soon" tooltip)

Actions: [Cancel] [Create Tenant →]
```

**Per-tenant expanded card (click row to expand):**
```
Mini stats: Visitors this month (12) | Active invites (2) | Last visit (3 days ago)
```

---

### PAGE: Admin Alerts `/admin/alerts`

**Page header:** "Alerts" + severity filter pills: All | Critical | Warning | Info

**Alert card layout (each alert):**
```
Background: --bg-surface
Border-left: 4px solid [severity colour]
Border-radius: 0 8px 8px 0
Padding: 16px 20px
Margin-bottom: 8px

Left: severity icon (20px) in coloured circle (24px)
Middle:
  Title (15px, 600, --text-primary): "Overstay — Unit 4A, Visitor: John Doe"
  Description (13px, --text-secondary): "Visitor has been on-site 2h 14m past expected departure."
  Metadata: [Clock icon] "2 minutes ago" | [MapPin icon] "Gate 1 entry"
Right:
  [Mark Read] ghost button
  [Escalate →] primary button (smaller)

Read alerts: opacity 0.5, no border pulse
```

**Escalate Modal:**
```
Title: "Escalate Alert"
Alert summary (read-only card)
Note field: "Add escalation note…" (textarea)
Method: toggle buttons — Email | SMS | WhatsApp (POC: all show toast)
Recipients: checkboxes — All Guards | Estate Owner | External Security
[Cancel] [Send Escalation]
```

---

### PAGE: Admin Reports `/admin/reports`

**Page header:** "Reports"

**Report Builder panel (left, 320px):**
```
Background: --bg-surface | border-right: 1px --border-subtle | padding: 24px

Report Type: radio cards (not a plain select):
  Each option is a card with icon + title + description
  ○ Daily Visitor Summary
  ○ Overstay Incidents
  ○ Tenant Activity
  ○ Guard Shift Log

Date Range: [From date picker] → [To date picker]
Unit filter: multi-select (All Units / specific)

[Generate Report] primary button, full width

[Export PDF] and [Export CSV] — secondary, below after generation
```

**Preview panel (right, expands):**
```
Shows mock table + summary stats block at top:
  "Period: 7–14 May 2025 | Total visits: 234 | Avg daily: 33 | Overstays: 11"

Table styled same as data table component
PDF export: opens print dialog (browser native)
```

---

### PAGE: Admin Settings `/admin/settings`

**Tab nav (left sub-nav within page):**
```
Estate Profile | Gate Config | Notifications | Branding | Audit Trail | Change Password
```

**Estate Profile tab:**
```
Fields: Estate Name | Address | Number of Units | Admin contact email
Logo upload: dashed border zone, "Drop logo here or browse" + preview
[Save Changes] button
```

**Gate Config tab:**
```
Toggle rows:
  ○ Allow walk-in visitors (no invite required)  [toggle ON]
  ○ Require visitor photo at check-in            [toggle ON]
  ○ Enable overstay alerts                       [toggle ON]

Input: Overstay threshold: [2] hours (number input with +/- buttons)
Input: Pre-registration window: [72] hours before arrival
[Save Configuration]
```

**Branding tab (POC highlight):**
```
"Estate Accent Colour"
Colour picker (native input type=color or custom swatches)
Live preview: shows nav sidebar recoloured in real-time
Presets: 6 colour swatches (cyan default, purple, emerald, amber, rose, indigo)
[Apply Branding]
```

**Audit Trail tab:**
```
Full paginated table of all audit log entries:
  [Timestamp (mono)] | [Actor] | [Action] | [Entity] | [Details]
Search and date filter above
```

---

### PAGE: Tenant Dashboard `/tenant`

**Sidebar:** Same structure, "Sunrise Estate — Unit 4A" below logo. Role badge: cyan "RESIDENT"

**Welcome banner:**
```
Background: linear-gradient(135deg, --bg-surface, #0F1530)
Border: 1px --border-subtle | Border-radius: 16px | Padding: 32px
Left: "Good morning, Sarah." (28px Syne 700) + "Unit 4A · Sunrise Estate" (--text-secondary)
Right: [Pre-Register a Visitor] primary button
```

**Upcoming Visitors card:**
```
Title: "Expected Today" + count badge

3 visitor preview rows:
  [Purple dot] [Name] [Arrival time] [Purpose chip] [Invite link copy icon]

"View all upcoming →" link
Empty state: "No visitors expected today. Pre-register one?" + button
```

**Currently On-Site card:**
```
If active: green glow border
  [Photo] [Name] [Checked in 14 min ago] [Expected out 15:30] [Call guard icon]

If empty: "No one is currently visiting your unit."
```

**Recent History mini-table:**
```
Last 5 visits: Name | Date | Purpose | Duration
"View full history →"
```

---

### PAGE: Tenant Pre-Register `/tenant/pre-register`

**Layout:** Centred, max-width 600px, card container.

**Step progress bar:** 3 steps — Visitor Details → Schedule → Confirmation
(Visual: 3 dots connected by line, active = filled cyan, complete = green check)

**Step 1 — Visitor Details:**
```
Full Name*
Phone Number* (with +254 prefix)
ID Number (optional — "Provide if you'd like guard to pre-verify identity")
Vehicle Registration (optional)
```

**Step 2 — Schedule:**
```
Arrival Date* (date picker)
Arrival Time* (time picker, 15-min slots)
Expected Departure Time (time picker)
Purpose of Visit* (dropdown):
  Guest Visit | Delivery | Maintenance / Service | Event | Other
Notes to Guard (textarea, optional): "She'll be driving a white sedan."
```

**Step 3 — Confirmation:**
```
Summary card:
  All entered details in read-only rows
  [Edit] link next to each section

[Confirm & Generate Invite] primary button
```

**Invite Success Modal (after submit):**
```
Background: --bg-elevated | centred | padding 48px

✅ icon (64px, --status-green)
"Invitation Created!" (24px Syne 600)
"Share this with your visitor" (14px --text-secondary)

Invite link box:
  bg --bg-base | font mono 14px | border --border-subtle | padding 12px 16px
  [Copy link icon] right side
  Hover on copy: tooltip "Copied!"

QR Code: 200×200px, white on --bg-base bg, centred, border-radius 8px, border 1px --border-subtle
"Visitor can show this QR code at the gate" (12px, --text-muted)

[Send via WhatsApp] button — green, WhatsApp icon (POC: opens wa.me link)
[Send SMS] button — ghost (POC: toast "SMS would be sent in production")
[Done] primary

Note: "Invite expires [date/time]. If visitor is late, you can extend it from My Visitors."
```

---

### PAGE: Guard Dashboard `/guard`

**Design intent:** Optimised for a 1080p monitor in a security booth. High contrast. Large touch targets. Information density slightly higher than other dashboards.

**Sidebar:** Narrower (200px). Role badge: "GUARD" in --status-amber.

**Shift banner (top of content area, full width):**
```
Background: --bg-elevated | border-bottom: 1px --border-subtle | padding: 16px 32px

Left: [Shield icon --status-green] "On Duty" | "Guard: Daniel Kamau" | "Gate 1 · Shift: 06:00–14:00"
Right: [Clock] "07:24:11" (live clock, JetBrains Mono 20px --accent)
       [End Shift] ghost button
```

**Stats row (4 cards, smaller than admin):**
```
On-Site Now:     12 (--status-green)
Expected Today:  34 (--status-purple)
Overstays:        3 (--status-red, red pulsing dot if >0)
Checked Out:     19 (--text-muted)
```

**Main grid (2 columns 60/40):**

Left — "Upcoming Arrivals":
```
"Next 2 Hours" header + [Check In a Visitor] primary CTA right

List of pre-registered arrivals:
  Each row:
    [Purple dot] [Time - 14:30] [Name] [Unit badge] [Purpose] [QR scan button]
  
  Rows sorted by arrival time ascending
  Past-due arrivals: amber colour, "14:15 (overdue)"
```

Right — "Quick Actions":
```
Three big action cards stacked:
  Card 1: [QR icon] "Scan Invite Code" — tap to open QR scanner inline
  Card 2: [UserPlus icon] "Walk-In Check-In" — navigates to /guard/check-in
  Card 3: [Clock icon] "View Overstays" — navigates to /guard/overstays, badge count
```

**Emergency Alert Button (bottom of right column, always visible):**
```
bg --status-red/10 | border 2px --status-red/40 | border-radius 12px | padding 20px
[⚠ icon] "EMERGENCY ALERT" (16px, --status-red, 700)
"Tap to alert all guards and admin immediately"
Pulse animation: box-shadow pulses outward in red, 2s infinite

Tap: confirmation modal → send → all guards see full-screen red banner (simulated)
```

---

### PAGE: Guard Check-In `/guard/check-in`

**Two-path tabs at top:**
```
[QR / Pre-Registered] [Walk-In]
Pill tabs, active = --accent
```

**Path A — Pre-Registered:**
```
QR Scanner component:
  Dashed border box 400×300px | bg --bg-elevated
  [Camera icon 48px] "Point camera at visitor's QR code"
  OR below: "Enter invite code manually" — text input + [Look Up] button

After scan/lookup — Invite card appears:
  bg --status-purple/5 | border --status-purple/30 | border-radius 12px | padding 24px
  "✓ Valid Invitation" (--status-green, 14px 600)
  Details: Visitor name, phone, ID, expected arrival, unit, purpose
  
Guard confirmation:
  [x] "I have verified the visitor's physical ID" (checkbox, required)
  [Camera icon button] "Capture Photo" — opens webcam modal (POC: shows placeholder photo)

[Confirm Check-In] primary button (disabled until checkbox ticked)
```

**Path B — Walk-In:**
```
Form layout (2-column grid, fields):
  Full Name* | ID Number*
  Phone*     | Vehicle Reg (optional)
  
Visiting Unit* (searchable select):
  Type unit number or tenant name — autocomplete dropdown
  Each option shows: "4A — Sarah Muthoni"

Purpose* (dropdown — same options as tenant pre-register)

Photo capture:
  Webcam box 200×200px, click to capture (POC: uses placeholder)
  Shows captured frame with "Retake" option

Notes to tenant (textarea, optional)

[Check In Visitor] primary button (full width)
```

**Visitor Pass Modal (post check-in):**
```
bg --bg-elevated | border-radius 16px | max-width 480px

Header: Estate logo + "VISITOR PASS" (Syne 700, letter-spacing 2px)

Content card (printable area):
  [Photo 80px] [Name 22px Syne] [ID Number mono]
  
  Visiting:    Unit 4A — Sarah Muthoni
  Check-in:    14 May 2025, 14:32
  Valid until: 14 May 2025, 17:00
  Purpose:     Guest Visit
  Guard:       Daniel Kamau
  
  QR code (unique visit ID): 160×160px, centred

[Print Pass] secondary | [Done] primary | [New Check-In] ghost
```

---

### PAGE: Guard On-Site `/guard/on-site`

**Summary banner:**
```
"12 visitors currently on-site" | "3 approaching overstay" | "3 in overstay"
Banner: gradient bar, colour segments matching status
```

**Table with visual status rows:**
```
Columns: [Photo] | [Name] | [Unit] | [In Time] | [Expected Out] | [Time on Site] | [Status] | [Actions]

Row colours:
  On track (<80% of expected stay): default row
  Approaching (>80%): amber left border, amber --status-amber/5 bg
  Overstay: red left border, --status-red/8 bg, red pulse animation

Actions:
  [Check Out ✓] [Extend +1h ⏱] [Flag ⚑]
```

**Extend Stay Confirmation:**
```
Mini modal: "Extend John Doe's stay by 1 hour?"
"New expected departure: 17:30"
[Confirm] [Cancel]
```

---

### PAGE: Guard Overstays `/guard/overstays`

**Alert banner at top if any overstays:**
```
Red flashing bar: "⚠ 3 visitors are currently overdue. Please take action."
```

**Overstay cards (card per visitor, not table):**
```
Background: --status-red/5 | border: 1px --status-red/20 | border-radius: 12px | padding: 24px

Top row: [Photo 48px] [Name 18px] [Unit badge] [Time over: "2h 14m past expected out" — red, bold]

Details row: ID: [mono] | Phone: +254 7XX XXX XXX [phone icon — tel: link]

Action buttons (3, horizontal):
  [Send Alert to Tenant] — primary (amber)  → toast "Alert sent to Sarah Muthoni, Unit 4A"
  [Notify Admin]         — secondary        → toast "Admin notified"
  [Check Out Now]        — danger button    → confirms and closes
```

---

### PAGE: Visitor Portal / Kiosk `/visitor-portal`

**Design intent:** Full-screen, single-purpose, tablet-first. Large everything. No sidebar.

**Background:** Estate hero photo as bg (blurred, overlay: rgba(0,0,0,0.75))
Estate logo centred top.

**Step 1 — Welcome:**
```
[Shield icon 80px, --accent]
"Welcome to Sunrise Estate" (48px Syne 700)
"Please tap to begin visitor check-in" (20px, --text-secondary)

Two buttons (large, equal width):
  [📋 I have an invite code] — primary, tall (80px)
  [👤 Walk-in visitor]       — secondary ghost, tall
```

**Step 2A — Invite Entry:**
```
"Enter your invite code" (32px)
Large text input (60px height, 32px font, JetBrains Mono)
"Or scan the QR code from your invitation" — [camera icon button]
[Continue →] primary, large
```

**Step 2B — Walk-In Form:**
```
Full Name (large field)
ID Number (large field)
Phone (large field)
Unit Visiting (large searchable select)
Purpose (large radio cards: Guest / Delivery / Maintenance / Other)

[Continue →]
```

**Step 3 — Photo Capture:**
```
"Please look at the camera" (32px)
Live camera preview: 320×320px, rounded square, glowing cyan border
[📸 Take Photo] large button
[Retake] ghost below
[Skip for now] very muted, small — only if estate config allows
```

**Step 4 — Confirmation:**
```
Summary in large readable format
"Your details have been sent to Unit 4A.
 Please wait for the guard to confirm your entry." (20px)
[I'm done] primary
```

**Step 5 — Pass Display:**
```
QR code 280×280px, centred
"Show this to the guard" (24px, --accent)
Visitor name + unit below
Auto-return to step 1 after 60 seconds (countdown shown: "Returning to home in 45s")
```

---

## Image & Icon Direction

**Icons:** Lucide React (consistent, clean, outline style). Size system: 16px (inline), 20px (UI), 24px (nav), 48px (feature), 64px (empty states).

**Illustrations (SVG, inline — no external images needed for POC):**
- Landing: abstract hexagonal grid pattern (CSS/SVG)
- Empty states: simple geometric + icon combos
- Estate silhouette: minimal building outline (SVG)

**Photos (POC: all placeholder):**
- Visitor photos: `https://i.pravatar.cc/80?u=[name]` (consistent avatar by name hash)
- Estate logo: SVG shield + wordmark

**Chart library:** Recharts (React) for bar charts, Recharts PieChart for donut — styled with CSS vars.

---

## Responsive Breakpoints

```
Mobile:  < 768px  — auth pages only. Dashboards show "Please use desktop" banner.
Tablet:  768–1024 — Guard kiosk (/visitor-portal) designed for this.
Desktop: > 1024px — Primary target for all dashboards.
```

---

## Loading & Skeleton States

Every data panel shows skeleton loaders on mount:
```
Skeleton: --bg-elevated bg, shimmer animation (linear-gradient sweep left-to-right, 1.5s infinite)
Stat card skeleton: grey rect for number (48×32px)
Table skeleton: 5 rows of grey bars (widths varied: 70%, 40%, 30%, 50%, 20%)
```

---

## Accessibility Notes (POC Minimums)

- Colour not sole differentiator — always paired with icon or label
- Focus rings: visible, --accent outline, 2px offset
- Keyboard navigation: tab order logical on forms
- ARIA labels on icon buttons
- Toast notifications: role="alert"

---

## Key Micro-Copy Reference

| Moment | Copy |
|--------|------|
| Check-in success | "✓ [Name] checked in to Unit [X]" |
| Check-out success | "[Name] has checked out. Stay duration: [X]h [Y]m" |
| Invite created | "Invitation ready. Share the link or QR with your visitor." |
| Overstay alert | "⚠ [Name] has been on-site [X]h past expected departure." |
| Tenant created | "Tenant account created. Temporary password copied." |
| Empty visitors | "All clear — no active visitors right now." |
| Error fallback | "Something went wrong. Please try again or contact admin." |
| Session expiry | "Your session has expired. Please sign in again." |
| Emergency sent | "Emergency alert broadcast to all guards and admin." |

---

*This specification covers all screens, states, and design decisions for the CypherSec Check-In POC. Update as new flows are added.*
