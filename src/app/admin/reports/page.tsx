"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";

const types = [
  { id: "daily", title: "Daily visitor summary", desc: "Check-ins and outs for a single day." },
  { id: "overstay", title: "Overstay incidents", desc: "Threshold breaches and resolutions." },
  { id: "tenant", title: "Tenant activity", desc: "Invites and visitor volumes per unit." },
  { id: "guard", title: "Guard shift log", desc: "Check-in actions by guard on duty." },
];

export default function AdminReportsPage() {
  const [sel, setSel] = useState("daily");
  const [generated, setGenerated] = useState(false);

  return (
    <>
      <PocPageHeader title="Reports" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-cs-line bg-cs-surface p-6 lg:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cs-text-secondary">
            Report type
          </p>
          <div className="mt-4 space-y-2">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSel(t.id)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  sel === t.id
                    ? "border-cs-accent bg-cs-accent-dim"
                    : "border-cs-line hover:border-cs-accent/40"
                }`}
              >
                <p className="font-semibold">{t.title}</p>
                <p className="mt-1 text-xs text-cs-text-muted">{t.desc}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-cs-accent py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              setGenerated(true);
              toast.success("Report generated");
            }}
          >
            Generate report
          </button>
          {generated ? (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-cs-line py-2 text-sm hover:bg-cs-hover"
                onClick={() => toast.message("Opening print dialog…")}
              >
                Export PDF
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-cs-line py-2 text-sm hover:bg-cs-hover"
                onClick={() => toast.message("Downloading CSV…")}
              >
                Export CSV
              </button>
            </div>
          ) : null}
        </div>
        <div className="rounded-xl border border-cs-line bg-cs-surface p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Preview</h2>
          {generated ? (
            <div className="mt-4 space-y-4 text-sm">
              <p className="text-cs-text-secondary">
                Period: last 7 days · Total visits: 234 · Avg daily: 33 · Overstays: 11
              </p>
              <div className="rounded-lg border border-cs-line bg-cs-base p-4 font-mono text-xs text-cs-text-secondary">
                {types.find((x) => x.id === sel)?.title} — tabular preview placeholder.
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-cs-text-muted">Generate a report to see a preview panel.</p>
          )}
        </div>
      </div>
    </>
  );
}
