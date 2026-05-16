"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePocAuth } from "@/poc/poc-auth-context";
import type { PocRole } from "@/poc/types";
import { usePocStore } from "@/poc/poc-store";

export type ShellNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

type PocAppShellProps = {
  roleBadge: string;
  badgeClassName: string;
  nav: ShellNavItem[];
  children: ReactNode;
};

function requiredRoleForPath(pathname: string): PocRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/tenant")) return "tenant";
  if (pathname.startsWith("/guard")) return "guard";
  return null;
}

function homeForRole(role: PocRole) {
  if (role === "admin") return "/admin";
  if (role === "tenant") return "/tenant";
  return "/guard";
}

function NavLinks({
  nav,
  pathname,
  onNavigate,
}: {
  nav: ShellNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {nav.map((item, index) => {
        const active =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            style={{ animationDelay: `${index * 35}ms` }}
            className={cn(
              "group flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-all duration-200 ease-out-expo",
              "animate-slide-in-left motion-reduce:animate-none",
              "focus-visible:ring-2 focus-visible:ring-cs-accent focus-visible:ring-offset-2",
              active
                ? "bg-sky-50 text-cs-accent shadow-sm ring-1 ring-sky-200/80"
                : "text-cs-text-secondary hover:bg-cs-hover hover:text-cs-text-primary hover:shadow-sm active:scale-[0.98]",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
                active
                  ? "border-sky-200 bg-white text-cs-accent shadow-sm"
                  : "border-transparent bg-cs-elevated text-cs-text-muted group-hover:border-cs-line group-hover:bg-white group-hover:text-cs-accent",
              )}
            >
              <Icon className="h-[1.125rem] w-[1.125rem] transition-transform duration-200 group-hover:scale-110" aria-hidden />
            </span>
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 ? (
              <span className="rounded-full bg-cs-red px-2 py-0.5 text-[11px] font-bold text-white shadow-sm transition-transform group-hover:scale-105">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}

export function PocAppShell({
  roleBadge,
  badgeClassName,
  nav,
  children,
}: PocAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = usePocAuth();
  const { estate, emergencyBanner, clearEmergency } = usePocStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const required = requiredRoleForPath(pathname);
  const mobileAsideTop = emergencyBanner ? "top-[7rem]" : "top-14";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const mustSignIn = Boolean(required && !user);
  const mustSwitchRole = Boolean(required && user && user.role !== required);
  const gateActive = mustSignIn || mustSwitchRole;

  useLayoutEffect(() => {
    if (!gateActive) return;
    if (mustSignIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user && mustSwitchRole) {
      router.replace(homeForRole(user.role));
    }
  }, [gateActive, mustSignIn, mustSwitchRole, pathname, router, user]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (gateActive) {
    const signInHref = `/login?redirect=${encodeURIComponent(pathname)}`;
    const homeHref = user ? homeForRole(user.role) : "/";
    return (
      <div className="flex min-h-screen items-center justify-center bg-cs-base px-4">
        <div
          className="max-w-md rounded-2xl border border-cs-line bg-cs-surface px-6 py-6 shadow-lg"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-cs-text-primary">
            {mustSignIn ? "Sign in required" : "Wrong profile for this area"}
          </p>
          <p className="mt-2 text-sm text-cs-text-secondary">
            {mustSignIn
              ? "Choose a demo role on the next screen to continue."
              : "You are signed in with a different demo role. Open your dashboard instead."}
          </p>
          <Link
            href={mustSignIn ? signInHref : homeHref}
            className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-cs-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-cs-accent focus-visible:ring-offset-2"
            tabIndex={0}
            aria-label={mustSignIn ? "Go to sign in" : "Go to my dashboard"}
          >
            {mustSignIn ? "Continue to sign in" : "Open my dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-cs-base text-cs-text-primary">
      {emergencyBanner ? (
        <div
          className="relative z-50 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm"
          role="alert"
        >
          <span className="min-w-0 flex-1">Estate-wide notice (demo) — please acknowledge.</span>
          <button
            type="button"
            onClick={clearEmergency}
            className="touch-target shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-amber-950 shadow-sm ring-1 ring-amber-200/80 transition hover:bg-amber-100"
            aria-label="Dismiss notice"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-cs-line bg-cs-surface/90 px-3 shadow-sm backdrop-blur-md lg:hidden">
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-xl border border-cs-line bg-white text-cs-text-primary shadow-sm transition hover:border-sky-300 hover:bg-sky-50 active:scale-95"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-display text-base font-bold tracking-tight text-cs-text-primary">
            Cypher<span className="text-cs-accent">Sec</span>
          </p>
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-cs-text-muted">
            {roleBadge}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-xs font-bold text-cs-accent shadow-inner ring-2 ring-white">
          {user?.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
      </header>

      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-[45] bg-slate-900/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 ease-out-expo lg:hidden",
          mobileOpen && "pointer-events-auto opacity-100",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className="absolute inset-0 cursor-default"
          tabIndex={-1}
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={cn(
            "flex w-64 max-w-[85vw] shrink-0 flex-col border-cs-line bg-cs-surface transition-transform duration-300 ease-out-expo motion-reduce:transition-none",
            "shadow-[4px_0_32px_-12px_rgba(15,23,42,0.12)]",
            "fixed bottom-0 left-0 z-[50] border-r lg:relative lg:z-auto lg:max-w-none lg:translate-x-0 lg:shadow-md",
            mobileAsideTop,
            "lg:top-auto lg:h-auto lg:min-h-0 lg:self-stretch",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="hidden shrink-0 border-b border-cs-line bg-gradient-to-b from-sky-50/50 to-transparent px-4 pb-5 pt-5 lg:block">
            <Link
              href="/"
              className="font-display text-xl font-bold tracking-tight text-cs-text-primary transition hover:text-cs-accent"
            >
              Cypher<span className="text-cs-accent">Sec</span>
            </Link>
            <p className="mt-1 text-xs font-medium text-cs-text-secondary">{estate.name}</p>
            <span
              className={cn(
                "mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-black/5",
                badgeClassName,
              )}
            >
              {roleBadge}
            </span>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-3 py-3 smooth-scroll lg:px-2 lg:pb-2">
            <div className="mb-2 shrink-0 border-b border-cs-line pb-3 lg:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cs-text-muted">Signed in</p>
              <p className="truncate font-semibold text-cs-text-primary">{user?.name}</p>
              <p className="truncate text-xs text-cs-text-secondary">{user?.email}</p>
            </div>
            <NavLinks nav={nav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </nav>

          <div className="mt-auto shrink-0 border-t border-cs-line bg-cs-elevated/50 p-3">
            <div className="mb-2 hidden items-center gap-3 rounded-xl px-2 py-2 lg:flex">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-xs font-bold text-cs-accent shadow-inner ring-2 ring-white">
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-cs-text-primary">{user?.name}</p>
                <p className="truncate text-xs text-cs-text-muted">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border border-transparent bg-white py-2.5 text-sm font-semibold text-cs-text-secondary shadow-sm transition hover:border-cs-line hover:text-cs-text-primary hover:shadow active:scale-[0.99]"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <main className="mx-auto min-h-0 w-full max-w-[1280px] flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function PocPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { estate } = usePocStore();
  const day = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <header className="mb-6 flex flex-col gap-1 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-cs-text-primary sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm font-medium text-cs-text-secondary">{subtitle ?? `${estate.name} · ${day}`}</p>
      </div>
    </header>
  );
}
