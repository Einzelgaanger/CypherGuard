"use client";

import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";

export default function GuardOverstaysPage() {
  const { activeVisits, checkOutVisit } = usePocStore();
  const list = activeVisits.filter((v) => v.expectedOutAt < Date.now());

  return (
    <>
      <PocPageHeader title="Overstays" />
      {list.length ? (
        <div className="mb-4 rounded-lg border border-cs-red/30 bg-cs-red/10 px-4 py-3 text-sm font-semibold text-cs-red">
          {list.length} visitor(s) overdue — please take action.
        </div>
      ) : null}
      <div className="space-y-4">
        {list.map((v) => {
          const overMs = Date.now() - v.expectedOutAt;
          const h = Math.floor(overMs / 3600000);
          const m = Math.floor((overMs % 3600000) / 60000);
          return (
            <div
              key={v.id}
              className="rounded-xl border border-cs-red/20 bg-cs-red/5 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold">{v.name}</p>
                  <p className="text-sm text-cs-red">
                    {h}h {m}m past expected out
                  </p>
                  <p className="mt-2 font-mono text-xs text-cs-text-secondary">{v.phone}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-cs-amber px-3 py-1.5 text-sm font-semibold text-black"
                    onClick={() => toast.message("Alert sent to tenant (POC)")}
                  >
                    Alert tenant
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-cs-line px-3 py-1.5 text-sm"
                    onClick={() => toast.message("Admin notified (POC)")}
                  >
                    Notify admin
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-cs-red px-3 py-1.5 text-sm text-cs-red"
                    onClick={() => {
                      checkOutVisit(v.id, "Guard");
                      toast.success("Checked out");
                    }}
                  >
                    Check out now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 ? (
          <p className="text-sm text-cs-text-muted">No overstays right now.</p>
        ) : null}
      </div>
    </>
  );
}
