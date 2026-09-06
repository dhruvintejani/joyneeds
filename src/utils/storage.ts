import type { StateStorage } from "zustand/middleware";

// Storage is optional: private browsing, quota errors and corrupt JSON must not
// prevent browsing. Persist only non-sensitive shopping preferences.
export const safeStorage: StateStorage = {
  getItem(name) {
    try {
      const value = localStorage.getItem(name);
      if (value !== null) JSON.parse(value);
      return value;
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* memory-only */
    }
  },
  removeItem(name) {
    try {
      localStorage.removeItem(name);
    } catch {
      /* unavailable */
    }
  },
};
