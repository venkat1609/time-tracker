import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get initial value from localStorage or use provided initialValue
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever value changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        if (value === null || value === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
