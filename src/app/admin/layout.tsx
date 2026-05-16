"use client";

import {
  Bell,
  Building2,
  LayoutDashboard,
  LineChart,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { PocAppShell } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { alerts } = usePocStore();
  const unread = alerts.filter((a) => !a.read).length;
  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/visitors", label: "Visitors", icon: Users },
    { href: "/admin/tenants", label: "Tenants", icon: Building2 },
    { href: "/admin/guards", label: "Guards", icon: Shield },
    { href: "/admin/alerts", label: "Alerts", icon: Bell, badge: unread },
    { href: "/admin/reports", label: "Reports", icon: LineChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];
  return (
    <PocAppShell
      roleBadge="Community office"
      badgeClassName="bg-sky-100 text-sky-900 ring-1 ring-sky-200/90"
      nav={nav}
    >
      {children}
    </PocAppShell>
  );
}
