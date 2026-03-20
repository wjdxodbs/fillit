import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedDate } from "../types";

const STORAGE_KEY = "saved_dates";

function migrateSavedDates(raw: Record<string, unknown>[]): SavedDate[] {
  return raw.map((item) => {
    const id = String(item.id ?? "");
    const title = String(item.title ?? "");
    // 구버전 데이터 호환: 단일 date 필드 → baseDate/targetDate로 마이그레이션
    const date = item.date as string | undefined;
    const baseDate = (item.baseDate as string) ?? date ?? "";
    const targetDate = (item.targetDate as string) ?? date ?? "";
    return { id, title, baseDate, targetDate };
  });
}

export async function readSavedDates(): Promise<SavedDate[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const parsed = (raw ? JSON.parse(raw) : []) as Record<string, unknown>[];
  return migrateSavedDates(parsed);
}

export async function writeSavedDates(dates: SavedDate[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
}
