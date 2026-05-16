"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";
import { cn } from "@/lib/utils";
import { Flag, LogOut, Eye } from "lucide-react";
import { VisitorAvatar } from "@/poc/ui/visitor-avatar";

export default function AdminVisitorsPage() {
  const [tab, setTab] = useState<"active" | "pre" | "history">("active");
  const { activeVisits, preRegistered, checkOutVisit, auditLog } = usePocStore();

  const historyRows = useMemo(
    () => auditLog.filter((a) => a.action === "check_out" || a.action === "check_in").slice(0, 120),
    [auditLog],
  );

  return (
    <>
      <PocPageHeader title="Visitors" subtitle="On-site, pre-registered, and history" />
      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["active", `Active (${activeVisits.length})`],
            ["pre", `Pre-registered (${preRegistered.length})`],
            ["history", "History"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === k
                ? "bg-cs-accent text-white"
                : "border border-cs-line bg-cs-surface text-cs-text-secondary hover:bg-cs-hover",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "active" ? (
        <div className="overflow-hidden rounded-xl border border-cs-line bg-cs-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-cs-elevated text-[11px] font-semibold uppercase tracking-wide text-cs-text-secondary">
              <tr>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">In</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cs-line">
              {activeVisits.map((v) => {
                const ms = Date.now() - v.checkedInAt;
                const h = Math.floor(ms / 3600000);
                const m = Math.floor((ms % 3600000) / 60000);
                const durColor =
                  h >= 3 ? "text-cs-red" : h >= 1 ? "text-cs-amber" : "text-cs-green";
                return (
                  <tr key={v.id} className="hover:bg-cs-hover/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <VisitorAvatar name={v.name} className="h-10 w-10 text-xs" />
                        <div>
                          <p className="font-medium">{v.name}</p>
                          <p className="font-mono text-xs text-cs-text-muted">{v.idNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{v.unit}</td>
                    <td className="px-4 py-3 font-mono text-xs text-cs-text-secondary">
                      {new Date(v.checkedInAt).toLocaleString()}
                    </td>
                    <td className={cn("px-4 py-3 font-mono text-xs font-semibold", durColor)}>
                      {h}h {m}m
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cs-line text-cs-green hover:bg-cs-hover"
                        aria-label="Check out"
                        onClick={() => {
                          checkOutVisit(v.id, "Admin");
                          toast.success(`${v.name} checked out`);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cs-line text-cs-amber hover:bg-cs-hover"
                        aria-label="Flag"
                        onClick={() => toast.message("Flag visitor", { description: v.name })}
                      >
                        <Flag className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cs-line text-cs-accent hover:bg-cs-hover"
                        aria-label="View details"
                        onClick={() => toast.message("Visitor details", { description: v.name })}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activeVisits.length === 0 ? (
            <p className="p-8 text-center text-sm text-cs-text-muted">
              No active visitors right now.
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "pre" ? (
        <div className="overflow-hidden rounded-xl border border-cs-line bg-cs-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-cs-elevated text-[11px] font-semibold uppercase text-cs-text-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Window</th>
                <th className="px-4 py-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cs-line">
              {preRegistered.map((p) => (
                <tr key={p.id} className="hover:bg-cs-hover/60">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.unit}</td>
                  <td className="px-4 py-3 font-mono text-xs text-cs-text-secondary">
                    {new Date(p.arrivalFrom).toLocaleString()} — {new Date(p.arrivalTo).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-cs-text-secondary">{p.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "history" ? (
        <div className="overflow-hidden rounded-xl border border-cs-line bg-cs-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-cs-elevated text-[11px] font-semibold uppercase text-cs-text-secondary">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cs-line">
              {historyRows.map((e) => (
                <tr key={e.id} className="hover:bg-cs-hover/60">
                  <td className="px-4 py-3 font-mono text-xs">{new Date(e.at).toLocaleString()}</td>
                  <td className="px-4 py-3">{e.actor}</td>
                  <td className="px-4 py-3">{e.action}</td>
                  <td className="px-4 py-3 text-cs-text-secondary">{e.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end gap-2 border-t border-cs-line p-4">
            <button
              type="button"
              className="rounded-lg border border-cs-line px-4 py-2 text-sm hover:bg-cs-hover"
              onClick={() => toast.message("Exporting CSV…")}
            >
              Export CSV
            </button>
            <button
              type="button"
              className="rounded-lg border border-cs-line px-4 py-2 text-sm hover:bg-cs-hover"
              onClick={() => toast.message("Preparing PDF…")}
            >
              Print PDF
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
