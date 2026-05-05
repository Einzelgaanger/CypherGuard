Below is a comprehensive Product Requirements Document for the CypherSec Estate Check-In MVP, designed to replace analogue log books with a digital, audit-ready system.

1. Executive Summary
CypherSec’s Check-In MVP will digitize visitor logging at gated estates, eliminating manual log-books and inconsistent records. Aligned with our core value proposition—“we replace expensive, unreliable guard shifts with a cyber-hardened, AI-powered security ecosystem — including DP-compliant visitor management, and demonstrably lower operating costs” Cyber-First Estate Secu…—the initial release focuses solely on secure, web-based guest registration, resident pre-booking, and guard oversight.

2. Background & Problem Statement
Current State: Estates use paper log-books, leading to illegible entries, lost records, and no real-time visibility.

Pain Point: Inconsistent visitor logs create security blind spots.

CypherSec Approach: A SaaS visitor-management system with real-time audit trails, ID/passport scanning, and e-signature capability Cyber-First Estate Secu….

3. Objectives & Scope
Primary Goal: Replace analogue visitor log-books with a digital check-in system.

Key Features:

Guest Self-Registration on arrival

Resident Pre-Registration and invitation link generation

Admin (Guard) Dashboard for monitoring, check-in/out, and reporting

Out of Scope for MVP: Gate-hardware integration (ANPR/biometrics), remote SOC integration, edge-device firmware hardening (phased for later releases).

4. User Personas
Persona	Role	Needs / Goals
Guest	Visitor arriving at estate	Quick, intuitive self-registration; instant confirmation
Resident	Home-owner or tenant	Pre-register guests; share registration links easily
Admin / Guard	Security officer monitoring arrivals	Real-time visitor list; ability to check-in/out and export logs

5. High-Level Use Cases
Walk-in Guest Registration

Guest scans QR code or visits a short URL.

Completes form: Name, ID Number, Vehicle Reg., Purpose, Host.

System records timestamp and issues a digital pass.

Resident Pre-Registration

Resident logs in via email + OTP.

Enters guest details and expected arrival window.

System generates & displays/shares a unique invitation link.

Admin Dashboard & Check-In Management

Admin logs in on a tablet or desktop.

Views lists: expected arrivals and walk-ins.

Verifies entries, marks check-in/out, flags overstays.

Exports logs (CSV/PDF) for audit.

6. Functional Requirements
6.1 Guest Registration
Entry Point: QR code at gate, URL splash page.

Form Fields:

Full Name (required)

ID/Passport Number (required)

Vehicle Registration (optional)

Photo upload (optional)

Purpose of Visit (dropdown)

Host (free-text or dropdown of residents)

Confirmation: Display check-in time and unique visitor token.

6.2 Resident Pre-Registration
Authentication: Email + OTP via SMS.

Dashboard:

“Create Invitation” button → fields: Guest Name, ID, Vehicle, Arrival Window.

“Share” → copyable link or automated email/SMS.

Invitation Management: View/edit/delete pending invitations.

6.3 Admin (Guard) Features
Secure Login (2FA optional).

Real-Time Dashboard:

Tabs for “Expected,” “Checked-In,” “All Visitors.”

Search/filter by name, date, flat/unit.

Check-Out: One-click exit marking, automated timestamp.

Alerts: Overstay notifications after configurable duration.

Reporting: Export logs (date-range filter) as CSV/PDF.

7. Non-Functional Requirements
Performance: Page load ≤ 2 seconds under 100 concurrent users.

Scalability: Support spikes of up to 500 registrations/day per estate.

Availability: 99.9% SLA; offline caching mode if connectivity drops.

Localization: English default; Swahili translation.

Accessibility: WCAG 2.1 AA compliance.

Browser Support: Latest Chrome, Firefox, Safari on desktop & mobile.

8. Data Model & Integrations
Entity	Key Attributes
User	user_id, role (guest
Resident	inherits User; flat/unit number
Guest	guest_id, name, id_number, vehicle_reg, photo_url
Invitation	invite_id, resident_id, guest_info, link, expiry
Visit	visit_id, guest_id, checkin_ts, checkout_ts, status

Integrations

SMS gateway for OTP & invite links

Email SMTP for resident notifications

Optional future: Estate-gate hardware APIs

9. Security & Compliance
Encryption: TLS 1.2+ in transit; AES-256 at rest.

Access Control: RBAC ensuring guests can’t see other records.

Audit Trail: Immutable logs with user, action, timestamp.

Zero-Trust: Unique device certificates for guard tablets.

Data Protection: Kenya DPA 2019 compliance with built-in DPIA & resident-consent flows Cyber-First Estate Secu….

10. UX/UI Guidelines
Mobile-First: Responsive layout; large tap targets.

Clarity: Minimal fields per screen; progress indicators.

Branding: CypherSec color palette, logo, and typography.

Error Handling: Inline validation; clear error messages.

11. Acceptance Criteria
Guest Flow: Self-registration completes in < 30 seconds and generates digital pass.

Resident Flow: Invitation link sent and usable by guest immediately.

Admin Flow: Check-in/out actions update dashboard and logs in real time.

Reporting: Exported logs match on-screen data and include timestamps.

12. Timeline & Milestones
Milestone	Target Date
UX/UI Designs & Prototypes Complete	2025-08-15
Back-End API & Data Model Finalized	2025-09-01
Guest & Resident Flows Implemented	2025-09-30
Admin Dashboard MVP Complete	2025-10-15
End-to-End QA & Pilot Deployment	2025-11-01
MVP Release (Visitor-Mgmt Front-end)	Q4 2025 Cyber-First Estate Secu…

13. Dependencies
SMS/email gateway

Cloud hosting and database provisioning

Resident data (unit/flat registry) import

14. Risks & Mitigation
Risk	Impact	Mitigation
Low resident adoption	Medium	In-app walkthrough; on-site training
Connectivity outages at gate	High	Local caching with sync on reconnect
Data privacy concerns	High	Transparent consent flow; clear privacy policy

15. Glossary
DPA: Data Protection Act

MVP: Minimum Viable Product

RBAC: Role-Based Access Control

SIEM: Security Information and Event Management