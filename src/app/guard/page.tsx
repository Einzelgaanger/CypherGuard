"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Clock, Shield, UserPlus, ScanLine } from "lucide-react";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { PocStatCard } from "@/poc/ui/poc-stat-card";
import { usePocStore } from "@/poc/poc-store";

export default function GuardDashboardPage() {
  const { activeVisits, preRegistered, broadcastEmergency, emergencyBanner } = usePocStore();
  const overstays = activeVisits.filter((v) => v.expectedOutAt < Date.now()).length;
  const upcoming = [...preRegistered]
    .filter((p) => p.arrivalTo > Date.now())
    .sort((a, b) => a.arrivalFrom - b.arrivalFrom)
    .slice(0, 12);

  return (
    <>
      <PocPageHeader title="Guard station" />
      <div className="mb-6 rounded-xl border border-cs-line bg-cs-elevated px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-5 w-5 text-cs-green" />
            <div>
              <p className="font-semibold text-cs-green">On duty</p>
              <p className="text-cs-text-secondary">
                Daniel Kamau · Gate 1 · Shift 06:00–14:00
              </p>
            </div>
          </div>
          <div className="font-mono text-xl text-cs-accent">
            {new Date().toLocaleTimeString("en-GB")}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PocStatCard label="On-site now" value={activeVisits.length} icon={UserPlus} iconClassName="text-cs-green" />
        <PocStatCard label="Expected today" value={preRegistered.length} icon={Clock} iconClassName="text-cs-purple" />
        <PocStatCard
          label="Overstays"
          value={overstays}
          icon={Clock}
          iconClassName="text-cs-red"
          trend={overstays ? "Action required" : "Clear"}
          trendPositive={overstays === 0}
        />
        <PocStatCard label="Checked out" value={19} icon={Clock} iconClassName="text-cs-text-muted" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-cs-line bg-cs-surface p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Upcoming arrivals</h2>
            <Link href="/guard/check-in" className="rounded-lg bg-cs-accent px-3 py-1.5 text-sm font-semibold text-white">
              Check in visitor
            </Link>
          </div>
          <ul className="divide-y divide-cs-line">
            {upcoming.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cs-purple" />
                  <span className="font-mono text-cs-accent">
                    {new Date(p.arrivalFrom).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="font-medium">{p.name}</span>
                  <span className="rounded-full bg-cs-line px-2 py-0.5 text-[11px]">Unit {p.unit}</span>
                </div>
                <span className="text-cs-text-secondary">{p.purpose}</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="space-y-4 lg:col-span-2">
          <Link
            href="/guard/check-in"
            className="block rounded-xl border border-cs-accent/30 bg-cs-surface p-5 text-center transition hover:bg-cs-hover"
          >
            <ScanLine className="mx-auto h-8 w-8 text-cs-accent" />
            <p className="mt-2 font-semibold">Scan invite code</p>
          </Link>
          <Link
            href="/guard/check-in?tab=walkin"
            className="block rounded-xl border border-cs-line bg-cs-surface p-5 text-center hover:bg-cs-hover"
          >
            <UserPlus className="mx-auto h-8 w-8 text-cs-text-secondary" />
            <p className="mt-2 font-semibold">Walk-in check-in</p>
          </Link>
          <Link
            href="/guard/overstays"
            className="block rounded-xl border border-cs-line bg-cs-surface p-5 text-center hover:bg-cs-hover"
          >
            <Clock className="mx-auto h-8 w-8 text-cs-red" />
            <p className="mt-2 font-semibold">View overstays ({overstays})</p>
          </Link>
          <button
            type="button"
            onClick={() => {
              broadcastEmergency();
              toast.error("Emergency broadcast sent");
            }}
            className="w-full rounded-xl border-2 border-cs-red/40 bg-cs-red/10 p-5 text-center font-bold text-cs-red cs-pulse-red"
          >
            EMERGENCY ALERT
          </button>
        </div>
      </div>
      {emergencyBanner ? (
        <p className="mt-4 text-center text-xs text-cs-red">Emergency mode active — dismiss from banner above.</p>
      ) : null}
    </>
  );
}