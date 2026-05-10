import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Studio gate — a single shared-password screen.
 *
 * No Supabase auth, no magic links, no per-user accounts.
 * Just one password (set in env as VITE_STUDIO_PASSWORD).
 * Once entered correctly, persists in sessionStorage for the browser session.
 *
 * The password gate doesn't actually secure data on its own —
 * the real protection is that the URL `/studio` isn't linked publicly.
 * The password adds a second layer: even if someone finds the URL,
 * they can't edit without it.
 */

const PASSWORD = import.meta.env.VITE_STUDIO_PASSWORD || '';
const STORAGE_KEY = 'studio_unlocked';

const StudioContext = createContext({ unlocked: false, unlock: () => false });

export function StudioProvider({ children }) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        setUnlocked(true);
      }
    } catch (_) {}
  }, []);

  function unlock(input) {
    if (!PASSWORD) {
      // No password configured — let everyone through (e.g. local dev)
      setUnlocked(true);
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
      return true;
    }
    if (input === PASSWORD) {
      setUnlocked(true);
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
      return true;
    }
    return false;
  }

  function lock() {
    setUnlocked(false);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  return (
    <StudioContext.Provider value={{ unlocked, unlock, lock, hasPassword: !!PASSWORD }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  return useContext(StudioContext);
}
