// import { useEffect, useState } from "react";

// export function useLocalStorage(key, initialValue) {
//   const [value, setValue] = useState(() => {
//     try {
//       const saved = localStorage.getItem(key);
//       return saved ? JSON.parse(saved) : initialValue;
//     } catch {
//       return initialValue;
//     }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem(key, JSON.stringify(value));
//     } catch {
//       // Storage may be full or unavailable (e.g. private browsing) — fail silently.
//     }
//   }, [key, value]);

//   // Keeps this piece of state in sync if the same key changes in another
//   // browser tab (e.g. an NGO dashboard open in one tab, a provider dashboard
//   // open in another).
//   useEffect(() => {
//     const handleStorage = (event) => {
//       if (event.key !== key) return;
//       try {
//         setValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
//       } catch {
//         setValue(initialValue);
//       }
//     };
//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, [key, initialValue]);

//   return [value, setValue];
// }

import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalStorage(key, initialValue) {
  // Keep the fallback stable even when a caller passes [] or {} inline.
  const initialValueRef = useRef(initialValue);

  const readValue = useCallback(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
    } catch (error) {
      console.warn(`Could not read localStorage key "${key}".`, error);
    }
    return typeof initialValueRef.current === "function"
      ? initialValueRef.current()
      : initialValueRef.current;
  }, [key]);

  const [value, setValue] = useState(readValue);

  useEffect(() => {
    setValue(readValue());
  }, [readValue]);

  const setAndPersistValue = useCallback(
    (nextValue) => {
      setValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch (error) {
          console.warn(`Could not save localStorage key "${key}".`, error);
        }
        return resolvedValue;
      });
    },
    [key],
  );

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== key && event.key !== null) return;
      setValue(readValue());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, readValue]);

  return [value, setAndPersistValue];
}
