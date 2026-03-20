import {
  isLeapYear,
  getDaysBetween,
  getElapsedDays,
  getDayOfYear,
  toDateStr,
} from "../utils/dateUtils";
import { readWidgetConfig } from "./widget-config";
import type { FillitGrassWidgetProps } from "./FillitGrassWidget";

/** 올해(1년) 기준 위젯 데이터 */
export function getYearWidgetData(): FillitGrassWidgetProps {
  const now = new Date();
  const year = now.getFullYear();
  const baseDate = `${year}-01-01`;
  const targetDate = `${year}-12-31`;
  const totalDays = isLeapYear(year) ? 366 : 365;
  const filledUpTo = getDayOfYear(now);
  const title = `${year}년`;
  const clickUrl = "fillit://Home";
  return { title, baseDate, targetDate, filledUpTo, totalDays, clickUrl };
}

/** 등록된 목표일(구간) 기준 위젯 데이터 */
export function getSavedDateWidgetData(
  title: string,
  baseDate: string,
  targetDate: string
): FillitGrassWidgetProps {
  const totalDays = getDaysBetween(baseDate, targetDate);
  const filledUpTo = getElapsedDays(baseDate, targetDate, totalDays, toDateStr(new Date()));
  const clickUrl = `fillit://DateDetail?title=${encodeURIComponent(title)}&baseDate=${encodeURIComponent(baseDate)}&targetDate=${encodeURIComponent(targetDate)}`;
  return { title, baseDate, targetDate, filledUpTo, totalDays, clickUrl };
}

export async function getWidgetDataForConfig(widgetId: number): Promise<FillitGrassWidgetProps> {
  const config = await readWidgetConfig(widgetId);
  if (!config || config.mode === "year") return getYearWidgetData();
  return getSavedDateWidgetData(config.title, config.baseDate, config.targetDate);
}
