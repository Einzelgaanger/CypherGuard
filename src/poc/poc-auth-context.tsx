"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { PocRole, SessionUser } from "./types";
import {
  POC_SESSION_CHANGED_EVENT,
  POC_SESSION_STORAGE_KEY,
  SESSION_BY_ROLE,
  clearPocSessionFromStorage,
  notifyPocSessionChanged,
  writePocSessionToStorage,
} from "./poc-session-storage";

type PocAuthValue = {
  user: SessionUser | null;
  refresh: () => void;
  logout: () => void;
  signInAsRole: (role: PocRole) => void;
};

const PocAuthContext = createContext<PocAuthValue | null>(null);

const subscribe = (onChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  const handle = () => onChange();
  window.addEventListener(POC_SESSION_CHANGED_EVENT, handle);
  window.addEventListener("storage", handle);
  return () => {
    window.removeEventListener(POC_SESSION_CHANGED_EVENT, handle);
    window.removeEventListener("storage", handle);
  };
};

/** Stable snapshot string so React does not treat every read as a new object identity. */
const getSessionRawSnapshot = (): string => {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(POC_SESSION_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const getServerSessionRawSnapshot = (): string => "";

const parseUserFromRaw = (raw: string): SessionUser | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    const role = parsed?.role;
    if (!role || !SESSION_BY_ROLE[role]) return null;
    return { ...SESSION_BY_ROLE[role] };
  } catch {
    return null;
  }
};

export function PocAuthProvider({ children }: { children: ReactNode }) {
  const rawSession = useSyncExternalStore(
    subscribe,
    getSessionRawSnapshot,
    getServerSessionRawSnapshot,
  );

  const user = useMemo(() => parseUserFromRaw(rawSession), [rawSession]);

  const refresh = useCallback(() => {
    notifyPocSessionChanged();
  }, []);

  const signInAsRole = useCallback((role: PocRole) => {
    writePocSessionToStorage(SESSION_BY_ROLE[role]);
  }, []);

  const logout = useCallback(() => {
    clearPocSessionFromStorage();
    if (typeof window !== "undefined") {
      localStorage.removeItem("dev_user");
    }
  }, []);

  const value = useMemo(
    () => ({ user, refresh, logout, signInAsRole }),
    [user, refresh, logout, signInAsRole],
  );

  return <PocAuthContext.Provider value={value}>{children}</PocAuthContext.Provider>;
}

export function usePocAuth() {
  const ctx = useContext(PocAuthContext);
  if (!ctx) throw new Error("usePocAuth must be used within PocAuthProvider");
  return ctx;
}
