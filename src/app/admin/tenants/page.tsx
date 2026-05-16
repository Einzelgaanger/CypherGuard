"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";
import type { TenantRecord } from "@/poc/types";

const unitOptions = Array.from({ length: 24 }, (_, i) => {
  const n = Math.floor(i / 2) + 1;
  const s = i % 2 === 0 ? "A" : "B";
  return `${n}${s}`;
});

export default function AdminTenantsPage() {
  const { tenants, addTenant } = usePocStore();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [form, setForm] = useState({
    unit: "1A",
    name: "",
    email: "",
    phone: "",
  });

  const handleOpen = () => {
    setOpen(true);
    setPw(`Tmp${Math.random().toString(36).slice(2, 8)}!`);
  };

  const handleCreate = () => {
    const t: TenantRecord = {
      id: `t-${Date.now()}`,
      unit: form.unit,
      name: form.name || "New Tenant",
      email: form.email || `tenant.${form.unit.toLowerCase()}@cyphersec.io`,
      phone: form.phone || "+254700000000",
      status: "active",
      lastActive: "Just now",
      visitorsThisMonth: 0,
    };
    addTenant(t);
    toast.success("Tenant account created (POC)");
    setOpen(false);
    setForm({ unit: "1A", name: "", email: "", phone: "" });
  };

  return (
    <>
      <PocPageHeader title="Tenants" />
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-cs-accent px-4 py-2 text-sm font-semibold text-black shadow-[0_4px_16px_rgba(0,212,255,0.25)] hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Create tenant
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-cs-line bg-cs-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-cs-elevated text-[11px] font-semibold uppercase text-cs-text-secondary">
            <tr>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Visitors / mo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-line">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-cs-hover/60">
                <td className="px-4 py-3 font-mono text-cs-accent">{t.unit}</td>
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-cs-text-secondary">{t.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{t.phone}</td>
                <td className="px-4 py-3">{t.visitorsThisMonth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tenant-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-cs-line bg-cs-elevated p-8">
            <h2 id="tenant-modal-title" className="font-display text-xl font-semibold">
              Add new tenant
            </h2>
            <div className="mt-6 space-y-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-cs-text-secondary">
                Unit number
                <select
                  className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm text-cs-text-primary"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-cs-text-secondary">
                Full name
                <input
                  className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-cs-text-secondary">
                Email
                <input
                  className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-cs-text-secondary">
                Phone
                <input
                  className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </label>
              <div className="rounded-lg border border-cs-line bg-cs-base p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-cs-text-muted">
                  Temporary password
                </p>
                <p className="mt-2 font-mono text-lg text-cs-accent">{pw}</p>
                <p className="mt-2 text-xs text-cs-text-muted">Shown once (POC). Copy before closing.</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-cs-line px-4 py-2 text-sm hover:bg-cs-hover"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-cs-accent px-4 py-2 text-sm font-semibold text-black"
                onClick={handleCreate}
              >
                Create tenant
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
