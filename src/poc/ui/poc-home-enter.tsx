"use client";

import { useRouter } from "next/navigation";
import { useCallback, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePocAuth } from "@/poc/poc-auth-context";
import type { PocRole } from "@/poc/types";

const defaultPathForRole = (role: PocRole) => {
  if (role === "admin") return "/admin";
  if (role === "tenant") return "/tenant";
  return "/guard";
};

type PocEnterAsRoleProps = {
  role: PocRole;
  className: string;
  children: ReactNode;
  ariaLabel: string;
};

export function PocEnterAsRole({ role, className, children, ariaLabel }: PocEnterAsRoleProps) {
  const router = useRouter();
  const { signInAsRole } = usePocAuth();

  const handleActivate = useCallback(() => {
    signInAsRole(role);
    router.push(defaultPathForRole(role));
  }, [role, router, signInAsRole]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      }
    },
    [handleActivate],
  );

  return (
    <span
      role="button"
      tabIndex={0}
      className={cn(
        "cursor-pointer select-none outline-none transition-all duration-200 ease-out-expo",
        "focus-visible:ring-2 focus-visible:ring-cs-accent focus-visible:ring-offset-2 active:scale-[0.98]",
        className,
      )}
      aria-label={ariaLabel}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      {children}
    </span>
  );
}
