"use client";

import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";
import { cn } from "@/lib/utils";

export default function GuardOnSitePage() {
  const { activeVisits, checkOutVisit, extendStay } = usePocStore();

  return (
    <>
      <PocPageHeader title="On-site visitors" />
      <p className="mb-4 text-sm text-cs-text-secondary">
        {activeVisits.length} visitors currently on-site (POC)
      </p>
      <div className="overflow-hidden rounded-xl border border-cs-line bg-cs-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-cs-elevated text-[11px] font-semibold uppercase text-cs-text-secondary">
            <tr>
              <th className="px-4 py-3">Visitor</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Expected out</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeVisits.map((v) => {
              const overdue = v.expectedOutAt < Date.now();
              const ratio = (Date.now() - v.checkedInAt) / (v.expectedOutAt - v.checkedInAt);
              const warn = !overdue && ratio > 0.8;
              return (
                <tr
                  key={v.id}
                  className={cn(
                    "border-b border-cs-line hover:bg-cs-hover/50",
                    overdue && "border-l-4 border-l-cs-red bg-cs-red/5 cs-pulse-red",
                    warn && "border-l-4 border-l-cs-amber bg-cs-amber/5",
                  )}
                >
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3">{v.unit}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {new Date(v.expectedOutAt).toLocaleString()}
                  </td>
                  <td className="space-x-2 px-4 py-3 text-right">
                    <button
                      type="button"
                      className="rounded-lg border border-cs-line px-2 py-1 text-xs hover:bg-cs-hover"
                      onClick={() => {
                        extendStay(v.id, 3600000);
                        toast.success("Stay extended +1h");
                      }}
                    >
                      +1h
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-cs-green/40 px-2 py-1 text-xs text-cs-green hover:bg-cs-hover"
                      onClick={() => {
                        checkOutVisit(v.id, "Guard");
                        toast.success(`${v.name} checked out`);
                      }}
                    >
                      Check out
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
