import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be full or unavailable (e.g. private browsing) — fail silently.
    }
  }, [key, value]);

  // Keeps this piece of state in sync if the same key changes in another
  // browser tab (e.g. an NGO dashboard open in one tab, a provider dashboard
  // open in another).
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== key) return;
      try {
        setValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
      } catch {
        setValue(initialValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, initialValue]);

  return [value, setValue];
}
