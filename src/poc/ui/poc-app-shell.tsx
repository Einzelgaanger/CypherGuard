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
    <ul className="flex flex-col gap-1">
      {nav.map((item) => {
        const isRootDashboard =
          item.href === "/guard" || item.href === "/admin" || item.href === "/tenant";
        const isActive = isRootDashboard
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-all duration-150",
                "focus-visible:ring-2 focus-visible:ring-cs-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cs-surface",
                isActive
                  ? "bg-cs-accent text-white shadow-md shadow-[0_8px_20px_-8px_rgba(42,157,85,0.35)]"
                  : "text-cs-text-secondary hover:bg-cs-hover hover:text-cs-text-primary",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-white" : "text-cs-text-muted group-hover:text-cs-accent",
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-cs-red text-white",
                  )}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBrand({
  estateName,
  roleBadge,
  badgeClassName,
}: {
  estateName: string;
  roleBadge: string;
  badgeClassName: string;
}) {
  return (
    <div className="shrink-0 border-b border-cs-line px-5 pb-5 pt-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-cs-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cs-surface"
        aria-label="CypherSec home"
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--card-dark)] text-sm font-bold text-white shadow-md ring-2 ring-white">
          <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-cs-accent" aria-hidden />
          <span className="relative z-[1]">CS</span>
        </span>
        <span>
          <span className="block font-display text-lg font-bold leading-tight tracking-tight text-cs-text-primary">
            Cypher<span className="text-cs-accent">Sec</span>
          </span>
          <span className="block text-xs font-medium text-cs-text-muted">{estateName}</span>
        </span>
      </Link>
      <span
        className={cn(
          "mt-4 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
          badgeClassName,
        )}
      >
        {roleBadge}
      </span>
    </div>
  );
}

function SidebarUserFooter({
  user,
  onLogout,
}: {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}) {
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="shrink-0 border-t border-cs-line bg-cs-elevated/40 p-4">
      <div className="mb-3 flex items-center gap-3 rounded-xl bg-cs-surface p-3 ring-1 ring-cs-line">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cs-accent-pale text-sm font-bold text-cs-accent ring-2 ring-white"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-cs-text-primary">{user?.name}</p>
          <p className="truncate text-xs text-cs-text-muted">{user?.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-cs-line bg-cs-surface text-sm font-semibold text-cs-text-secondary shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-cs-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cs-accent focus-visible:ring-offset-2"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden />
        Log out
      </button>
    </div>
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
  const [clientReady, setClientReady] = useState(false);

  const required = requiredRoleForPath(pathname);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const mustSignIn = clientReady && Boolean(required && !user);
  const mustSwitchRole = clientReady && Boolean(required && user && user.role !== required);
  const gateActive = mustSignIn || mustSwitchRole;

  useLayoutEffect(() => {
    if (!clientReady || !gateActive) return;
    if (mustSignIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user && mustSwitchRole) {
      router.replace(homeForRole(user.role));
    }
  }, [clientReady, gateActive, mustSignIn, mustSwitchRole, pathname, router, user]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useLayoutEffect(() => {
    if (!clientReady || gateActive) return;
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [clientReady, gateActive]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!clientReady) {
    return (
      <div
        className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-cs-base px-4"
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <p className="text-sm font-medium text-cs-text-secondary">Loading…</p>
      </div>
    );
  }

  if (gateActive) {
    const signInHref = `/login?redirect=${encodeURIComponent(pathname)}`;
    const homeHref = user ? homeForRole(user.role) : "/";
    return (
      <div className="relative flex min-h-screen min-h-[100dvh] items-center justify-center bg-cs-base px-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-cs-accent-pale opacity-70 blur-3xl" />
        </div>
        <div
          className="relative z-10 w-full max-w-md rounded-3xl border border-cs-line bg-cs-surface px-8 py-8 shadow-[0_24px_80px_-24px_rgba(20,24,22,0.1)] ring-1 ring-black/[0.04]"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-cs-text-primary">
            {mustSignIn ? "Sign in required" : "Wrong profile for this area"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-cs-text-secondary">
            {mustSignIn
              ? "Sign in on the next screen to continue."
              : "You are signed in with a different profile. Open your dashboard instead."}
          </p>
          <Link
            href={mustSignIn ? signInHref : homeHref}
            className="cs-btn-accent mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm"
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
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-cs-base text-cs-text-primary">
      {emergencyBanner ? (
        <div
          className="relative z-50 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm"
          role="alert"
        >
          <span className="min-w-0 flex-1">Estate-wide notice — please acknowledge.</span>
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

      <header className="z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-cs-line bg-cs-surface px-3 shadow-sm lg:hidden">
        <button
          type="button"
          className="touch-target inline-flex items-center justify-center rounded-xl border border-cs-line bg-white text-cs-text-primary shadow-sm transition hover:border-cs-accent/40 hover:bg-cs-hover active:scale-95"
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cs-accent-pale text-xs font-bold text-cs-accent shadow-inner ring-2 ring-white">
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

      <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside
          className={cn(
            "flex h-full min-h-0 w-[272px] max-w-[88vw] flex-col bg-cs-surface",
            "border-r border-cs-line",
            "max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:z-50 max-lg:shadow-2xl",
            "max-lg:transition-transform max-lg:duration-300 max-lg:ease-out-expo motion-reduce:max-lg:transition-none",
            emergencyBanner ? "max-lg:top-[7rem]" : "max-lg:top-14",
            mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
            "lg:relative lg:translate-x-0",
          )}
          aria-label="Main navigation"
        >
          <div className="flex h-full min-h-0 flex-col">
            <SidebarBrand estateName={estate.name} roleBadge={roleBadge} badgeClassName={badgeClassName} />

            <nav className="min-h-0 flex-1 px-4 py-5 max-lg:overflow-y-auto lg:overflow-visible">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-cs-text-muted">Menu</p>
              <NavLinks nav={nav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </nav>

            <SidebarUserFooter user={user} onLogout={handleLogout} />
          </div>
        </aside>

        <main className="min-h-0 min-w-0 overflow-y-auto overscroll-y-contain bg-cs-base">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
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
