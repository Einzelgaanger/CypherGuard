"use client";

import Link from "next/link";
import { ArrowRight, Flower2, Home, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { LandingHeroMockup } from "@/components/landing/landing-hero-mockup";
import { LandingLogo } from "@/components/landing/landing-logo";
import { PocEnterAsRole } from "@/poc/ui/poc-home-enter";
import { cn } from "@/lib/utils";

const navLinkClass =
  "text-sm font-medium text-[var(--landing-muted)] transition-colors hover:text-[var(--landing-ink)]";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[var(--landing-green)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(42,157,85,0.45)] transition hover:bg-[var(--landing-green-hover)]";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing-archviz min-h-screen overflow-x-hidden">
      <header className="relative z-30">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-6 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-green)] focus-visible:ring-offset-2"
            aria-label="CypherSec home"
          >
            <LandingLogo />
            <span className="font-display text-lg font-bold tracking-tight text-[var(--landing-ink)]">
              CYPHER<span className="text-[var(--landing-green)]">SEC</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
            <Link href="/" className={navLinkClass}>
              Home
            </Link>
            <PocEnterAsRole
              variant="pill"
              role="guard"
              ariaLabel="Open gate desk"
              className={cn(navLinkClass, "border-0 bg-transparent p-0 shadow-none")}
            >
              Gate desk
            </PocEnterAsRole>
            <PocEnterAsRole
              variant="pill"
              role="tenant"
              ariaLabel="Open resident home"
              className={cn(navLinkClass, "border-0 bg-transparent p-0 shadow-none")}
            >
              My home
            </PocEnterAsRole>
            <Link href="/visitor-portal" className={navLinkClass}>
              Visitor welcome screen
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className={cn(navLinkClass, "hidden sm:inline-flex")}>
              Login
            </Link>
            <Link href="/register" className={cn(btnPrimary, "hidden px-6 py-2.5 sm:inline-flex")}>
              Register
            </Link>
            <PocEnterAsRole
              variant="pill"
              role="admin"
              ariaLabel="Open community office"
              className={cn(navLinkClass, "hidden border-0 bg-transparent p-0 shadow-none md:inline-flex")}
            >
              Office
            </PocEnterAsRole>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--landing-ink)] lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t border-[var(--landing-green-pale)] px-6 py-4 lg:hidden" aria-label="Mobile menu">
            <ul className="flex flex-col gap-1 text-sm font-medium text-[var(--landing-ink)]">
              <li>
                <Link href="/" className="block rounded-xl px-3 py-2.5 hover:bg-white/80" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <PocEnterAsRole
                  variant="pill"
                  role="guard"
                  ariaLabel="Open gate desk"
                  className="w-full justify-start rounded-xl border-0 bg-transparent px-3 py-2.5 text-left shadow-none hover:bg-white/80"
                >
                  Gate desk
                </PocEnterAsRole>
              </li>
              <li>
                <PocEnterAsRole
                  variant="pill"
                  role="tenant"
                  ariaLabel="Open resident home"
                  className="w-full justify-start rounded-xl border-0 bg-transparent px-3 py-2.5 text-left shadow-none hover:bg-white/80"
                >
                  My home
                </PocEnterAsRole>
              </li>
              <li>
                <PocEnterAsRole
                  variant="pill"
                  role="admin"
                  ariaLabel="Open community office"
                  className="w-full justify-start rounded-xl border-0 bg-transparent px-3 py-2.5 text-left shadow-none hover:bg-white/80"
                >
                  Office
                </PocEnterAsRole>
              </li>
              <li>
                <Link
                  href="/visitor-portal"
                  className="block rounded-xl px-3 py-2.5 hover:bg-white/80"
                  onClick={() => setMenuOpen(false)}
                >
                  Visitor welcome screen
                </Link>
              </li>
              <li className="mt-3 flex gap-2 border-t border-[var(--landing-green-pale)] pt-3">
                <Link
                  href="/login"
                  className="flex-1 rounded-full border border-[var(--landing-green-pale)] bg-white py-2.5 text-center font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link href="/register" className={cn(btnPrimary, "flex-1 py-2.5")} onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>

      <section className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6 lg:px-10 lg:pb-28 lg:pt-8">
        <div className="relative z-10 max-w-xl">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--landing-green-soft)]">
            <span className="h-px w-10 bg-[var(--landing-green-soft)]" aria-hidden />
            Neighbourhood visitor book
          </p>

          <h1 className="mt-8 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-[var(--landing-ink)] sm:text-5xl lg:text-[3.35rem]">
            Your community,
            <br />
            welcoming at the door
            <span className="text-[var(--landing-green)]">.</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--landing-muted)] sm:text-[1.05rem]">
            A gentle way for residents to expect guests, for guards to recognise faces, and for everyone to feel at
            home.
          </p>

          <PocEnterAsRole
            role="guard"
            ariaLabel="Enter gate desk experience"
            className={cn(btnPrimary, "group mt-9 min-h-[52px] px-8")}
          >
            Open gate view
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </PocEnterAsRole>

          <div className="mt-12 flex flex-wrap items-end gap-5 sm:gap-8">
            <div className="rounded-2xl bg-[var(--landing-card-dark)] px-6 py-5 text-white shadow-[0_20px_50px_-20px_rgba(20,24,22,0.4)]">
              <p className="text-xs font-medium text-white/60">Built for</p>
              <p className="mt-1 font-display text-3xl font-bold leading-none sm:text-4xl">Neighbour-aware</p>
              <p className="mt-1 text-sm font-medium text-white/75">lists</p>
            </div>
            <div className="rounded-2xl bg-white px-6 py-5 shadow-[0_16px_40px_-20px_rgba(20,24,22,0.1)] ring-1 ring-black/[0.04]">
              <p className="text-xs font-medium text-[var(--landing-muted)]">Every visit</p>
              <p className="mt-1 font-display text-3xl font-bold leading-none text-[var(--landing-ink)] sm:text-4xl">
                Soft alerts
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--landing-muted)]">for hosts</p>
            </div>
          </div>
        </div>

        <LandingHeroMockup />
      </section>

      <section id="roles" className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-10" aria-labelledby="roles-heading">
        <h2 id="roles-heading" className="sr-only">
          Choose your experience
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PocEnterAsRole
            role="tenant"
            ariaLabel="Enter resident home experience"
            className="group flex flex-col rounded-3xl bg-white p-8 text-left shadow-[0_16px_48px_-24px_rgba(20,24,22,0.12)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
          >
            <div
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--landing-green)]"
              style={{ backgroundColor: "var(--landing-green-pale)" }}
            >
              <Flower2 className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-xl font-semibold text-[var(--landing-ink)]">Resident home</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--landing-muted)]">
              Pre-register guests, share a friendly invite, and see who is expected at your door.
            </p>
            <span className={cn(btnPrimary, "mt-8 w-full py-3")}>Step inside →</span>
          </PocEnterAsRole>

          <PocEnterAsRole
            role="guard"
            ariaLabel="Enter gate desk experience"
            className={cn(
              "group flex flex-col rounded-3xl bg-white p-8 text-left shadow-[0_16px_48px_-24px_rgba(20,24,22,0.12)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
              "sm:col-span-2 lg:col-span-1",
            )}
          >
            <div
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--landing-green)]"
              style={{ backgroundColor: "var(--landing-green-pale)" }}
            >
              <Shield className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-xl font-semibold text-[var(--landing-ink)]">Gate & lobby</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--landing-muted)]">
              Check visitors in with calm, clear lists — arrivals, parking notes, and gentle alerts.
            </p>
            <span className={cn(btnPrimary, "mt-8 w-full py-3")}>Open gate view →</span>
          </PocEnterAsRole>

          <PocEnterAsRole
            role="admin"
            ariaLabel="Enter community office experience"
            className={cn(
              "group flex flex-col rounded-3xl bg-white p-8 text-left shadow-[0_16px_48px_-24px_rgba(20,24,22,0.12)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
              "sm:col-span-2 lg:col-span-1",
            )}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef0ee] text-[var(--landing-ink)]">
              <Home className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="font-display text-xl font-semibold text-[var(--landing-ink)]">Community office</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--landing-muted)]">
              Households, rosters, and neighbourhood rhythm — all in one cosy dashboard.
            </p>
            <span className="mt-8 inline-flex w-full items-center justify-center rounded-full border-2 border-[var(--landing-green)]/25 bg-[var(--landing-green-pale)]/40 py-3 text-sm font-semibold text-[var(--landing-green-hover)] transition group-hover:bg-[var(--landing-green-pale)]">
              Open office →
            </span>
          </PocEnterAsRole>
        </div>

        <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[var(--landing-muted)]">
          <span>Neighbour-aware lists</span>
          <span className="hidden text-[var(--landing-green-pale)] sm:inline">·</span>
          <span>Soft alerts for hosts</span>
          <span className="hidden text-[var(--landing-green-pale)] sm:inline">·</span>
          <span>Works on phones & tablets</span>
        </div>
      </section>

      <footer className="border-t border-[var(--landing-green-pale)] px-6 py-8 text-center text-xs text-[var(--landing-muted)]">
        CypherSec Check-In ·{" "}
        <Link href="/visitor-portal" className="font-semibold text-[var(--landing-green)] hover:underline">
          Visitor welcome screen
        </Link>
      </footer>
    </div>
  );
}
