"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PocStatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: string;
  trendPositive?: boolean;
};

export function PocStatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  trend,
  trendPositive = true,
}: PocStatCardProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-cs-line bg-cs-surface p-5 shadow-sm transition-all duration-300 ease-out-expo",
        "hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/80",
        "motion-reduce:transform-none motion-reduce:hover:translate-y-0",
        "sm:p-6",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-cs-text-muted">{label}</p>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 text-cs-accent shadow-inner ring-1 ring-sky-100/80 transition duration-300 group-hover:scale-105 group-hover:shadow-md">
          <Icon className={cn("h-5 w-5", iconClassName ?? "text-cs-accent")} aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-cs-text-primary sm:text-4xl">{value}</p>
      {trend ? (
        <p className={cn("mt-2 text-xs font-semibold", trendPositive ? "text-cs-green" : "text-cs-red")}>{trend}</p>
      ) : (
        <p className="mt-2 text-xs font-medium text-cs-text-muted">Demo snapshot</p>
      )}
    </div>
  );
}
