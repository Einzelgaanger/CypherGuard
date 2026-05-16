"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  CsAuthCard,
  CsBackHomeLink,
  CsBrandHeader,
  CsSegmentedTabs,
  CsStandaloneShell,
} from "@/components/ui/cs-standalone-shell";
import { usePocAuth } from "@/poc/poc-auth-context";

const tabs = [
  { id: "admin", label: "Office" },
  { id: "tenant", label: "Resident" },
  { id: "guard", label: "Gate" },
] as const;

function defaultDest(role: (typeof tabs)[number]["id"]) {
  if (role === "admin") return "/admin";
  if (role === "tenant") return "/tenant";
  return "/guard";
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInAsRole } = usePocAuth();
  const redirect = searchParams.get("redirect");
  const roleParam = searchParams.get("role") as (typeof tabs)[number]["id"] | null;
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>(
    roleParam && ["admin", "tenant", "guard"].includes(roleParam) ? roleParam : "tenant",
  );

  const safeRedirect =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;

  const dest = safeRedirect ?? defaultDest(tab);

  const handleEnter = () => {
    signInAsRole(tab);
    router.push(dest);
  };

  return (
    <CsStandaloneShell>
      <CsAuthCard>
        <CsBrandHeader subtitle="Select your role to continue" />

        <CsSegmentedTabs
          className="mt-8"
          options={[...tabs]}
          value={tab}
          onChange={setTab}
        />

        <p className="mt-6 text-center text-sm leading-relaxed text-cs-text-secondary">
          We&apos;ll open the right view for phones, tablets, and desktops.
        </p>

        <button type="button" onClick={handleEnter} className="cs-btn-accent mt-6 w-full min-h-[48px] rounded-2xl">
          Continue as {tabs.find((t) => t.id === tab)?.label} →
        </button>

        <CsBackHomeLink className="mt-6" />
      </CsAuthCard>
    </CsStandaloneShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <CsStandaloneShell>
          <p className="text-center text-sm text-cs-text-muted">Loading…</p>
        </CsStandaloneShell>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
