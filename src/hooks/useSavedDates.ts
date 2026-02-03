import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedDate } from "../types";

const STORAGE_KEY = "saved_dates";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useSavedDates() {
  const [dates, setDates] = useState<SavedDate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: unknown[] = raw ? JSON.parse(raw) : [];
      const migrated: SavedDate[] = parsed.map(
        (item: Record<string, unknown>) => {
          const id = String(item.id ?? "");
          const title = String(item.title ?? "");
          const date = item.date as string | undefined;
          const baseDate = (item.baseDate as string) ?? date ?? "";
          const targetDate = (item.targetDate as string) ?? date ?? "";
          return { id, title, baseDate, targetDate };
        }
      );
      setDates(migrated);
    } catch {
      setDates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (title: string, baseDate: string, targetDate: string) => {
      const newItem: SavedDate = {
        id: generateId(),
        title,
        baseDate,
        targetDate,
      };
      const next = [...dates, newItem];
      setDates(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return newItem;
    },
    [dates]
  );

  const update = useCallback(
    async (id: string, title: string, baseDate: string, targetDate: string) => {
      const next = dates.map((d) =>
        d.id === id ? { ...d, title, baseDate, targetDate } : d
      );
      setDates(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    [dates]
  );

  const remove = useCallback(
    async (id: string) => {
      const next = dates.filter((d) => d.id !== id);
      setDates(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    [dates]
  );

  return { dates, loading, add, update, remove, refresh: load };
}
