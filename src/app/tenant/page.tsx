"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocAuth } from "@/poc/poc-auth-context";
import { usePocStore } from "@/poc/poc-store";

export default function TenantDashboardPage() {
  const { user } = usePocAuth();
  const { estate, tenantInvites, activeVisits } = usePocStore();
  const unit = user?.unit ?? "—";
  const upcoming = tenantInvites.filter((i) => i.status === "upcoming").slice(0, 3);
  const onSite = activeVisits.filter((v) => v.unit === unit);

  return (
    <>
      <PocPageHeader title="Dashboard" />
      <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-cs-line bg-gradient-to-br from-cs-surface to-[#0f1530] p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl font-bold">
            Good morning, {user?.name?.split(" ")[0] ?? "Resident"}.
          </p>
          <p className="mt-1 text-sm text-cs-text-secondary">
            Unit {unit} · {estate.name}
          </p>
        </div>
        <Link
          href="/tenant/pre-register"
          className="inline-flex justify-center rounded-lg bg-cs-accent px-5 py-3 text-center text-sm font-semibold text-black shadow-[0_4px_16px_rgba(0,212,255,0.25)]"
        >
          Pre-register a visitor
        </Link>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-cs-line bg-cs-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Expected today</h2>
            <span className="rounded-full bg-cs-purple/15 px-2 py-0.5 text-[11px] font-semibold text-cs-purple">
              {upcoming.length}
            </span>
          </div>
          <ul className="space-y-3">
            {upcoming.map((i) => (
              <li key={i.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cs-purple" />
                  <span className="font-medium">{i.guestName}</span>
                </div>
                <button
                  type="button"
                  className="text-cs-accent hover:underline"
                  onClick={() => {
                    void navigator.clipboard.writeText(`${window.location.origin}/invite/${i.token}`);
                    toast.success("Invite link copied");
                  }}
                >
                  Copy link
                </button>
              </li>
            ))}
          </ul>
          {upcoming.length === 0 ? (
            <p className="text-sm text-cs-text-muted">No visitors expected today.</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-cs-line bg-cs-surface p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Currently on-site</h2>
          {onSite.length ? (
            <ul className="space-y-3">
              {onSite.map((v) => (
                <li
                  key={v.id}
                  className="rounded-lg border border-cs-green/30 bg-cs-green/5 p-3 text-sm"
                >
                  <p className="font-medium">{v.name}</p>
                  <p className="text-xs text-cs-text-secondary">
                    In since {new Date(v.checkedInAt).toLocaleTimeString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cs-text-muted">No one is currently visiting your unit.</p>
          )}
        </section>
      </div>
    </>
  );
}
