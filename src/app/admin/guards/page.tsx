"use client";

import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";

export default function AdminGuardsPage() {
  const { guards } = usePocStore();
  return (
    <>
      <PocPageHeader title="Guards" subtitle="Shift roster (POC mock)" />
      <div className="overflow-hidden rounded-xl border border-cs-line bg-cs-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-cs-elevated text-[11px] font-semibold uppercase text-cs-text-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Badge</th>
              <th className="px-4 py-3">Shift</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-line">
            {guards.map((g) => (
              <tr key={g.id} className="hover:bg-cs-hover/60">
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="px-4 py-3 font-mono text-cs-accent">{g.badge}</td>
                <td className="px-4 py-3 text-cs-text-secondary">{g.shift}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      g.status === "on_duty"
                        ? "rounded-full bg-cs-green/15 px-2 py-0.5 text-[11px] font-semibold text-cs-green"
                        : "rounded-full bg-cs-text-muted/15 px-2 py-0.5 text-[11px] text-cs-text-muted"
                    }
                  >
                    {g.status === "on_duty" ? "On duty" : "Off duty"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-cs-text-muted">{g.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 rounded-xl border border-dashed border-cs-line bg-cs-surface/50 p-8 text-center text-sm text-cs-text-secondary">
        Weekly shift scheduler UI (POC placeholder — no backend scheduling)
      </div>
    </>
  );
}
