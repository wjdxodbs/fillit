import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedDate } from '../types';

const STORAGE_KEY = 'saved_dates';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useSavedDates() {
  const [dates, setDates] = useState<SavedDate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setDates(raw ? JSON.parse(raw) : []);
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
    async (title: string, date: string) => {
      const newItem: SavedDate = {
        id: generateId(),
        title,
        date,
      };
      const next = [...dates, newItem];
      setDates(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return newItem;
    },
    [dates]
  );

  const update = useCallback(
    async (id: string, title: string, date: string) => {
      const next = dates.map((d) =>
        d.id === id ? { ...d, title, date } : d
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
