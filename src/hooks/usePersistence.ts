import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PersistedData<T> {
  content: T;
  timestamp: string;
}

export const usePersistence = <T,>(
  storageKey: string,
  initialValue: T
) => {
  const [data, setData] = useState<T>(initialValue);
  const [hasRestoredData, setHasRestoredData] = useState(false);

  // Load data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: PersistedData<T> = JSON.parse(stored);
        setData(parsed.content);
        setHasRestoredData(true);
        toast.info("🔁 Dernier contenu restauré automatiquement");
      }
    } catch (error) {
      console.error("Error loading persisted data:", error);
    }
  }, [storageKey]);

  // Save data whenever it changes
  const saveData = (newData: T) => {
    try {
      const toStore: PersistedData<T> = {
        content: newData,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(toStore));
      setData(newData);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Clear persisted data
  const clearData = () => {
    try {
      localStorage.removeItem(storageKey);
      setData(initialValue);
      setHasRestoredData(false);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  return {
    data,
    saveData,
    clearData,
    hasRestoredData,
  };
};
