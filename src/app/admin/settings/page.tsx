"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";
import { cn } from "@/lib/utils";

const tabs = [
  "Estate profile",
  "Gate config",
  "Notifications",
  "Branding",
  "Audit trail",
  "Change password",
] as const;

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Estate profile");
  const { estate, setEstate, auditLog } = usePocStore();

  return (
    <>
      <PocPageHeader title="Settings" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 flex-wrap gap-2 lg:w-52 lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-3 py-2 text-left text-sm font-medium",
                tab === t ? "bg-cs-accent-dim text-cs-accent" : "text-cs-text-secondary hover:bg-cs-hover",
              )}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="min-h-[320px] flex-1 rounded-xl border border-cs-line bg-cs-surface p-6">
          {tab === "Estate profile" ? (
            <div className="max-w-lg space-y-4">
              <label className="block text-[11px] font-semibold uppercase text-cs-text-secondary">
                Estate name
                <input
                  className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
                  value={estate.name}
                  onChange={(e) => setEstate({ name: e.target.value })}
                />
              </label>
              <label className="block text-[11px] font-semibold uppercase text-cs-text-secondary">
                Address
                <input
                  className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
                  value={estate.address}
                  onChange={(e) => setEstate({ address: e.target.value })}
                />
              </label>
              <button
                type="button"
                className="rounded-lg bg-cs-accent px-4 py-2 text-sm font-semibold text-white"
                onClick={() => toast.success("Settings saved")}
              >
                Save changes
              </button>
            </div>
          ) : null}
          {tab === "Gate config" ? (
            <div className="max-w-lg space-y-4 text-sm">
              <ToggleRow
                label="Allow walk-in visitors"
                checked={estate.walkInsAllowed}
                onChange={(v) => setEstate({ walkInsAllowed: v })}
              />
              <ToggleRow
                label="Require visitor photo at check-in"
                checked={estate.photoRequired}
                onChange={(v) => setEstate({ photoRequired: v })}
              />
              <label className="block text-[11px] font-semibold uppercase text-cs-text-secondary">
                Overstay threshold (hours)
                <input
                  type="number"
                  className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
                  value={estate.overstayHours}
                  onChange={(e) => setEstate({ overstayHours: Number(e.target.value) })}
                />
              </label>
              <button
                type="button"
                className="rounded-lg bg-cs-accent px-4 py-2 text-sm font-semibold text-white"
                onClick={() => toast.success("Configuration saved")}
              >
                Save configuration
              </button>
            </div>
          ) : null}
          {tab === "Branding" ? (
            <div className="max-w-lg space-y-4">
              <label className="block text-[11px] font-semibold uppercase text-cs-text-secondary">
                Estate accent colour
                <input
                  type="color"
                  className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-cs-line bg-cs-base"
                  value={estate.accentHex}
                  onChange={(e) => setEstate({ accentHex: e.target.value })}
                />
              </label>
              <p className="text-xs text-cs-text-muted">
                In a full build this would propagate to CSS variables across the shell.
              </p>
            </div>
          ) : null}
          {tab === "Audit trail" ? (
            <div className="max-h-[480px] overflow-auto text-sm">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-cs-elevated text-[11px] uppercase text-cs-text-secondary">
                  <tr>
                    <th className="px-2 py-2">Time</th>
                    <th className="px-2 py-2">Actor</th>
                    <th className="px-2 py-2">Action</th>
                    <th className="px-2 py-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cs-line">
                  {auditLog.map((e) => (
                    <tr key={e.id}>
                      <td className="px-2 py-2 font-mono text-xs">{new Date(e.at).toLocaleString()}</td>
                      <td className="px-2 py-2">{e.actor}</td>
                      <td className="px-2 py-2">{e.action}</td>
                      <td className="px-2 py-2 text-cs-text-secondary">{e.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {tab === "Notifications" || tab === "Change password" ? (
            <p className="text-sm text-cs-text-secondary">
              {tab} settings are managed by your estate administrator.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-cs-line bg-cs-base px-4 py-3">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 rounded-full transition-colors",
          checked ? "bg-cs-accent" : "bg-cs-elevated",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform",
            checked ? "left-6" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
