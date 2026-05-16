"use client";

import { useEffect, useState, type ReactNode } from "react";

export function PocDesktopOnly({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const fn = () => setOk(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  if (!ok) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cs-base px-6 text-center">
        <div className="max-w-md rounded-xl border border-cs-line bg-cs-surface p-8">
          <p className="font-display text-lg font-semibold text-cs-text-primary">
            Please use a desktop browser
          </p>
          <p className="mt-2 text-sm text-cs-text-secondary">
            Dashboards are optimised for screens 1024px and wider (per UI spec).
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
