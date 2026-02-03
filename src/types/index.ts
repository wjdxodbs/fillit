export interface SavedDate {
  id: string;
  title: string;
  /** 기준 날짜 (YYYY-MM-DD) */
  baseDate: string;
  /** 목표 날짜 (YYYY-MM-DD) */
  targetDate: string;
}
