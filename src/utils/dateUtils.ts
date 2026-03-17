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

/** "YYYY-MM-DD" → "YYYY년 M월 D일" */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
