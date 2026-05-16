"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signInAsRole } = usePocAuth();
  const redirect = searchParams.get("redirect");
  const roleParam = searchParams.get("role") as (typeof tabs)[number]["id"] | null;
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>(
    roleParam && ["admin", "tenant", "guard"].includes(roleParam) ? roleParam : "tenant",
  );

  const safeRedirect =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;

  const handleEnter = () => {
    signInAsRole(tab);
    router.push(safeRedirect ?? defaultDest(tab));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cs-base px-4 py-10 homestead-pattern">
      <div className="w-full max-w-[440px] rounded-3xl border border-cs-line bg-cs-surface p-8 shadow-lg sm:p-10">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cs-accent-dim text-cs-accent">
            <Home className="h-6 w-6" aria-hidden />
          </div>
          <p className="font-display text-2xl font-bold text-cs-text-primary">
            Cypher<span className="text-cs-accent">Sec</span>
          </p>
          <p className="mt-1 text-xs text-cs-text-muted">Demo — pick a role, no password</p>
        </div>

        <div className="mt-8 flex rounded-2xl bg-cs-elevated p-1 ring-1 ring-cs-line/80">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "min-h-[44px] flex-1 rounded-xl py-2.5 text-[13px] font-semibold transition-colors",
                tab === t.id ? "bg-cs-surface text-cs-accent shadow-sm" : "text-cs-text-secondary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-cs-text-secondary">
          We&apos;ll open the right view for phones, tablets, and desktops.
        </p>

        <button
          type="button"
          onClick={handleEnter}
          className="mt-6 w-full min-h-[48px] rounded-2xl bg-cs-accent py-3 text-sm font-semibold text-white shadow-md hover:brightness-105"
        >
          Continue as {tabs.find((t) => t.id === tab)?.label} →
        </button>

        <p className="mt-6 text-center text-xs text-cs-text-muted">
          <Link href="/" className="font-medium text-cs-accent hover:underline">
            ← Back home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cs-base p-8 text-cs-text-muted">
          Loading…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
