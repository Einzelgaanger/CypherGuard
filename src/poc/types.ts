export type PocRole = "admin" | "tenant" | "guard";

export type SessionUser = {
  email: string;
  role: PocRole;
  name: string;
  unit?: string;
  badge?: string;
};

export type VisitStatus = "checked_in" | "checked_out" | "overstay";

export type ActiveVisit = {
  id: string;
  name: string;
  idNo: string;
  phone: string;
  unit: string;
  tenantName: string;
  photoUrl: string;
  checkedInAt: number;
  expectedOutAt: number;
  purpose: string;
  vehicle?: string;
  notes?: string;
  invitationToken?: string;
  flagged?: boolean;
};

export type PreRegisteredVisit = {
  id: string;
  name: string;
  unit: string;
  tenantName: string;
  arrivalFrom: number;
  arrivalTo: number;
  purpose: string;
  token: string;
  phone?: string;
  idNo?: string;
};

export type TenantRecord = {
  id: string;
  unit: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  lastActive: string;
  visitorsThisMonth: number;
};

export type GuardRecord = {
  id: string;
  name: string;
  badge: string;
  shift: string;
  status: "on_duty" | "off_duty";
  lastLogin: string;
};

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertItem = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  createdAt: number;
  unit?: string;
  read: boolean;
  type: "overstay" | "approaching" | "security" | "system";
};

export type AuditEntry = {
  id: string;
  at: number;
  actor: string;
  action: string;
  entity: string;
  details: string;
};

export type TenantInvitation = {
  id: string;
  tenantUnit: string;
  hostName?: string;
  guestName: string;
  purpose: string;
  arrivalFrom: number;
  arrivalTo: number;
  token: string;
  status: "upcoming" | "used" | "revoked";
};

export type EstateSettings = {
  name: string;
  address: string;
  unitCount: number;
  overstayHours: number;
  walkInsAllowed: boolean;
  photoRequired: boolean;
  preRegHours: number;
  accentHex: string;
};
