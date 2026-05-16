import type { PocRole, SessionUser } from "./types";

export const POC_SESSION_STORAGE_KEY = "cyphersec_poc_session";

/** Same-tab updates (localStorage does not fire `storage` in the active window). */
export const POC_SESSION_CHANGED_EVENT = "cyphersec-poc-session-changed";

export const notifyPocSessionChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(POC_SESSION_CHANGED_EVENT));
};

export const SESSION_BY_ROLE: Record<PocRole, SessionUser> = {
  admin: {
    email: "admin@cyphersec.io",
    role: "admin",
    name: "Elena Briggs",
  },
  tenant: {
    email: "tenant.4a@cyphersec.io",
    role: "tenant",
    name: "Sarah Muthoni",
    unit: "4A",
  },
  guard: {
    email: "guard@cyphersec.io",
    role: "guard",
    name: "Daniel Kamau",
    badge: "G-02",
  },
};

export const readPocSessionFromStorage = (): SessionUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(POC_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    const role = parsed?.role;
    if (!role || !SESSION_BY_ROLE[role]) return null;
    return { ...SESSION_BY_ROLE[role] };
  } catch {
    return null;
  }
};

export const writePocSessionToStorage = (user: SessionUser) => {
  localStorage.setItem(POC_SESSION_STORAGE_KEY, JSON.stringify(user));
  notifyPocSessionChanged();
};

export const clearPocSessionFromStorage = () => {
  localStorage.removeItem(POC_SESSION_STORAGE_KEY);
  notifyPocSessionChanged();
};
