import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedDate } from "../types";
import { scheduleGoalReminder, cancelGoalReminder, rescheduleAllReminders } from "../utils/notifications";
import { resetWidgetsForGoal } from "../widgets/widget-task-handler";

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
      const parsed = (raw ? JSON.parse(raw) : []) as Record<string, unknown>[];
      const migrated: SavedDate[] = parsed.map((item) => {
        const id = String(item.id ?? "");
        const title = String(item.title ?? "");
        // 구버전 데이터 호환: 단일 date 필드 → baseDate/targetDate로 마이그레이션
        const date = item.date as string | undefined;
        const baseDate = (item.baseDate as string) ?? date ?? "";
        const targetDate = (item.targetDate as string) ?? date ?? "";
        return { id, title, baseDate, targetDate };
      });
      setDates(migrated);
      rescheduleAllReminders(migrated).catch(() => {});
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
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        throw new Error("목표를 저장하지 못했습니다.");
      }
      setDates(next);
      scheduleGoalReminder(newItem).catch(() => {});
      return newItem;
    },
    [dates]
  );

  const update = useCallback(
    async (id: string, title: string, baseDate: string, targetDate: string) => {
      const next = dates.map((d) =>
        d.id === id ? { ...d, title, baseDate, targetDate } : d
      );
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        throw new Error("목표를 수정하지 못했습니다.");
      }
      setDates(next);
      cancelGoalReminder(id).catch(() => {});
      scheduleGoalReminder({ id, title, baseDate, targetDate }).catch(() => {});
    },
    [dates]
  );

  const remove = useCallback(
    async (id: string) => {
      const next = dates.filter((d) => d.id !== id);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        throw new Error("목표를 삭제하지 못했습니다.");
      }
      setDates(next);
      cancelGoalReminder(id).catch(() => {});
      resetWidgetsForGoal(id).catch(() => {});
    },
    [dates]
  );

  return { dates, loading, add, update, remove, refresh: load };
}
