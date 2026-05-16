"use client";

import Link from "next/link";
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
  /** Header pills use a native button; cards use a link wrapper for valid block markup. */
  variant?: "pill" | "panel";
};

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-cs-accent focus-visible:ring-offset-2 active:scale-[0.98]";

export function PocEnterAsRole({
  role,
  className,
  children,
  ariaLabel,
  variant = "panel",
}: PocEnterAsRoleProps) {
  const router = useRouter();
  const { signInAsRole } = usePocAuth();
  const href = defaultPathForRole(role);

  const go = useCallback(() => {
    signInAsRole(role);
    router.push(href);
  }, [href, role, router, signInAsRole]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    },
    [go],
  );

  if (variant === "pill") {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 font-inherit",
          "select-none outline-none transition-all duration-200 ease-out-expo",
          focusRing,
          className,
        )}
        onClick={go}
        onKeyDown={handleKeyDown}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "block cursor-pointer select-none no-underline outline-none transition-all duration-200 ease-out-expo",
        focusRing,
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        go();
      }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </Link>
  );
}
