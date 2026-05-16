"use client";

import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";

export default function GuardHistoryPage() {
  const { auditLog } = usePocStore();
  const rows = auditLog.filter((a) => a.action === "check_out" || a.action === "check_in");

  return (
    <>
      <PocPageHeader title="Visit history" subtitle="Today's gate activity" />
      <div className="overflow-hidden rounded-xl border border-cs-line bg-cs-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-cs-elevated text-[11px] font-semibold uppercase text-cs-text-secondary">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3 text-right">Re-print</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-line">
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-mono text-xs">{new Date(e.at).toLocaleString()}</td>
                <td className="px-4 py-3">{e.action}</td>
                <td className="px-4 py-3 text-cs-text-secondary">{e.details}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-cs-accent hover:underline"
                    onClick={() => toast.message("Reprinting visitor pass…")}
                  >
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
