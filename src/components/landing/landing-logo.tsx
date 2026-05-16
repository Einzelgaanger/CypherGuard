export function LandingLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-10 w-10 shrink-0 ${className}`} aria-hidden>
      <span className="absolute left-0 top-1 h-7 w-7 rounded-full bg-[var(--landing-ink)]" />
      <span className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[var(--landing-green)] ring-2 ring-[var(--landing-bg)]" />
    </span>
  );
}
