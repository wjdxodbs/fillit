import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FillitGrassWidget } from "./FillitGrassWidget";
import type { WidgetConfig } from "./widget-config";
import { widgetConfigKey } from "./widget-config";

/** 1월 1일 = 1, 2월 4일 = 35 등 (1-based, 로컬 날짜 기준) */
function getDayOfYear(date: Date): number {
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

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysBetween(baseStr: string, targetStr: string): number {
  const a = new Date(baseStr + "T12:00:00");
  const b = new Date(targetStr + "T12:00:00");
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/** 올해(1년) 기준 위젯 데이터 */
export function getYearWidgetData() {
  const now = new Date();
  const year = now.getFullYear();
  const baseDate = `${year}-01-01`;
  const targetDate = `${year}-12-31`;
  const totalDays = isLeapYear(year) ? 366 : 365;
  const filledUpTo = getDayOfYear(now);
  const title = `${year}년`;
  return { title, baseDate, targetDate, filledUpTo, totalDays };
}

/** 등록된 목표일(구간) 기준 위젯 데이터 */
export function getSavedDateWidgetData(
  title: string,
  baseDate: string,
  targetDate: string
) {
  const now = new Date();
  const base = new Date(baseDate + "T12:00:00");
  const target = new Date(targetDate + "T12:00:00");
  base.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const nowTime = now.getTime();
  const totalDays = getDaysBetween(baseDate, targetDate);
  let filledUpTo: number;
  if (nowTime < base.getTime()) filledUpTo = 0;
  else if (nowTime > target.getTime()) filledUpTo = totalDays;
  else {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    filledUpTo = getDaysBetween(baseDate, `${y}-${m}-${d}`);
  }
  return { title, baseDate, targetDate, filledUpTo, totalDays };
}

export async function getWidgetDataForConfig(widgetId: number): Promise<{
  title: string;
  baseDate: string;
  targetDate: string;
  filledUpTo: number;
  totalDays: number;
}> {
  const raw = await AsyncStorage.getItem(widgetConfigKey(widgetId));
  if (!raw) return getYearWidgetData();
  let config: WidgetConfig;
  try {
    config = JSON.parse(raw) as WidgetConfig;
  } catch {
    return getYearWidgetData();
  }
  if (config.mode === "year") return getYearWidgetData();
  return getSavedDateWidgetData(
    config.title,
    config.baseDate,
    config.targetDate
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, renderWidget } = props;

  if (widgetInfo.widgetName !== "FillitGrass") return;

  const widgetData = await getWidgetDataForConfig(widgetInfo.widgetId);

  const widget = (
    <FillitGrassWidget
      title={widgetData.title}
      baseDate={widgetData.baseDate}
      targetDate={widgetData.targetDate}
      filledUpTo={widgetData.filledUpTo}
      totalDays={widgetData.totalDays}
    />
  );

  switch (widgetAction) {
    case "WIDGET_ADDED":
      renderWidget(widget);
      break;
    case "WIDGET_UPDATE":
      renderWidget(widget);
      break;
    case "WIDGET_RESIZED":
      renderWidget(widget);
      break;
    case "WIDGET_DELETED":
      break;
    case "WIDGET_CLICK":
      break;
    default:
      break;
  }
}
