"use client";

import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";

export default function GuardAlertsPage() {
  const { alerts, markAlertRead, broadcastEmergency } = usePocStore();
  const list = alerts.filter((a) => a.type !== "system");

  return (
    <>
      <PocPageHeader title="Alerts" />
      <ul className="space-y-2">
        {list.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-lg border border-cs-line bg-cs-surface p-4">
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-cs-text-secondary">{a.description}</p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-cs-line px-3 py-1 text-sm"
              onClick={() => markAlertRead(a.id)}
            >
              Mark read
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-8 w-full rounded-xl border-2 border-cs-red/40 bg-cs-red/10 py-4 text-sm font-bold text-cs-red"
        onClick={() => {
          broadcastEmergency();
          toast.error("Emergency alert sent");
        }}
      >
        Emergency alert
      </button>
    </>
  );
}
