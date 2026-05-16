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

export const ESTATE_DEFAULTS: EstateSettings = {
  name: "CypherSec Estate",
  address: "Karen · Nairobi",
  unitCount: 128,
  overstayHours: 2,
  walkInsAllowed: true,
  photoRequired: false,
  preRegHours: 72,
  accentHex: "#C65D3A",
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
];

const unitsPool = [
  "1A",
  "1B",
  "2A",
  "2B",
  "3A",
  "3B",
  "4A",
  "4B",
  "5A",
  "5B",
  "6A",
  "6B",
  "7A",
  "7B",
  "8A",
  "8B",
  "9A",
  "9B",
  "10A",
  "10B",
  "11A",
  "12B",
  "14A",
  "15C",
  "16A",
  "18B",
  "20A",
  "22C",
  "24A",
  "26B",
];

const pick = <T>(arr: T[], i: number) => arr[i % arr.length];

const fullName = (i: number) => `${pick(firstNames, i)} ${pick(lastNames, i + 3)}`;

export const initialActiveVisits: ActiveVisit[] = Array.from({ length: 22 }, (_, i) => {
  const unit = pick(unitsPool, i + 5);
  const checkedHoursAgo = 0.3 + (i % 9) * 0.45;
  const expectedHoursFromCheckin = 2 + (i % 5);
  const overstaying = i % 7 === 0 || i % 11 === 0;
  return {
    id: `v-${i + 1}`,
    name: fullName(i),
    idNo: `${28000000 + i * 137}`,
    phone: `+2547${(120000 + i * 913).toString().slice(0, 6)}`,
    unit,
    tenantName: fullName(i + 20),
    photoUrl: `https://i.pravatar.cc/96?u=wg-${i}`,
    checkedInAt: now - h(checkedHoursAgo),
    expectedOutAt: now - h(checkedHoursAgo) + h(expectedHoursFromCheckin) - (overstaying ? h(3) : 0),
    purpose: pick(purposes, i),
    vehicle: i % 4 === 0 ? `KDA ${(100 + i).toString().padStart(3, "0")}X` : undefined,
    invitationToken: i % 3 === 0 ? `inv-wg-${i}` : undefined,
    flagged: i % 13 === 0,
  };
});

export const initialPreRegistered: PreRegisteredVisit[] = Array.from({ length: 18 }, (_, i) => ({
  id: `p-${i + 1}`,
  name: fullName(i + 40),
  unit: pick(unitsPool, i + 2),
  tenantName: fullName(i + 15),
  arrivalFrom: now + h(1 + (i % 8)) + m(i * 7),
  arrivalTo: now + h(3 + (i % 8)) + m(i * 7),
  purpose: pick(purposes, i + 2),
  token: `pre-wg-${(1000 + i).toString(16)}`,
  phone: `+2547${(200000 + i * 701).toString().slice(0, 6)}`,
  idNo: `${29000000 + i * 211}`,
}));

export const initialTenants: TenantRecord[] = Array.from({ length: 32 }, (_, i) => ({
  id: `t-${i + 1}`,
  unit: pick(unitsPool, i),
  name: fullName(i + 60),
  email: `tenant.${pick(unitsPool, i).toLowerCase()}@cyphersec.io`,
  phone: `+2547${(300000 + i * 509).toString().slice(0, 6)}`,
  status: i % 17 === 0 ? ("inactive" as const) : ("active" as const),
  lastActive: pick(
    [
      "Today, 07:12",
      "Today, 09:40",
      "Yesterday",
      "2 days ago",
      "Mon",
      "Last week",
      "Today, 14:22",
    ],
    i,
  ),
  visitorsThisMonth: 3 + (i % 18),
}));

export const initialGuards: GuardRecord[] = [
  { id: "g1", name: "Daniel Kamau", badge: "G-01", shift: "06:00–14:00", status: "on_duty", lastLogin: "Today, 05:58" },
  { id: "g2", name: "Rose Wambui", badge: "G-02", shift: "06:00–14:00", status: "on_duty", lastLogin: "Today, 06:01" },
  { id: "g3", name: "Eric Mutua", badge: "G-03", shift: "14:00–22:00", status: "off_duty", lastLogin: "Yesterday" },
  { id: "g4", name: "Ivy Chepkemoi", badge: "G-04", shift: "14:00–22:00", status: "on_duty", lastLogin: "Today, 13:55" },
  { id: "g5", name: "Tom Barasa", badge: "G-05", shift: "22:00–06:00", status: "off_duty", lastLogin: "2 days ago" },
  { id: "g6", name: "Nina Achieng", badge: "G-06", shift: "22:00–06:00", status: "off_duty", lastLogin: "Last week" },
  { id: "g7", name: "Chris Odhiambo", badge: "G-07", shift: "06:00–14:00", status: "on_duty", lastLogin: "Today, 06:10" },
  { id: "g8", name: "Winnie Njeri", badge: "G-08", shift: "Weekend float", status: "on_duty", lastLogin: "Today, 08:02" },
];

const alertTemplates: Omit<AlertItem, "id" | "read" | "createdAt">[] = [
  {
    severity: "critical",
    title: "Overstay — visitor past expected time",
    description: "Please greet the resident and confirm extended stay.",
    unit: "4A",
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
    description: "Scheduled furniture drop-off for unit 12B.",
    unit: "12B",
    type: "security",
  },
  {
    severity: "info",
    title: "Pool area capacity notice",
    description: "Weekend guest list exceeds soft capacity (POC).",
    type: "system",
  },
  {
    severity: "warning",
    title: "Unfamiliar vehicle (plate scan)",
    description: "Hold at gate until host confirms.",
    unit: "9A",
    type: "security",
  },
];

export const initialAlerts: AlertItem[] = Array.from({ length: 24 }, (_, i) => {
  const base = pick(alertTemplates, i);
  return {
    id: `a-${i + 1}`,
    ...base,
    title: `${base.title} (${pick(unitsPool, i)})`,
    createdAt: now - m(5 + i * 13) - d(Math.floor(i / 6)),
    read: i % 5 === 0 || i % 7 === 0,
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
];

const auditActions = [
  ["check_in", "visitor", "Main gate · photo OK"],
  ["check_out", "visitor", "Departed Gate 1"],
  ["invite_sent", "guest link", "SMS + email"],
  ["vehicle_note", "parking", "Visitor bay 3"],
  ["extend_stay", "visit", "+2h approved by host"],
  ["pre_reg", "visitor", "Window tomorrow 14:00–16:00"],
];

export const initialAudit: AuditEntry[] = Array.from({ length: 56 }, (_, i) => {
  const [action, entity, details] = pick(auditActions, i);
  return {
    id: `au-${i + 1}`,
    at: now - m(2 + i * 9) - d(Math.floor(i / 10)),
    actor: pick(auditActors, i),
    action,
    entity: `${fullName(i + 100)}`,
    details,
  };
});

export const initialTenantInvites: TenantInvitation[] = Array.from({ length: 20 }, (_, i) => {
  const statuses: TenantInvitation["status"][] = ["upcoming", "upcoming", "used", "revoked"];
  return {
    id: `ti-${i + 1}`,
    tenantUnit: pick(unitsPool, i + 1),
    hostName: fullName(i + 3),
    guestName: fullName(i + 50),
    purpose: pick(purposes, i + 1),
    arrivalFrom: now + h(2 + (i % 12)) + d(Math.floor(i / 8)),
    arrivalTo: now + h(5 + (i % 12)) + d(Math.floor(i / 8)),
    token: `invite-wg-${i + 900}`,
    status: statuses[i % statuses.length],
  };
});

export const weeklyVisitorVolume = [28, 34, 31, 42, 39, 45, 52, 48, 44, 41, 46, 50, 47, 43];
