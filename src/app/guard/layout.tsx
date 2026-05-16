"use client";

import {
  AlertTriangle,
  Clock,
  History,
  LayoutDashboard,
  ScanLine,
  Users,
} from "lucide-react";
import { PocAppShell } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  const { activeVisits, alerts } = usePocStore();
  const overstays = activeVisits.filter((v) => v.expectedOutAt < Date.now()).length;
  const unread = alerts.filter((a) => !a.read && a.type !== "system").length;
  const nav = [
    { href: "/guard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/guard/check-in", label: "Check-in", icon: ScanLine },
    { href: "/guard/on-site", label: "On-site", icon: Users, badge: activeVisits.length },
    { href: "/guard/overstays", label: "Overstays", icon: AlertTriangle, badge: overstays },
    { href: "/guard/alerts", label: "Alerts", icon: Clock, badge: unread },
    { href: "/guard/history", label: "History", icon: History },
  ];
  return (
    <PocAppShell
      roleBadge="Gate & lobby"
      badgeClassName="bg-cs-accent-dim text-cs-accent ring-1 ring-cs-line"
      nav={nav}
    >
      {children}
    </PocAppShell>
  );
}
