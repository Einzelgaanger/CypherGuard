"use client";

import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocAuth } from "@/poc/poc-auth-context";

export default function TenantProfilePage() {
  const { user } = usePocAuth();
  return (
    <>
      <PocPageHeader title="Profile" />
      <div className="max-w-lg space-y-4 rounded-xl border border-cs-line bg-cs-surface p-6 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase text-cs-text-muted">Unit</p>
          <p className="mt-1 font-medium">{user?.unit}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase text-cs-text-muted">Name</p>
          <p className="mt-1 font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase text-cs-text-muted">Email</p>
          <p className="mt-1 font-mono text-xs">{user?.email}</p>
        </div>
        <p className="text-xs text-cs-text-muted">
          Change password and notification preferences — POC placeholder (contact admin).
        </p>
      </div>
    </>
  );
}
