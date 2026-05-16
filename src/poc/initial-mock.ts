import type {
  ActiveVisit,
  AlertItem,
  AuditEntry,
  EstateSettings,
  GuardRecord,
  PreRegisteredVisit,
  TenantInvitation,
  TenantRecord,
} from "./types";

const now = Date.now();
const h = (n: number) => n * 60 * 60 * 1000;
const m = (n: number) => n * 60 * 1000;
const d = (n: number) => n * 24 * 60 * 60 * 1000;

/** Seed resident unit — richer sample data for tenant role. */
export const SEED_TENANT_UNIT = "4A";

export const ESTATE_DEFAULTS: EstateSettings = {
  name: "CypherSec Estate",
  address: "Karen · Nairobi",
  unitCount: 128,
  overstayHours: 2,
  walkInsAllowed: true,
  photoRequired: false,
  preRegHours: 72,
  accentHex: "#2a9d55",
};

const firstNames = [
  "Sarah",
  "James",
  "Mary",
  "Peter",
  "Grace",
  "David",
  "Lucy",
  "Samuel",
  "Anna",
  "Brian",
  "Ruth",
  "Joseph",
  "Esther",
  "Paul",
  "Hannah",
  "Michael",
  "Joy",
  "Stephen",
  "Faith",
  "Daniel",
  "Naomi",
  "Simon",
  "Rebecca",
  "Thomas",
  "Martha",
  "Andrew",
  "Elizabeth",
  "Mark",
  "Catherine",
  "John",
  "Wanjiku",
  "Kevin",
  "Amina",
  "Victor",
  "Linet",
  "George",
  "Patricia",
  "Collins",
  "Diana",
  "Felix",
  "Mercy",
  "Ian",
  "Sharon",
  "Oscar",
  "Betty",
  "Martin",
  "Caroline",
  "Leo",
  "Janet",
  "Raymond",
];

const lastNames = [
  "Muthoni",
  "Kariuki",
  "Wanjiru",
  "Otieno",
  "Akinyi",
  "Omondi",
  "Njeri",
  "Kamau",
  "Adhiambo",
  "Kimani",
  "Achieng",
  "Mutua",
  "Chebet",
  "Odhiambo",
  "Nyambura",
  "Wambua",
  "Maina",
  "Waweru",
  "Kiptoo",
  "Barasa",
  "Njoroge",
  "Cherono",
  "Mwangi",
  "Korir",
];

const purposes = [
  "Family visit",
  "Friend visiting",
  "Delivery",
  "Maintenance",
  "House viewing",
  "Babysitter",
  "Catering",
  "Garden service",
  "Tutor",
  "Open house",
  "Holiday guest",
  "Pet care",
  "Contractor",
  "Medical visit",
  "Estate tour",
  "Package pickup",
  "Uber drop-off",
  "Cleaning crew",
];

const unitsPool: string[] = (() => {
  const units: string[] = [];
  for (let floor = 1; floor <= 32; floor++) {
    for (const wing of ["A", "B", "C", "D"]) {
      units.push(`${floor}${wing}`);
    }
  }
  return units;
})();

const pick = <T>(arr: T[], i: number) => arr[i % arr.length];

const fullName = (i: number) => `${pick(firstNames, i)} ${pick(lastNames, i + 3)}`;

const phoneFor = (seed: number) => `+2547${(100000 + (seed * 913) % 900000).toString().slice(0, 6)}`;

const idNoFor = (seed: number) => `${28000000 + (seed * 137) % 19999999}`;

/** ~58 visitors currently on-site. */
export const initialActiveVisits: ActiveVisit[] = Array.from({ length: 58 }, (_, i) => {
  const unit = i < 8 ? SEED_TENANT_UNIT : pick(unitsPool, i + 5);
  const checkedHoursAgo = 0.15 + (i % 14) * 0.38;
  const expectedHoursFromCheckin = 1.5 + (i % 7);
  const overstaying = i % 6 === 0 || i % 9 === 0;
  return {
    id: `v-${i + 1}`,
    name: fullName(i),
    idNo: idNoFor(i),
    phone: phoneFor(i + 120),
    unit,
    tenantName: i < 8 ? "Sarah Muthoni" : fullName(i + 20),
    checkedInAt: now - h(checkedHoursAgo),
    expectedOutAt:
      now - h(checkedHoursAgo) + h(expectedHoursFromCheckin) - (overstaying ? h(2.5 + (i % 3)) : 0),
    purpose: pick(purposes, i),
    vehicle: i % 3 === 0 ? `K${pick(["A", "B", "C", "D"], i)} ${(100 + i).toString().padStart(3, "0")}${pick(["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"], i)}` : undefined,
    notes: i % 11 === 0 ? "Host notified at gate" : i % 17 === 0 ? "Repeat visitor — badge on file" : undefined,
    invitationToken: i % 4 === 0 ? `inv-cs-${i}` : undefined,
    flagged: i % 15 === 0,
  };
});

/** ~44 expected arrivals. */
export const initialPreRegistered: PreRegisteredVisit[] = Array.from({ length: 44 }, (_, i) => {
  const unit = i < 6 ? SEED_TENANT_UNIT : pick(unitsPool, i + 2);
  return {
    id: `p-${i + 1}`,
    name: fullName(i + 40),
    unit,
    tenantName: i < 6 ? "Sarah Muthoni" : fullName(i + 15),
    arrivalFrom: now + h(0.5 + (i % 10)) + m((i % 60) * 11),
    arrivalTo: now + h(2.5 + (i % 10)) + m((i % 60) * 11),
    purpose: pick(purposes, i + 2),
    token: `pre-cs-${(1000 + i).toString(16)}`,
    phone: phoneFor(i + 200),
    idNo: idNoFor(i + 40),
  };
});

/** 96 households (matches most of estate capacity). */
export const initialTenants: TenantRecord[] = Array.from({ length: 96 }, (_, i) => {
  const unit = pick(unitsPool, i);
  const isDemoUnit = unit === SEED_TENANT_UNIT;
  return {
    id: `t-${i + 1}`,
    unit,
    name: isDemoUnit ? "Sarah Muthoni" : fullName(i + 60),
    email: isDemoUnit
      ? "tenant.4a@cyphersec.io"
      : `tenant.${unit.toLowerCase()}@cyphersec.io`,
    phone: isDemoUnit ? "+254712345678" : phoneFor(i + 300),
    status: i % 19 === 0 ? ("inactive" as const) : ("active" as const),
    lastActive: pick(
      [
        "Today, 07:12",
        "Today, 09:40",
        "Today, 11:05",
        "Today, 14:22",
        "Today, 16:48",
        "Yesterday",
        "2 days ago",
        "Mon",
        "Last week",
        "Today, 08:15",
      ],
      i,
    ),
    visitorsThisMonth: 2 + (i % 24),
  };
});

export const initialGuards: GuardRecord[] = [
  { id: "g1", name: "Daniel Kamau", badge: "G-01", shift: "06:00–14:00", status: "on_duty", lastLogin: "Today, 05:58" },
  { id: "g2", name: "Rose Wambui", badge: "G-02", shift: "06:00–14:00", status: "on_duty", lastLogin: "Today, 06:01" },
  { id: "g3", name: "Eric Mutua", badge: "G-03", shift: "14:00–22:00", status: "off_duty", lastLogin: "Yesterday" },
  { id: "g4", name: "Ivy Chepkemoi", badge: "G-04", shift: "14:00–22:00", status: "on_duty", lastLogin: "Today, 13:55" },
  { id: "g5", name: "Tom Barasa", badge: "G-05", shift: "22:00–06:00", status: "off_duty", lastLogin: "2 days ago" },
  { id: "g6", name: "Nina Achieng", badge: "G-06", shift: "22:00–06:00", status: "off_duty", lastLogin: "Last week" },
  { id: "g7", name: "Chris Odhiambo", badge: "G-07", shift: "06:00–14:00", status: "on_duty", lastLogin: "Today, 06:10" },
  { id: "g8", name: "Winnie Njeri", badge: "G-08", shift: "Weekend float", status: "on_duty", lastLogin: "Today, 08:02" },
  { id: "g9", name: "Peter Kariuki", badge: "G-09", shift: "06:00–14:00", status: "on_duty", lastLogin: "Today, 06:05" },
  { id: "g10", name: "Grace Wanjiru", badge: "G-10", shift: "14:00–22:00", status: "on_duty", lastLogin: "Today, 14:01" },
  { id: "g11", name: "Samuel Otieno", badge: "G-11", shift: "22:00–06:00", status: "on_duty", lastLogin: "Today, 22:03" },
  { id: "g12", name: "Mary Akinyi", badge: "G-12", shift: "06:00–14:00", status: "off_duty", lastLogin: "Yesterday" },
  { id: "g13", name: "James Kimani", badge: "G-13", shift: "14:00–22:00", status: "off_duty", lastLogin: "3 days ago" },
  { id: "g14", name: "Lucy Adhiambo", badge: "G-14", shift: "Weekend float", status: "on_duty", lastLogin: "Today, 07:44" },
  { id: "g15", name: "Brian Mutua", badge: "G-15", shift: "06:00–14:00", status: "off_duty", lastLogin: "Mon" },
  { id: "g16", name: "Faith Chebet", badge: "G-16", shift: "22:00–06:00", status: "on_duty", lastLogin: "Today, 22:15" },
];

const alertTemplates: Omit<AlertItem, "id" | "read" | "createdAt">[] = [
  {
    severity: "critical",
    title: "Overstay — visitor past expected time",
    description: "Please greet the resident and confirm extended stay.",
    unit: SEED_TENANT_UNIT,
    type: "overstay",
  },
  {
    severity: "warning",
    title: "Visitor approaching end of visit window",
    description: "Friendly reminder sent to host unit.",
    unit: "7B",
    type: "approaching",
  },
  {
    severity: "info",
    title: "Large delivery van at Gate 2",
    description: "Scheduled furniture drop-off.",
    unit: "12B",
    type: "security",
  },
  {
    severity: "info",
    title: "Pool area capacity notice",
    description: "Weekend guest list exceeds soft capacity.",
    type: "system",
  },
  {
    severity: "warning",
    title: "Unfamiliar vehicle (plate scan)",
    description: "Hold at gate until host confirms.",
    unit: "9A",
    type: "security",
  },
  {
    severity: "critical",
    title: "Flagged visitor at main gate",
    description: "Manual review required before entry.",
    unit: "15C",
    type: "security",
  },
  {
    severity: "warning",
    title: "Pre-registration window closing",
    description: "Host has not confirmed guest for tomorrow.",
    unit: SEED_TENANT_UNIT,
    type: "approaching",
  },
  {
    severity: "info",
    title: "Contractor batch check-in",
    description: "8 maintenance staff expected 09:00–12:00.",
    unit: "3A",
    type: "system",
  },
];

export const initialAlerts: AlertItem[] = Array.from({ length: 52 }, (_, i) => {
  const base = pick(alertTemplates, i);
  const unit = base.unit ?? pick(unitsPool, i);
  return {
    id: `a-${i + 1}`,
    ...base,
    unit,
    title: base.unit ? base.title : `${base.title} · ${unit}`,
    createdAt: now - m(3 + (i % 45) * 11) - d(Math.floor(i / 8)),
    read: i % 4 === 0 || i % 6 === 0,
  };
});

const auditActors = [
  "Daniel Kamau",
  "Rose Wambui",
  "Front desk",
  "Sarah Muthoni",
  "James Kariuki",
  "System",
  "Ivy Chepkemoi",
  "Resident portal",
  "Eric Mutua",
  "Grace Wanjiru",
  "Gate kiosk",
  "Auto overstay job",
];

const auditActions: [string, string, string][] = [
  ["check_in", "visitor", "Main gate · photo OK"],
  ["check_out", "visitor", "Departed Gate 1"],
  ["invite_sent", "guest link", "SMS + email"],
  ["vehicle_note", "parking", "Visitor bay 3"],
  ["extend_stay", "visit", "+2h approved by host"],
  ["pre_reg", "visitor", "Window tomorrow 14:00–16:00"],
  ["check_in", "visitor", "Gate 2 · walk-in"],
  ["check_out", "visitor", "Express lane"],
  ["flag_cleared", "visitor", "Supervisor approved"],
  ["invite_revoked", "guest link", "Host cancelled"],
  ["check_in", "visitor", "Pre-reg token matched"],
  ["check_out", "visitor", "Overstay resolved"],
];

/** ~120 audit events (last 14 days). */
export const initialAudit: AuditEntry[] = Array.from({ length: 120 }, (_, i) => {
  const [action, entity, details] = pick(auditActions, i);
  return {
    id: `au-${i + 1}`,
    at: now - m(1 + (i % 90) * 6) - d(Math.floor(i / 16)),
    actor: pick(auditActors, i),
    action,
    entity: fullName(i + 100),
    details: `${details} · Unit ${pick(unitsPool, i + 7)}`,
  };
});

const inviteStatuses: TenantInvitation["status"][] = [
  "upcoming",
  "upcoming",
  "upcoming",
  "used",
  "used",
  "revoked",
];

/** ~50 guest invitations; demo unit 4A gets extra rows. */
export const initialTenantInvites: TenantInvitation[] = Array.from({ length: 50 }, (_, i) => {
  const tenantUnit = i < 10 ? SEED_TENANT_UNIT : pick(unitsPool, i + 1);
  const hostName = tenantUnit === SEED_TENANT_UNIT ? "Sarah Muthoni" : fullName(i + 3);
  return {
    id: `ti-${i + 1}`,
    tenantUnit,
    hostName,
    guestName: fullName(i + 50),
    purpose: pick(purposes, i + 1),
    arrivalFrom: now + h(1 + (i % 14)) + d(Math.floor(i / 10)),
    arrivalTo: now + h(4 + (i % 14)) + d(Math.floor(i / 10)),
    token: `invite-cs-${900 + i}`,
    status: pick(inviteStatuses, i),
  };
});

/** 30 days of visitor volume for charts. */
export const weeklyVisitorVolume = [
  24, 28, 31, 29, 34, 38, 42, 39, 45, 41, 48, 52, 49, 44, 47, 51, 55, 53, 50, 46, 49, 54, 58, 56, 52, 48, 51,
  57, 61, 59,
];
