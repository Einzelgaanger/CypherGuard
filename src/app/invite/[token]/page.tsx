"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import {
  CsAuthCard,
  CsBrandHeader,
  CsStandaloneShell,
} from "@/components/ui/cs-standalone-shell";
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
      <CsStandaloneShell maxWidth="480px">
        <CsAuthCard className="text-center">
          <CsBrandHeader title="We couldn't find that invite" />
          <p className="mt-2 text-sm leading-relaxed text-cs-text-secondary">
            Ask your host to resend the link — typos happen, especially on small screens.
          </p>
          <Link href="/" className="cs-btn-accent mt-8 inline-flex min-h-[48px] items-center justify-center rounded-2xl px-8">
            Back to CypherSec home
          </Link>
        </CsAuthCard>
      </CsStandaloneShell>
    );
  }

  return (
    <CsStandaloneShell maxWidth="520px">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cs-accent">Expected guest</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-cs-text-primary sm:text-4xl">{estate.name}</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-cs-text-secondary sm:text-lg">
          Show this screen to the gate — they&apos;ll match you with the home you&apos;re visiting.
        </p>
      </div>
      <CsAuthCard className="mt-8 text-left text-sm">
        <p>
          <span className="text-cs-text-muted">Guest:</span>{" "}
          <span className="font-semibold text-cs-text-primary">{row.name}</span>
        </p>
        <p className="mt-3">
          <span className="text-cs-text-muted">Visiting:</span>{" "}
          <span className="font-medium text-cs-text-primary">Unit {row.unit}</span>
        </p>
        <p className="mt-3">
          <span className="text-cs-text-muted">Reason for visit:</span>{" "}
          <span className="text-cs-text-primary">{row.purpose}</span>
        </p>
      </CsAuthCard>
      <Link
        href="/"
        className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-cs-accent hover:underline"
      >
        <Home className="h-4 w-4" aria-hidden />
        Home
      </Link>
    </CsStandaloneShell>
  );
}
