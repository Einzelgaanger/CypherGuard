"use client";

import { Home, User, UserPlus, Users } from "lucide-react";
import { PocAppShell } from "@/poc/ui/poc-app-shell";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { href: "/tenant", label: "Dashboard", icon: Home },
    { href: "/tenant/visitors", label: "My visitors", icon: Users },
    { href: "/tenant/pre-register", label: "Pre-register", icon: UserPlus },
    { href: "/tenant/profile", label: "Profile", icon: User },
  ];
  return (
    <PocAppShell
      roleBadge="Your home"
      badgeClassName="bg-cyan-100 text-cyan-950 ring-1 ring-cyan-200/90"
      nav={nav}
    >
      {children}
    </PocAppShell>
  );
}
