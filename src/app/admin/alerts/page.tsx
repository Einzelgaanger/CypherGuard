"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";
import { cn } from "@/lib/utils";

export default function AdminAlertsPage() {
  const { alerts, markAlertRead } = usePocStore();
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    return a.severity === filter;
  });

  return (
    <>
      <PocPageHeader title="Alerts" />
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "critical", "warning", "info"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold capitalize",
              filter === f
                ? "bg-cs-accent text-black"
                : "border border-cs-line bg-cs-surface text-cs-text-secondary hover:bg-cs-hover",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {filtered.map((a) => (
          <li
            key={a.id}
            className={cn(
              "flex flex-col gap-3 rounded-r-lg border-l-4 border-cs-line bg-cs-surface p-4 sm:flex-row sm:items-center sm:justify-between",
              a.severity === "critical" && "border-l-cs-red",
              a.severity === "warning" && "border-l-cs-amber",
              a.severity === "info" && "border-l-cs-blue",
              a.read && "opacity-50",
            )}
          >
            <div>
              <p className="font-semibold text-cs-text-primary">{a.title}</p>
              <p className="mt-1 text-sm text-cs-text-secondary">{a.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-cs-line px-3 py-1.5 text-sm hover:bg-cs-hover"
                onClick={() => markAlertRead(a.id)}
              >
                Mark read
              </button>
              <button
                type="button"
                className="rounded-lg bg-cs-accent px-3 py-1.5 text-sm font-semibold text-black"
                onClick={() => toast.message("Escalation sent (POC)", { description: a.title })}
              >
                Escalate
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
