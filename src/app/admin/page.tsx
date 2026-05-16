"use client";

import dynamic from "next/dynamic";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { cn, formatDateTime } from "@/lib/utils";
import { weeklyVisitorVolume } from "@/poc/initial-mock";
import { usePocStore } from "@/poc/poc-store";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { PocStatCard } from "@/poc/ui/poc-stat-card";
import { VisitorAvatar } from "@/poc/ui/visitor-avatar";
import type { AlertItem } from "@/poc/types";

const ChartBarSkeleton = () => (
  <div className="h-64 w-full animate-pulse rounded-lg bg-cs-elevated" aria-hidden />
);

const ChartDonutSkeleton = () => (
  <div className="h-52 w-full animate-pulse rounded-lg bg-cs-elevated" aria-hidden />
);

const WeeklyVisitorChart = dynamic(
  () =>
    import("@/poc/charts/weekly-visitor-chart").then((m) => ({ default: m.WeeklyVisitorChart })),
  { ssr: false, loading: ChartBarSkeleton },
);

const OccupancyDonut = dynamic(
  () => import("@/poc/charts/occupancy-donut").then((m) => ({ default: m.OccupancyDonut })),
  { ssr: false, loading: ChartDonutSkeleton },
);

const alertToneClasses = (severity: AlertItem["severity"]) => {
  if (severity === "critical") return "border-l-4 border-cs-red bg-red-50/90";
  if (severity === "warning") return "border-l-4 border-amber-400 bg-amber-50/90";
  return "border-l-4 border-cs-blue bg-cs-accent-dim";
};

export default function AdminDashboardPage() {
  const { activeVisits, preRegistered, alerts, auditLog, estate } = usePocStore();
  const overstays = activeVisits.filter((v) => v.expectedOutAt < Date.now()).length;
  const onSite = activeVisits.length;
  const uniqueUnits = new Set(activeVisits.map((v) => v.unit)).size;
  const topAlerts = alerts.filter((a) => !a.read).slice(0, 6);
  const gatePreview = activeVisits.slice(0, 8);
  const todayVisitors = weeklyVisitorVolume[weeklyVisitorVolume.length - 1] ?? 0;
  const priorDay = weeklyVisitorVolume[weeklyVisitorVolume.length - 2] ?? todayVisitors;
  const dayTrend =
    todayVisitors >= priorDay ? `↑ vs prior day (${priorDay})` : `↓ vs prior day (${priorDay})`;

  return (
    <>
      <PocPageHeader title="Neighbourhood pulse" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PocStatCard
          label="Visitors today"
          value={todayVisitors}
          icon={Users}
          trend={dayTrend}
          trendPositive={todayVisitors >= priorDay}
        />
        <PocStatCard
          label="Currently on-site"
          value={onSite}
          icon={MapPin}
          iconClassName="text-cs-green"
          trend="Right now"
          trendPositive
        />
        <PocStatCard
          label="Overstays"
          value={overstays}
          icon={Clock}
          iconClassName="text-cs-red"
          trend={overstays ? "↑ action required" : "All clear"}
          trendPositive={overstays === 0}
        />
        <PocStatCard
          label="Pending pre-reg"
          value={preRegistered.length}
          icon={Calendar}
          iconClassName="text-cs-purple"
          trend="Arriving window"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-2xl border border-cs-line bg-cs-surface p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-semibold text-cs-text-primary">Who&apos;s at the gate</h2>
              <span className="text-xs text-cs-text-muted">Live · updates automatically</span>
            </div>
            <ul className="divide-y divide-cs-line">
              {gatePreview.map((v) => (
                <li key={v.id} className="flex items-center gap-3 py-3">
                  <VisitorAvatar name={v.name} className="h-10 w-10 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.name}</p>
                    <p className="text-xs text-cs-text-muted">
                      Unit {v.unit} · {formatDateTime(v.checkedInAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    Visiting
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/visitors"
              className="mt-3 block text-center text-sm font-medium text-cs-accent hover:underline"
            >
              View all visitors →
            </Link>
          </section>

          <section className="rounded-2xl border border-cs-line bg-cs-surface p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-cs-text-primary">
              Visitor arrivals (recent days)
            </h2>
            <WeeklyVisitorChart data={weeklyVisitorVolume} />
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-cs-line bg-cs-surface p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-cs-text-primary">Friendly alerts</h2>
              <Link href="/admin/alerts" className="shrink-0 text-xs font-medium text-cs-accent hover:underline">
                View all
              </Link>
            </div>
            <ul className="space-y-2">
              {topAlerts.map((a) => (
                <li
                  key={a.id}
                  className={cn("rounded-xl px-3 py-2 text-sm shadow-sm", alertToneClasses(a.severity))}
                >
                  <p className="font-medium text-cs-text-primary">{a.title}</p>
                  <p className="text-xs text-cs-text-secondary">{a.description}</p>
                </li>
              ))}
              {topAlerts.length === 0 ? (
                <p className="text-sm text-cs-text-muted">No unread alerts.</p>
              ) : null}
            </ul>
          </section>

          <section className="rounded-2xl border border-cs-line bg-cs-surface p-5 shadow-sm sm:p-6">
            <h2 className="mb-2 font-display text-lg font-semibold text-cs-text-primary">Homes with guests</h2>
            <p className="mb-4 text-xs text-cs-text-secondary">
              {uniqueUnits} of {estate.unitCount} households have someone visiting
            </p>
            <OccupancyDonut activeUnits={uniqueUnits} totalUnits={estate.unitCount} />
          </section>

          <section className="rounded-2xl border border-cs-line bg-cs-surface p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-cs-text-primary">Recent neighbourhood notes</h2>
            <ul className="space-y-2 text-sm">
              {auditLog.slice(0, 10).map((e) => (
                <li key={e.id} className="flex gap-2 border-b border-cs-line/80 pb-2 last:border-0">
                  <span className="font-mono text-xs text-cs-text-muted">
                    {new Date(e.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-cs-text-secondary">
                    <span className="font-medium text-cs-text-primary">{e.actor}</span> {e.action}{" "}
                    {e.entity} — {e.details}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
