"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { PocPageHeader } from "@/poc/ui/poc-app-shell";
import { usePocStore } from "@/poc/poc-store";
import { cn } from "@/lib/utils";
import type { ActiveVisit } from "@/poc/types";
import { QRScanner } from "@/components/qr/QRScanner";

const UNIT_OPTIONS = ["4A", "7B", "2C", "1A"];

function GuardCheckInInner() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "walkin" ? "walkin" : "invite";
  const [tab, setTab] = useState<"invite" | "walkin">(initialTab);
  const { preRegistered, tenantInvites, checkInVisit, removePreRegistered } = usePocStore();
  const [tokenInput, setTokenInput] = useState("");
  const [matched, setMatched] = useState<{
    name: string;
    unit: string;
    purpose: string;
    phone?: string;
    idNo?: string;
  } | null>(null);
  const [idVerified, setIdVerified] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pass, setPass] = useState<ActiveVisit | null>(null);

  const [walk, setWalk] = useState({
    name: "",
    idNo: "",
    phone: "",
    vehicle: "",
    unit: "4A",
    purpose: "Guest Visit",
  });

  const lookup = (raw: string) => {
    const t = raw.trim();
    const pre = preRegistered.find((p) => p.token === t);
    if (pre) {
      setMatched({
        name: pre.name,
        unit: pre.unit,
        purpose: pre.purpose,
        phone: pre.phone,
        idNo: pre.idNo,
      });
      return;
    }
    const inv = tenantInvites.find((i) => i.token === t);
    if (inv) {
      setMatched({
        name: inv.guestName,
        unit: inv.tenantUnit,
        purpose: inv.purpose,
      });
      return;
    }
    toast.error("No invitation found for this code");
    setMatched(null);
  };

  const confirmPreReg = () => {
    if (!matched || !idVerified) return;
    const visit: ActiveVisit = {
      id: `v-${Date.now()}`,
      name: matched.name,
      idNo: matched.idNo ?? "N/A",
      phone: matched.phone ?? "+254700000000",
      unit: matched.unit,
      tenantName: "Resident",
      photoUrl: `https://i.pravatar.cc/80?u=${encodeURIComponent(matched.name)}`,
      checkedInAt: Date.now(),
      expectedOutAt: Date.now() + 3 * 3600000,
      purpose: matched.purpose,
      invitationToken: tokenInput,
    };
    checkInVisit(visit);
    const pr = preRegistered.find((p) => p.token === tokenInput);
    if (pr) removePreRegistered(pr.id);
    toast.success(`✓ ${matched.name} checked in to Unit ${matched.unit}`);
    setPass(visit);
    setMatched(null);
    setIdVerified(false);
    setTokenInput("");
  };

  const submitWalkIn = () => {
    const visit: ActiveVisit = {
      id: `v-${Date.now()}`,
      name: walk.name,
      idNo: walk.idNo,
      phone: walk.phone,
      unit: walk.unit,
      tenantName: "Resident",
      photoUrl: `https://i.pravatar.cc/80?u=${encodeURIComponent(walk.name)}`,
      checkedInAt: Date.now(),
      expectedOutAt: Date.now() + 3 * 3600000,
      purpose: walk.purpose,
      vehicle: walk.vehicle || undefined,
    };
    checkInVisit(visit);
    toast.success(`✓ ${walk.name} checked in to Unit ${walk.unit}`);
    toast.message("SMS sent (POC console)", { description: "Tenant notified" });
    setPass(visit);
  };

  return (
    <>
      <PocPageHeader title="Check-in portal" />
      <div className="mb-6 flex rounded-full border border-cs-line bg-cs-surface p-1">
        <button
          type="button"
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-semibold",
            tab === "invite" ? "bg-cs-accent text-black" : "text-cs-text-secondary",
          )}
          onClick={() => setTab("invite")}
        >
          QR / Pre-registered
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-semibold",
            tab === "walkin" ? "bg-cs-accent text-black" : "text-cs-text-secondary",
          )}
          onClick={() => setTab("walkin")}
        >
          Walk-in
        </button>
      </div>

      {tab === "invite" ? (
        <div className="space-y-6 rounded-xl border border-cs-line bg-cs-surface p-6">
          {!showScanner ? (
            <>
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-cs-line bg-cs-elevated p-6 text-center">
                <p className="text-sm text-cs-text-secondary">Point camera at visitor QR (opens scanner)</p>
                <button
                  type="button"
                  className="mt-4 rounded-lg bg-cs-accent px-4 py-2 text-sm font-semibold text-black"
                  onClick={() => setShowScanner(true)}
                >
                  Open camera scanner
                </button>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase text-cs-text-secondary">
                  Or enter invite code
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-cs-line bg-cs-base px-3 py-2 font-mono text-sm"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="pre-abc-001"
                  />
                  <button
                    type="button"
                    className="rounded-lg bg-cs-accent px-4 py-2 text-sm font-semibold text-black"
                    onClick={() => lookup(tokenInput)}
                  >
                    Look up
                  </button>
                </div>
              </div>
            </>
          ) : (
            <QRScanner
              mode="checkin"
              onCancel={() => setShowScanner(false)}
              onScanSuccess={(data: { type?: string; token?: string }) => {
                setShowScanner(false);
                const token =
                  data?.type === "invitation" && data.token
                    ? data.token
                    : typeof (data as unknown as { raw?: string }).raw === "string"
                      ? (data as { raw: string }).raw
                      : "";
                if (token) {
                  setTokenInput(token);
                  lookup(token);
                }
              }}
            />
          )}

          {matched ? (
            <div className="rounded-xl border border-cs-purple/30 bg-cs-purple/5 p-4">
              <p className="text-sm font-semibold text-cs-green">Valid invitation</p>
              <p className="mt-2 text-sm text-cs-text-secondary">
                {matched.name} · Unit {matched.unit} · {matched.purpose}
              </p>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={idVerified} onChange={(e) => setIdVerified(e.target.checked)} />
                I have verified the visitor&apos;s physical ID
              </label>
              <button
                type="button"
                disabled={!idVerified}
                className="mt-4 w-full rounded-lg bg-cs-accent py-2.5 text-sm font-semibold text-black disabled:opacity-40"
                onClick={confirmPreReg}
              >
                Confirm check-in
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 rounded-xl border border-cs-line bg-cs-surface p-6 md:grid-cols-2">
          <input
            className="rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
            placeholder="Full name"
            value={walk.name}
            onChange={(e) => setWalk((w) => ({ ...w, name: e.target.value }))}
          />
          <input
            className="rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
            placeholder="ID number"
            value={walk.idNo}
            onChange={(e) => setWalk((w) => ({ ...w, idNo: e.target.value }))}
          />
          <input
            className="rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
            placeholder="Phone"
            value={walk.phone}
            onChange={(e) => setWalk((w) => ({ ...w, phone: e.target.value }))}
          />
          <input
            className="rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm"
            placeholder="Vehicle (optional)"
            value={walk.vehicle}
            onChange={(e) => setWalk((w) => ({ ...w, vehicle: e.target.value }))}
          />
          <select
            className="rounded-lg border border-cs-line bg-cs-base px-3 py-2 text-sm md:col-span-2"
            value={walk.unit}
            onChange={(e) => setWalk((w) => ({ ...w, unit: e.target.value }))}
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                Unit {u}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="md:col-span-2 mt-2 w-full rounded-lg bg-cs-accent py-3 text-sm font-semibold text-black"
            onClick={submitWalkIn}
          >
            Check in visitor
          </button>
        </div>
      )}

      {pass ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-w-md rounded-2xl border border-cs-line bg-cs-elevated p-8 text-center">
            <p className="font-display text-lg font-bold tracking-widest text-cs-accent">VISITOR PASS</p>
            <div className="mt-4 flex justify-center">
              <QRCodeSVG value={pass.id} size={160} />
            </div>
            <p className="mt-4 font-display text-xl font-semibold">{pass.name}</p>
            <p className="text-sm text-cs-text-secondary">
              Unit {pass.unit} · {new Date(pass.checkedInAt).toLocaleString()}
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-lg border border-cs-line py-2 text-sm"
              onClick={() => setPass(null)}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function GuardCheckInPage() {
  return (
    <Suspense fallback={<p className="text-cs-text-muted">Loading…</p>}>
      <GuardCheckInInner />
    </Suspense>
  );
}
