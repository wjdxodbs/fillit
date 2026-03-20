import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedDate } from "../types";
import { scheduleGoalReminder, cancelGoalReminder, rescheduleAllReminders } from "../utils/notifications";
import { resetWidgetsForGoal } from "../widgets/widget-task-handler";
import { readSavedDates, writeSavedDates } from "../utils/savedDatesStorage";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useSavedDates() {
  const [dates, setDates] = useState<SavedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const datesRef = useRef<SavedDate[]>([]);

  const load = useCallback(async () => {
    try {
      const migrated = await readSavedDates();
      datesRef.current = migrated;
      setDates(migrated);
      rescheduleAllReminders(migrated).catch(() => {});
    } catch {
      datesRef.current = [];
      setDates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (title: string, baseDate: string, targetDate: string) => {
    const newItem: SavedDate = { id: generateId(), title, baseDate, targetDate };
    const next = [...datesRef.current, newItem];
    try {
      await writeSavedDates(next);
    } catch {
      throw new Error("목표를 저장하지 못했습니다.");
    }
    datesRef.current = next;
    setDates(next);
    scheduleGoalReminder(newItem).catch(() => {});
    return newItem;
  }, []);

  const update = useCallback(async (id: string, title: string, baseDate: string, targetDate: string) => {
    const next = datesRef.current.map((d) =>
      d.id === id ? { ...d, title, baseDate, targetDate } : d
    );
    try {
      await writeSavedDates(next);
    } catch {
      throw new Error("목표를 수정하지 못했습니다.");
    }
    datesRef.current = next;
    setDates(next);
    scheduleGoalReminder({ id, title, baseDate, targetDate }).catch(() => {});
  }, []);

  const remove = useCallback(async (id: string) => {
    const next = datesRef.current.filter((d) => d.id !== id);
    try {
      await writeSavedDates(next);
    } catch {
      throw new Error("목표를 삭제하지 못했습니다.");
    }
    datesRef.current = next;
    setDates(next);
    cancelGoalReminder(id).catch(() => {});
    resetWidgetsForGoal(id).catch(() => {});
  }, []);

  return { dates, loading, add, update, remove, refresh: load };
}
