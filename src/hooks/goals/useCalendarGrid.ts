import { useMemo } from "react";
import { formatDateComponents } from "../../utils/dateUtils";

const CALENDAR_WEEKS = 6;

export function useCalendarGrid(
  year: number,
  month: number,
  minimumDate: Date,
  maximumDate: Date | undefined,
  selectedDate: string
) {
  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const cells: (number | null)[] = [];
    // 월 시작 요일 전 빈 칸 채우기
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // 마지막 주 남은 칸 채우기 (6주 고정 그리드 유지)
    while (cells.length < CALENDAR_WEEKS * 7) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < CALENDAR_WEEKS * 7; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [year, month]);

  const dateStr = (day: number) => formatDateComponents(year, month, day);

  const isSelectable = (day: number | null): boolean => {
    if (day === null) return false;
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = d.getTime();
    if (t < minimumDate.getTime()) return false;
    if (maximumDate && t > maximumDate.getTime()) return false;
    return true;
  };

  const isSelected = (day: number | null): boolean =>
    day !== null && selectedDate === dateStr(day);

  return { weeks, dateStr, isSelectable, isSelected };
}
