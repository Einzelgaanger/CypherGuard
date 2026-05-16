"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Leaf } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { usePocStore } from "@/poc/poc-store";
import { toast } from "sonner";

const steps = ["welcome", "type", "form", "photo", "confirm", "pass"] as const;

const walkInUnits = ["4A", "7B", "2C", "9A", "12B", "15C", "18A", "22C"];

export default function VisitorPortalPage() {
  const { estate } = usePocStore();
  const [step, setStep] = useState<(typeof steps)[number]>("welcome");
  const [mode, setMode] = useState<"invite" | "walkin" | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [idNo, setIdNo] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("4A");
  const [passId, setPassId] = useState("");

  const next = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) setStep(steps[i + 1]);
  };

  const qrSize = 220;

  return (
    <div className="fixed inset-0 flex flex-col bg-cs-base text-cs-text-primary homestead-pattern">
      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-cs-line bg-cs-surface/90 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Leaf className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold sm:text-base">Visitor welcome</p>
            <p className="truncate text-[11px] text-cs-text-muted">{estate.name}</p>
          </div>
        </div>
        <Link
          href="/"
          className="touch-target inline-flex items-center gap-1 rounded-xl border border-cs-line px-3 text-xs font-medium text-cs-text-secondary hover:bg-cs-hover sm:text-sm"
        >
          <Home className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-10">
        {step === "welcome" ? (
          <div className="max-w-lg text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cs-accent">Hello & welcome</p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-cs-text-primary sm:text-4xl">
              {estate.name}
            </h1>
            <p className="mt-4 text-base text-cs-text-secondary sm:text-lg">
              Tap below to start your visit — we&apos;ll guide you step by step.
            </p>
            <button
              type="button"
              className="mt-10 w-full max-w-md rounded-2xl bg-cs-accent py-5 text-lg font-semibold text-white shadow-md touch-target hover:brightness-105"
              onClick={() => setStep("type")}
            >
              Begin
            </button>
          </div>
        ) : null}

        {step === "type" ? (
          <div className="flex w-full max-w-lg flex-col gap-4">
            <button
              type="button"
              className="rounded-2xl border border-cs-line bg-cs-surface py-5 text-lg font-semibold shadow-sm touch-target hover:border-cs-accent/40"
              onClick={() => {
                setMode("invite");
                next();
              }}
            >
              I have an invite code
            </button>
            <button
              type="button"
              className="rounded-2xl border border-emerald-200 bg-emerald-50/80 py-5 text-lg font-semibold text-emerald-950 touch-target hover:bg-emerald-100"
              onClick={() => {
                setMode("walkin");
                setStep("form");
              }}
            >
              Walk-in visitor
            </button>
          </div>
        ) : null}

        {step === "form" && mode === "invite" ? (
          <div className="w-full max-w-lg space-y-4">
            <p className="text-center font-display text-2xl font-bold text-cs-text-primary">Enter invite code</p>
            <input
              className="mobile-input w-full rounded-2xl border border-cs-line bg-cs-surface px-4 py-4 font-mono text-xl shadow-inner touch-target sm:text-2xl"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. ABC123"
              autoComplete="off"
            />
            <button
              type="button"
              className="w-full rounded-2xl bg-cs-accent py-4 font-semibold text-white touch-target hover:brightness-105"
              onClick={() => {
                if (!code.trim()) return;
                next();
              }}
            >
              Continue
            </button>
          </div>
        ) : null}

        {step === "form" && mode === "walkin" ? (
          <div className="grid w-full max-w-lg gap-4">
            <input
              className="mobile-input rounded-2xl border border-cs-line bg-cs-surface px-4 py-4 text-lg shadow-sm"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="mobile-input rounded-2xl border border-cs-line bg-cs-surface px-4 py-4 text-lg shadow-sm"
              placeholder="ID number"
              value={idNo}
              onChange={(e) => setIdNo(e.target.value)}
            />
            <input
              className="mobile-input rounded-2xl border border-cs-line bg-cs-surface px-4 py-4 text-lg shadow-sm"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label className="sr-only" htmlFor="walkin-unit">
              Visiting unit
            </label>
            <select
              id="walkin-unit"
              className="mobile-input rounded-2xl border border-cs-line bg-cs-surface px-4 py-4 text-lg shadow-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {walkInUnits.map((u) => (
                <option key={u} value={u}>
                  Unit {u}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-2xl bg-cs-accent py-4 font-semibold text-white touch-target hover:brightness-105"
              onClick={() => setStep("photo")}
            >
              Continue
            </button>
          </div>
        ) : null}

        {step === "photo" ? (
          <div className="max-w-lg text-center">
            <p className="font-display text-2xl font-bold text-cs-text-primary">Quick photo</p>
            <p className="mt-2 text-cs-text-secondary">Demo: friendly placeholder snapshot</p>
            <div className="mx-auto mt-6 flex h-48 w-48 max-w-[90vw] items-center justify-center rounded-3xl border-2 border-dashed border-cs-accent/40 bg-cs-elevated text-sm text-cs-text-muted shadow-inner">
              Your photo area
            </div>
            <button
              type="button"
              className="mt-8 w-full max-w-md rounded-2xl bg-cs-accent py-4 font-semibold text-white touch-target hover:brightness-105"
              onClick={() => setStep("confirm")}
            >
              Use placeholder photo
            </button>
          </div>
        ) : null}

        {step === "confirm" ? (
          <div className="max-w-lg text-center text-lg text-cs-text-secondary">
            <p>Your details are ready for unit {mode === "walkin" ? unit : "—"}.</p>
            <p className="mt-4 text-base">Please wait by the gate — a host or guard will confirm.</p>
            <button
              type="button"
              className="mt-10 w-full max-w-md rounded-2xl bg-emerald-700 py-4 font-semibold text-white touch-target hover:bg-emerald-800"
              onClick={() => {
                setPassId(`KIOSK-${Date.now()}`);
                setStep("pass");
              }}
            >
              I&apos;m ready — show my pass
            </button>
          </div>
        ) : null}

        {step === "pass" ? (
          <div className="w-full max-w-md pb-8 text-center">
            <div className="mx-auto inline-flex rounded-2xl border border-cs-line bg-white p-4 shadow-md">
              <QRCodeSVG value={passId} size={qrSize} />
            </div>
            <p className="mt-6 font-display text-xl text-cs-accent sm:text-2xl">Show this at the gate</p>
            <p className="mt-2 text-sm text-cs-text-secondary">
              {name || "Visitor"} · Unit {unit}
            </p>
            <Link
              href="/visitor-portal"
              className="mt-10 inline-block text-sm font-medium text-cs-accent hover:underline"
              onClick={() => toast.message("Starting a fresh visit")}
            >
              Start over
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
