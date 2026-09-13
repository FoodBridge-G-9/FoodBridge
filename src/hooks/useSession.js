import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../utils/storage";

function readSession() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.session);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Session lives as real React state here (lifted up in App.jsx) instead of
// being re-read from localStorage inside every component that needs it.
// login/logout flow down to children as props ("prop drilling") rather than
// through Context, since Context API is covered later in the course than
// Project Based Evaluation-I.
export function useSession() {
  const [session, setSession] = useState(readSession);

  // Keeps session in sync if it changes in another browser tab.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEYS.session) {
        setSession(readSession());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback((account) => {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(account));
    setSession(account);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setSession(null);
  }, []);

  return { session, login, logout };
}
