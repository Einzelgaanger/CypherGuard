"use client";

import { Check, Star, X } from "lucide-react";

const GREEN = "var(--landing-green)";
const INK = "var(--landing-ink)";

function GuardPhoneScreen() {
  return (
    <div className="flex h-full flex-col bg-[#f4f8f6] p-3">
      <div className="mb-2.5 flex items-center justify-between rounded-xl bg-white px-2.5 py-2 shadow-[0_4px_20px_-8px_rgba(20,24,22,0.12)]">
        <div>
          <p className="text-[9px] font-bold" style={{ color: GREEN }}>
            On duty
          </p>
          <p className="text-[8px] text-[var(--landing-muted)]">Daniel Kamau · Gate 1</p>
        </div>
        <p className="font-mono text-[10px] font-semibold" style={{ color: GREEN }}>
          14:02
        </p>
      </div>
      <div className="mb-2.5 grid grid-cols-2 gap-2">
        {[
          { label: "On-site", value: "58" },
          { label: "Expected", value: "44" },
          { label: "Overstays", value: "18" },
          { label: "Out", value: "19" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white px-2 py-2 shadow-[0_4px_16px_-8px_rgba(20,24,22,0.1)]"
          >
            <p className="text-[7px] font-semibold uppercase tracking-wide text-[var(--landing-muted)]">
              {s.label}
            </p>
            <p className="text-base font-bold leading-none" style={{ color: INK }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white p-2.5 shadow-[0_4px_20px_-8px_rgba(20,24,22,0.1)]">
        <p className="text-[9px] font-bold" style={{ color: INK }}>
          Upcoming arrivals
        </p>
        <ul className="mt-2 space-y-2">
          {[
            { time: "16:59", name: "Mercy Barasa", unit: "4A" },
            { time: "17:15", name: "Ian Njoroge", unit: "12B" },
          ].map((row) => (
            <li
              key={row.name}
              className="flex items-center gap-1.5 border-b border-[#e8efeb] pb-1.5 text-[8px] last:border-0"
            >
              <span className="font-mono font-medium" style={{ color: GREEN }}>
                {row.time}
              </span>
              <span className="font-semibold" style={{ color: INK }}>
                {row.name}
              </span>
              <span className="ml-auto rounded-full bg-[#eef5f0] px-1.5 py-0.5 text-[7px] text-[var(--landing-muted)]">
                Unit {row.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TenantThumb() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-white p-2.5 shadow-[0_12px_40px_-12px_rgba(20,24,22,0.15)] ring-1 ring-black/[0.04]">
      <div
        className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[var(--landing-green-pale)] to-[#f0f7f3]"
        aria-hidden
      >
        <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
          <div className="h-6 w-6 rounded-lg bg-white shadow-sm" />
          <div className="h-1 w-8 rounded-full bg-white/80" />
          <div className="h-1 w-6 rounded-full bg-white/60" />
        </div>
      </div>
      <p className="mt-2 text-[8px] font-bold leading-tight" style={{ color: INK }}>
        Resident home
      </p>
    </div>
  );
}

export function LandingHeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Soft mint blobs ? reference background */}
      <div
        className="pointer-events-none absolute -right-12 top-8 h-64 w-64 rounded-full bg-[var(--landing-bg-blob)] opacity-80 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-8 top-1/3 h-40 w-40 rounded-full bg-[var(--landing-green-pale)] opacity-60"
        aria-hidden
      />

      <svg
        className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full opacity-50 lg:block"
        aria-hidden
      >
        <path
          d="M 60 100 Q 180 60 260 120"
          fill="none"
          stroke="var(--landing-green-soft)"
          strokeWidth="1.5"
          strokeDasharray="5 8"
        />
        <path
          d="M 300 80 Q 380 140 420 200"
          fill="none"
          stroke="var(--landing-green-soft)"
          strokeWidth="1.5"
          strokeDasharray="5 8"
        />
      </svg>

      <div
        className="absolute left-0 top-12 z-20 h-20 w-20 sm:h-24 sm:w-24 lg:-left-4"
        aria-hidden
      >
        <TenantThumb />
      </div>

      <div
        className="absolute left-8 top-[38%] z-20 flex items-center gap-0.5 rounded-full px-3 py-2 text-white shadow-[0_8px_24px_-6px_rgba(42,157,85,0.45)]"
        style={{ backgroundColor: GREEN }}
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-white text-white" />
        ))}
      </div>

      <div className="absolute bottom-[32%] right-4 z-20 hidden flex-col gap-2 sm:flex lg:right-8" aria-hidden>
        {["Neighbour-aware lists", "Soft alerts for hosts"].map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold shadow-[0_8px_30px_-10px_rgba(20,24,22,0.12)] ring-1 ring-black/[0.04]"
            style={{ color: INK }}
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {label}
          </span>
        ))}
      </div>

      <div
        className="absolute -right-2 top-20 z-20 hidden rounded-2xl px-5 py-4 text-white shadow-[0_16px_40px_-12px_rgba(42,157,85,0.5)] sm:block lg:right-0"
        style={{ backgroundColor: GREEN }}
        aria-hidden
      >
        <p className="font-display text-3xl font-bold leading-none">58</p>
        <p className="mt-1 max-w-[7rem] text-[11px] font-medium leading-snug text-white/90">
          Works on phones & tablets
        </p>
      </div>

      {/* Phone ? white frame like reference */}
      <div className="relative z-10 mx-auto w-[min(100%,300px)] pt-6">
        <div className="rounded-[2.75rem] bg-white p-3 shadow-[0_32px_80px_-24px_rgba(20,24,22,0.22)] ring-1 ring-black/[0.04]">
          <div className="overflow-hidden rounded-[2.25rem] bg-[#f4f8f6]">
            <div
              className="flex items-center justify-between px-5 py-2.5 text-[11px] font-medium"
              style={{ color: INK }}
            >
              <span className="font-mono">14:02</span>
              <span className="rounded-full p-1 text-[var(--landing-muted)]" aria-hidden>
                <X className="h-4 w-4" />
              </span>
            </div>
            <div className="aspect-[9/17] w-full min-h-[360px] max-h-[480px]">
              <GuardPhoneScreen />
            </div>
            <div className="border-t border-[#e8efeb] bg-white px-4 py-4">
              <p className="text-center text-[11px] leading-relaxed text-[var(--landing-muted)]">
                Check visitors in with calm, clear lists ? arrivals, parking notes, and gentle alerts.
              </p>
              <span
                className="mt-3 flex w-full items-center justify-center rounded-full py-2.5 text-xs font-bold text-white"
                style={{ backgroundColor: INK }}
              >
                Open gate view ?
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
