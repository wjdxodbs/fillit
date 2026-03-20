export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysBetween(baseStr: string, targetStr: string): number {
  const a = new Date(baseStr + "T12:00:00");
  const b = new Date(targetStr + "T12:00:00");
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/** 1월 1일 = 1, 12월 31일 = 365/366 (로컬 날짜 기준) */
export function getDayOfYear(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isLeapYear(y)) daysInMonth[1] = 29;
  let day = 0;
  for (let i = 0; i < m; i++) day += daysInMonth[i];
  day += d;
  return Math.min(Math.max(day, 1), 366);
}

/** Date → "YYYY-MM-DD" (로컬 시간 기준) */
export function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * baseDate~targetDate 구간에서 todayStr까지 경과 일수.
 * 범위를 벗어나지 않음 (0 ~ totalDays).
 */
export function getElapsedDays(
  baseDate: string,
  targetDate: string,
  totalDays: number,
  todayStr: string
): number {
  if (todayStr < baseDate) return 0;
  if (todayStr > targetDate) return totalDays;
  return getDaysBetween(baseDate, todayStr);
}

/** 진행률(%) 계산. total이 0이면 0 반환 */
export function calcProgress(filled: number, total: number): number {
  return total > 0 ? Math.round((filled / total) * 100) : 0;
}

/** 배열을 size 단위로 분할 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/** 두 Date가 같은 날(로컬 기준)인지 비교 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** year, month(0-indexed), day → "YYYY-MM-DD" */
export function formatDateComponents(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** "YYYY-MM-DD", "YYYY-MM-DD" → "YYYY년 M월 D일 ~ YYYY년 M월 D일" */
export function formatDateRange(baseDate: string, targetDate: string): string {
  return `${formatDate(baseDate)} ~ ${formatDate(targetDate)}`;
}

/** "YYYY-MM-DD" → "YYYY년 M월 D일" */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** "YYYY-MM-DD" → { year, month(0-indexed), day } */
export function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}
