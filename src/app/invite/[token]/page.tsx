"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { usePocStore } from "@/poc/poc-store";

export default function InvitePublicPage({ params }: { params: { token: string } }) {
  const { preRegistered, tenantInvites, estate } = usePocStore();
  const token = params.token;
  const pre = preRegistered.find((p) => p.token === token);
  const inv = tenantInvites.find((i) => i.token === token);
  const row = pre
    ? { name: pre.name, unit: pre.unit, purpose: pre.purpose }
    : inv
      ? { name: inv.guestName, unit: inv.tenantUnit, purpose: inv.purpose }
      : null;

  if (!row) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cs-base px-6 py-12 text-center homestead-pattern">
        <p className="font-display text-xl text-cs-text-primary">We couldn&apos;t find that invite</p>
        <p className="mt-2 max-w-sm text-sm text-cs-text-secondary">
          Ask your host to resend the link — typos happen, especially on small screens.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-2xl bg-cs-accent px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105"
        >
          Back to CypherSec home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cs-base px-5 py-12 text-center homestead-pattern sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cs-accent">Expected guest</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-cs-text-primary sm:text-4xl">{estate.name}</h1>
      <p className="mt-4 max-w-md text-base text-cs-text-secondary sm:text-lg">
        Show this screen to the gate — they&apos;ll match you with the home you&apos;re visiting.
      </p>
      <div className="mt-8 w-full max-w-md rounded-3xl border border-cs-line bg-cs-surface p-6 text-left text-sm shadow-lg sm:p-8">
        <p>
          <span className="text-cs-text-muted">Guest:</span>{" "}
          <span className="font-semibold text-cs-text-primary">{row.name}</span>
        </p>
        <p className="mt-3">
          <span className="text-cs-text-muted">Visiting:</span>{" "}
          <span className="font-medium">Unit {row.unit}</span>
        </p>
        <p className="mt-3">
          <span className="text-cs-text-muted">Reason for visit:</span> {row.purpose}
        </p>
      </div>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-cs-accent hover:underline"
      >
        <Home className="h-4 w-4" aria-hidden />
        Home
      </Link>
    </div>
  );
}
