
import { useCallback, useEffect, useRef, useState } from "react";

const LOCAL_STORAGE_EVENT = "foodbridge-local-storage-change";

export function useLocalStorage(key, initialValue) {
  const initialValueRef = useRef(initialValue);

  const readValue = useCallback(() => {
    try {
      const saved = window.localStorage.getItem(key);

      if (saved !== null) {
        return JSON.parse(saved);
      }
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
          typeof nextValue === "function"
            ? nextValue(currentValue)
            : nextValue;

        try {
          window.localStorage.setItem(
            key,
            JSON.stringify(resolvedValue)
          );

          // Notify other hook instances in the same tab.
          window.dispatchEvent(
            new CustomEvent(LOCAL_STORAGE_EVENT, {
              detail: { key },
            })
          );
        } catch (error) {
          console.warn(
            `Could not save localStorage key "${key}".`,
            error
          );
        }

        return resolvedValue;
      });
    },
    [key]
  );

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== key && event.key !== null) return;
      setValue(readValue());
    };

    const handleLocalStorageChange = (event) => {
      if (event.detail?.key !== key) return;
      setValue(readValue());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      LOCAL_STORAGE_EVENT,
      handleLocalStorageChange
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        LOCAL_STORAGE_EVENT,
        handleLocalStorageChange
      );
    };
  }, [key, readValue]);

  return [value, setAndPersistValue];
}
