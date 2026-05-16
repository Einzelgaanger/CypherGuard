"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
import {
  ESTATE_DEFAULTS,
  initialActiveVisits,
  initialAlerts,
  initialAudit,
  initialGuards,
  initialPreRegistered,
  initialTenantInvites,
  initialTenants,
} from "./initial-mock";

type PocStoreValue = {
  estate: EstateSettings;
  setEstate: (p: Partial<EstateSettings>) => void;
  activeVisits: ActiveVisit[];
  preRegistered: PreRegisteredVisit[];
  tenants: TenantRecord[];
  guards: GuardRecord[];
  alerts: AlertItem[];
  auditLog: AuditEntry[];
  tenantInvites: TenantInvitation[];
  addAudit: (entry: Omit<AuditEntry, "id" | "at"> & { at?: number }) => void;
  checkOutVisit: (id: string, actor: string) => void;
  checkInVisit: (visit: ActiveVisit) => void;
  extendStay: (id: string, extraMs: number) => void;
  flagVisit: (id: string) => void;
  markAlertRead: (id: string) => void;
  addAlert: (a: Omit<AlertItem, "id" | "read" | "createdAt">) => void;
  broadcastEmergency: () => void;
  emergencyBanner: boolean;
  clearEmergency: () => void;
  addTenantInvite: (inv: TenantInvitation) => void;
  revokeInvite: (id: string) => void;
  removePreRegistered: (id: string) => void;
  addTenant: (t: TenantRecord) => void;
  updateTenant: (id: string, p: Partial<TenantRecord>) => void;
};

const PocStoreContext = createContext<PocStoreValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function PocStoreProvider({ children }: { children: ReactNode }) {
  const [estate, setEstateState] = useState<EstateSettings>({ ...ESTATE_DEFAULTS });
  const [activeVisits, setActiveVisits] = useState<ActiveVisit[]>(() => [
    ...initialActiveVisits,
  ]);
  const [preRegistered, setPreRegistered] = useState<PreRegisteredVisit[]>(() => [
    ...initialPreRegistered,
  ]);
  const [tenants, setTenants] = useState<TenantRecord[]>(() => [...initialTenants]);
  const [guards] = useState<GuardRecord[]>(() => [...initialGuards]);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => [...initialAlerts]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => [...initialAudit]);
  const [tenantInvites, setTenantInvites] = useState<TenantInvitation[]>(() => [
    ...initialTenantInvites,
  ]);
  const [emergencyBanner, setEmergencyBanner] = useState(false);

  const setEstate = useCallback((p: Partial<EstateSettings>) => {
    setEstateState((s) => ({ ...s, ...p }));
  }, []);

  const addAudit = useCallback(
    (entry: Omit<AuditEntry, "id" | "at"> & { at?: number }) => {
      setAuditLog((log) => [
        {
          id: uid(),
          at: entry.at ?? Date.now(),
          actor: entry.actor,
          action: entry.action,
          entity: entry.entity,
          details: entry.details,
        },
        ...log,
      ]);
    },
    [],
  );

  const checkOutVisit = useCallback(
    (id: string, actor: string) => {
      let removed: ActiveVisit | undefined;
      setActiveVisits((rows) => {
        removed = rows.find((x) => x.id === id);
        return rows.filter((x) => x.id !== id);
      });
      if (removed) {
        addAudit({
          actor,
          action: "check_out",
          entity: removed.name,
          details: `Unit ${removed.unit}`,
        });
      }
    },
    [addAudit],
  );

  const checkInVisit = useCallback(
    (visit: ActiveVisit) => {
      setActiveVisits((rows) => [...rows, visit]);
      addAudit({
        actor: "Daniel Kamau",
        action: "check_in",
        entity: visit.name,
        details: `Unit ${visit.unit} · Gate 1`,
      });
    },
    [addAudit],
  );

  const extendStay = useCallback((id: string, extraMs: number) => {
    setActiveVisits((rows) =>
      rows.map((v) =>
        v.id === id ? { ...v, expectedOutAt: v.expectedOutAt + extraMs } : v,
      ),
    );
  }, []);

  const flagVisit = useCallback((id: string) => {
    setActiveVisits((rows) =>
      rows.map((v) => (v.id === id ? { ...v, flagged: true } : v)),
    );
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }, []);

  const addAlert = useCallback((a: Omit<AlertItem, "id" | "read" | "createdAt">) => {
    setAlerts((x) => [
      {
        ...a,
        id: uid(),
        read: false,
        createdAt: Date.now(),
      },
      ...x,
    ]);
  }, []);

  const broadcastEmergency = useCallback(() => {
    setEmergencyBanner(true);
    addAlert({
      severity: "critical",
      title: "Emergency broadcast",
      description: "Guard triggered emergency alert — all stations notified (POC).",
      type: "security",
    });
    addAudit({
      actor: "Daniel Kamau",
      action: "emergency_broadcast",
      entity: "Estate",
      details: "POC simulation",
    });
  }, [addAlert, addAudit]);

  const clearEmergency = useCallback(() => setEmergencyBanner(false), []);

  const addTenantInvite = useCallback((inv: TenantInvitation) => {
    setTenantInvites((list) => [inv, ...list]);
    setPreRegistered((pr) => [
      {
        id: inv.id,
        name: inv.guestName,
        unit: inv.tenantUnit,
        tenantName: inv.hostName ?? "Resident",
        arrivalFrom: inv.arrivalFrom,
        arrivalTo: inv.arrivalTo,
        purpose: inv.purpose,
        token: inv.token,
      },
      ...pr,
    ]);
  }, []);

  const revokeInvite = useCallback((id: string) => {
    setTenantInvites((list) =>
      list.map((i) => (i.id === id ? { ...i, status: "revoked" as const } : i)),
    );
  }, []);

  const removePreRegistered = useCallback((id: string) => {
    setPreRegistered((pr) => pr.filter((p) => p.id !== id));
  }, []);

  const addTenant = useCallback((t: TenantRecord) => {
    setTenants((x) => [...x, t]);
  }, []);

  const updateTenant = useCallback((id: string, p: Partial<TenantRecord>) => {
    setTenants((x) => x.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }, []);

  const value = useMemo(
    () => ({
      estate,
      setEstate,
      activeVisits,
      preRegistered,
      tenants,
      guards,
      alerts,
      auditLog,
      tenantInvites,
      addAudit,
      checkOutVisit,
      checkInVisit,
      extendStay,
      flagVisit,
      markAlertRead,
      addAlert,
      broadcastEmergency,
      emergencyBanner,
      clearEmergency,
      addTenantInvite,
      revokeInvite,
      removePreRegistered,
      addTenant,
      updateTenant,
    }),
    [
      estate,
      setEstate,
      activeVisits,
      preRegistered,
      tenants,
      guards,
      alerts,
      auditLog,
      tenantInvites,
      addAudit,
      checkOutVisit,
      checkInVisit,
      extendStay,
      flagVisit,
      markAlertRead,
      addAlert,
      broadcastEmergency,
      emergencyBanner,
      clearEmergency,
      addTenantInvite,
      revokeInvite,
      removePreRegistered,
      addTenant,
      updateTenant,
    ],
  );

  return <PocStoreContext.Provider value={value}>{children}</PocStoreContext.Provider>;
}

export function usePocStore() {
  const ctx = useContext(PocStoreContext);
  if (!ctx) throw new Error("usePocStore must be used within PocStoreProvider");
  return ctx;
}
