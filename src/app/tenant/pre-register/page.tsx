"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocAuth } from "@/poc/poc-auth-context";
import { usePocStore } from "@/poc/poc-store";
import type { TenantInvitation } from "@/poc/types";
import { cn } from "@/lib/utils";

const purposes = [
  "Guest Visit",
  "Delivery",
  "Maintenance / Service",
  "Event",
  "Other",
] as const;

type Purpose = (typeof purposes)[number];

export default function TenantPreRegisterPage() {
  const { user } = usePocAuth();
  const { addTenantInvite } = usePocStore();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState<{ token: string; link: string } | null>(null);
  const [form, setForm] = useState<{
    name: string;
    phone: string;
    idNo: string;
    vehicle: string;
    arrivalDate: string;
    arrivalTime: string;
    departTime: string;
    purpose: Purpose;
    notes: string;
  }>({
    name: "",
    phone: "",
    idNo: "",
    vehicle: "",
    arrivalDate: "",
    arrivalTime: "",
    departTime: "",
    purpose: "Guest Visit",
    notes: "",
  });

  const submit = () => {
    const token = `inv-${Math.random().toString(36).slice(2, 10)}`;
    const from = new Date(`${form.arrivalDate}T${form.arrivalTime}`).getTime();
    const to = new Date(`${form.arrivalDate}T${form.departTime || form.arrivalTime}`).getTime() + 3600000;
    const inv: TenantInvitation = {
      id: `ti-${Date.now()}`,
      tenantUnit: user?.unit ?? "4A",
      hostName: user?.name,
      guestName: form.name,
      purpose: form.purpose,
      arrivalFrom: from,
      arrivalTo: to,
      token,
      status: "upcoming",
    };
    addTenantInvite(inv);
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${token}`;
    setDone({ token, link });
    toast.success("Invitation created");
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-cs-line bg-cs-elevated p-10 text-center">
        <p className="text-4xl text-cs-green">✓</p>
        <h2 className="mt-4 font-display text-2xl font-semibold">Invitation created</h2>
        <p className="mt-2 text-sm text-cs-text-secondary">Share this with your visitor</p>
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-cs-line bg-cs-base px-3 py-2 font-mono text-xs break-all">
          {done.link}
        </div>
        <div className="mt-6 flex justify-center rounded-lg border border-cs-line bg-white p-4">
          <QRCodeSVG value={done.link} size={200} level="M" />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(`Your invite: ${done.link}`)}`,
                "_blank",
              )
            }
          >
            WhatsApp
          </button>
          <button
            type="button"
            className="rounded-lg border border-cs-line px-4 py-2 text-sm"
            onClick={() => toast.message("SMS would be sent in production")}
          >
            Send SMS
          </button>
          <button
            type="button"
            className="rounded-lg bg-cs-accent px-4 py-2 text-sm font-semibold text-black"
            onClick={() => {
              setDone(null);
              setStep(1);
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PocPageHeader title="Pre-register visitor" />
      <div className="mx-auto max-w-xl rounded-2xl border border-cs-line bg-cs-surface p-8">
        <div className="mb-8 flex justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  step >= s ? "bg-cs-accent text-black" : "bg-cs-elevated text-cs-text-muted",
                )}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 ? <div className="mt-3 h-0.5 w-full bg-cs-line" /> : null}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <Field label="ID number (optional)" value={form.idNo} onChange={(v) => setForm((f) => ({ ...f, idNo: v }))} />
            <Field label="Vehicle (optional)" value={form.vehicle} onChange={(v) => setForm((f) => ({ ...f, vehicle: v }))} />
            <button type="button" className="mt-4 w-full rounded-lg bg-cs-accent py-2.5 font-semibold text-black" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <Field label="Arrival date" value={form.arrivalDate} onChange={(v) => setForm((f) => ({ ...f, arrivalDate: v }))} type="date" />
            <Field label="Arrival time" value={form.arrivalTime} onChange={(v) => setForm((f) => ({ ...f, arrivalTime: v }))} type="time" />
            <Field label="Expected departure" value={form.departTime} onChange={(v) => setForm((f) => ({ ...f, departTime: v }))} type="time" />
            <label className="block text-[11px] font-semibold uppercase text-cs-text-secondary">
              Purpose
              <select
                className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
                value={form.purpose}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purpose: e.target.value as Purpose }))
                }
              >
                {purposes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] font-semibold uppercase text-cs-text-secondary">
              Notes to guard
              <textarea
                className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </label>
            <div className="flex gap-2">
              <button type="button" className="flex-1 rounded-lg border border-cs-line py-2" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="button" className="flex-1 rounded-lg bg-cs-accent py-2 font-semibold text-black" onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4 text-sm">
            <p className="text-cs-text-secondary">Review and confirm.</p>
            <ul className="space-y-2 rounded-lg border border-cs-line bg-cs-base p-4 text-cs-text-secondary">
              <li>
                <span className="text-cs-text-muted">Name:</span> {form.name}
              </li>
              <li>
                <span className="text-cs-text-muted">When:</span> {form.arrivalDate} {form.arrivalTime}
              </li>
              <li>
                <span className="text-cs-text-muted">Purpose:</span> {form.purpose}
              </li>
            </ul>
            <div className="flex gap-2">
              <button type="button" className="flex-1 rounded-lg border border-cs-line py-2" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="flex-1 rounded-lg bg-cs-accent py-2 font-semibold text-black" onClick={submit}>
                Confirm &amp; generate invite
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-[11px] font-semibold uppercase text-cs-text-secondary">
      {label}
      <input
        type={type}
        className="mt-2 w-full rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
