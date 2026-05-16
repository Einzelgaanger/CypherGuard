"use client";

import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { PocAuthProvider } from "./poc-auth-context";
import { PocStoreProvider } from "./poc-store";

export function PocProviders({ children }: { children: ReactNode }) {
  return (
    <PocAuthProvider>
      <PocStoreProvider>
        {children}
        <Toaster richColors position="top-center" theme="light" className="sm:!top-4" />
      </PocStoreProvider>
    </PocAuthProvider>
  );
}
