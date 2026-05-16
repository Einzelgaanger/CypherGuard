import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Overlapping circles — matches landing & app shell branding */
export function CsBrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-12 w-12 shrink-0", className)} aria-hidden>
      <span className="absolute left-0 top-1 h-8 w-8 rounded-full bg-[var(--card-dark)]" />
      <span className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-cs-accent ring-[3px] ring-cs-surface" />
    </span>
  );
}

export function CsBrandHeader({
  subtitle,
  title = "CypherSec",
}: {
  subtitle?: string;
  title?: string;
}) {
  const isFullTitle = title.includes("Cypher");
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex justify-center">
        <CsBrandMark />
      </div>
      {isFullTitle ? (
        <p className="font-display text-2xl font-bold tracking-tight text-cs-text-primary">
          Cypher<span className="text-cs-accent">Sec</span>
        </p>
      ) : (
        <p className="font-display text-2xl font-bold tracking-tight text-cs-text-primary">{title}</p>
      )}
      {subtitle ? <p className="mt-2 text-sm text-cs-text-muted">{subtitle}</p> : null}
    </div>
  );
}

export function CsStandaloneShell({
  children,
  className,
  maxWidth = "440px",
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-cs-base px-4 py-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-cs-accent-pale opacity-70 blur-3xl" />
        <div className="absolute -left-20 bottom-12 h-64 w-64 rounded-full bg-cs-accent-dim blur-2xl" />
      </div>
      <div className="relative z-10 w-full" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

export function CsAuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-cs-line bg-cs-surface p-8 shadow-[0_24px_80px_-24px_rgba(20,24,22,0.1)] ring-1 ring-black/[0.04] sm:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CsSegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("flex rounded-2xl bg-cs-elevated p-1 ring-1 ring-cs-line", className)}
      role="tablist"
      aria-label="Select role"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "min-h-[44px] flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-150",
            value === opt.id
              ? "bg-cs-surface text-cs-accent shadow-sm ring-1 ring-cs-line/80"
              : "text-cs-text-secondary hover:text-cs-text-primary",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function CsBackHomeLink({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-xs text-cs-text-muted", className)}>
      <Link href="/" className="font-semibold text-cs-accent hover:underline">
        ← Back home
      </Link>
    </p>
  );
}
