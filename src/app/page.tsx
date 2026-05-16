import Link from "next/link";
import { Home, Shield, Flower2 } from "lucide-react";
import { PocEnterAsRole } from "@/poc/ui/poc-home-enter";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cs-base text-cs-text-primary homestead-pattern">
      <header className="relative z-10 flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg shadow-sky-300/50 ring-2 ring-white/80 transition hover:scale-105 hover:shadow-xl"
            aria-hidden
          >
            <Home className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              <span className="text-cs-text-primary">Cypher</span>
              <span className="text-cs-accent">Sec</span>
            </p>
            <p className="text-xs text-cs-text-secondary">Digital visitor management for gated estates</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm sm:justify-end">
          <PocEnterAsRole
            role="guard"
            ariaLabel="Open gate desk demo"
            className="rounded-full border border-cs-line bg-white px-4 py-2.5 font-semibold text-cs-text-secondary shadow-sm transition duration-200 ease-out-expo hover:border-sky-300 hover:bg-sky-50 hover:text-cs-accent hover:shadow-md"
          >
            Gate desk
          </PocEnterAsRole>
          <PocEnterAsRole
            role="tenant"
            ariaLabel="Open resident home demo"
            className="rounded-full border border-cs-line bg-white px-4 py-2.5 font-semibold text-cs-text-secondary shadow-sm transition duration-200 ease-out-expo hover:border-sky-300 hover:bg-sky-50 hover:text-cs-accent hover:shadow-md"
          >
            My home
          </PocEnterAsRole>
          <PocEnterAsRole
            role="admin"
            ariaLabel="Open community office demo"
            className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-sky-300/40 transition hover:brightness-110 hover:shadow-xl active:scale-[0.98]"
          >
            Office
          </PocEnterAsRole>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-4 text-center sm:px-8 sm:pt-10 lg:pt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cs-accent">Neighbourhood visitor book</p>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-cs-text-primary sm:text-5xl lg:text-6xl">
          Your community,
          <br />
          <span className="text-cs-accent">welcoming</span> at the door
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cs-text-secondary sm:text-lg">
          A gentle way for residents to expect guests, for guards to recognise faces, and for everyone to feel at home.
        </p>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <PocEnterAsRole
            role="tenant"
            ariaLabel="Enter resident home experience"
            className="group flex flex-col rounded-3xl border border-cs-line bg-white p-8 text-left shadow-md transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/60 motion-reduce:hover:translate-y-0"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-600 shadow-inner ring-1 ring-sky-200/60">
              <Flower2 className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="font-display text-xl font-semibold text-cs-text-primary">Resident home</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-cs-text-secondary">
              Pre-register guests, share a friendly invite, and see who is expected at your door.
            </p>
            <span className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg transition group-hover:brightness-110">
              Step inside →
            </span>
          </PocEnterAsRole>

          <PocEnterAsRole
            role="guard"
            ariaLabel="Enter gate desk experience"
            className="group flex flex-col rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 text-left shadow-md transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl motion-reduce:hover:translate-y-0 sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <Shield className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="font-display text-xl font-semibold text-emerald-950">Gate & lobby</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-cs-text-secondary">
              Check visitors in with calm, clear lists — arrivals, parking notes, and gentle alerts.
            </p>
            <span className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 py-3 text-sm font-semibold text-white group-hover:bg-emerald-800">
              Open gate view →
            </span>
          </PocEnterAsRole>

          <PocEnterAsRole
            role="admin"
            ariaLabel="Enter community office experience"
            className="group flex flex-col rounded-3xl border border-cs-line bg-white p-8 text-left shadow-md transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl motion-reduce:hover:translate-y-0 sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 ring-1 ring-indigo-200/70">
              <Home className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="font-display text-xl font-semibold text-cs-text-primary">Community office</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-cs-text-secondary">
              Households, rosters, and neighbourhood rhythm — all in one cosy dashboard.
            </p>
            <span className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border-2 border-cs-accent/40 bg-cs-elevated py-3 text-sm font-semibold text-cs-accent group-hover:bg-orange-50">
              Open office →
            </span>
          </PocEnterAsRole>
        </div>

        <div className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-cs-text-secondary">
          <span>Neighbour-aware lists</span>
          <span className="hidden text-cs-line sm:inline">·</span>
          <span>Soft alerts for hosts</span>
          <span className="hidden text-cs-line sm:inline">·</span>
          <span>Works on phones & tablets</span>
        </div>
      </main>

      <footer className="relative z-10 border-t border-cs-line bg-cs-surface/80 px-5 py-6 text-center text-xs text-cs-text-muted backdrop-blur-sm">
        CypherSec · demo data only ·{" "}
        <Link href="/visitor-portal" className="font-medium text-cs-accent hover:underline">
          Visitor welcome screen
        </Link>
      </footer>
    </div>
  );
}
