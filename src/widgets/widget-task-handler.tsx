import React from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWidgetUpdateById } from "react-native-android-widget";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FillitGrassWidget } from "./FillitGrassWidget";
import type { WidgetConfig } from "./widget-config";
import { widgetConfigKey } from "./widget-config";
import {
  isLeapYear,
  getDaysBetween,
  getElapsedDays,
  getDayOfYear,
  toDateStr,
} from "../utils/dateUtils";

type WidgetData = {
  title: string;
  baseDate: string;
  targetDate: string;
  filledUpTo: number;
  totalDays: number;
  clickUrl: string;
};

export function renderFillitWidget(data: WidgetData) {
  return (
    <FillitGrassWidget
      title={data.title}
      baseDate={data.baseDate}
      targetDate={data.targetDate}
      filledUpTo={data.filledUpTo}
      totalDays={data.totalDays}
      clickUrl={data.clickUrl}
    />
  );
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
  const clickUrl = "fillit://Home";
  return { title, baseDate, targetDate, filledUpTo, totalDays, clickUrl };
}

/** 등록된 목표일(구간) 기준 위젯 데이터 */
export function getSavedDateWidgetData(
  title: string,
  baseDate: string,
  targetDate: string
) {
  const totalDays = getDaysBetween(baseDate, targetDate);
  const filledUpTo = getElapsedDays(baseDate, targetDate, totalDays, toDateStr(new Date()));
  const clickUrl = `fillit://DateDetail?title=${encodeURIComponent(title)}&baseDate=${encodeURIComponent(baseDate)}&targetDate=${encodeURIComponent(targetDate)}`;
  return { title, baseDate, targetDate, filledUpTo, totalDays, clickUrl };
}

async function readWidgetConfig(widgetId: number): Promise<WidgetConfig | null> {
  const raw = await AsyncStorage.getItem(widgetConfigKey(widgetId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WidgetConfig;
  } catch {
    return null;
  }
}

/**
 * 삭제된 목표를 참조 중인 위젯을 연도 뷰로 초기화.
 * Android에서는 앱이 위젯을 직접 삭제할 수 없으므로 연도 뷰로 전환한다.
 */
export async function resetWidgetsForGoal(goalId: string): Promise<void> {
  if (Platform.OS !== "android") return;

  const allKeys = await AsyncStorage.getAllKeys();
  const widgetKeys = allKeys.filter((k) => k.startsWith("widget_config_"));

  const resetIds: number[] = [];
  for (const key of widgetKeys) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;
    try {
      const config = JSON.parse(raw) as WidgetConfig;
      if (config.mode !== "date" || config.id !== goalId) continue;
      const widgetId = parseInt(key.replace("widget_config_", ""), 10);
      if (isNaN(widgetId)) continue;
      await AsyncStorage.setItem(key, JSON.stringify({ mode: "year" } as WidgetConfig));
      resetIds.push(widgetId);
    } catch {
      // ignore
    }
  }

  if (resetIds.length === 0) return;

  const yearData = getYearWidgetData();
  await Promise.all(
    resetIds.map((widgetId) =>
      requestWidgetUpdateById({
        widgetName: "FillitGrass",
        widgetId,
        renderWidget: async () => renderFillitWidget(yearData),
      }).catch(() => {})
    )
  );
}

export async function getWidgetDataForConfig(widgetId: number): Promise<{
  title: string;
  baseDate: string;
  targetDate: string;
  filledUpTo: number;
  totalDays: number;
  clickUrl: string;
}> {
  const config = await readWidgetConfig(widgetId);
  if (!config || config.mode === "year") return getYearWidgetData();
  return getSavedDateWidgetData(config.title, config.baseDate, config.targetDate);
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, renderWidget } = props;

  if (widgetInfo.widgetName !== "FillitGrass") return;

  const widgetData = await getWidgetDataForConfig(widgetInfo.widgetId);

  const widget = renderFillitWidget(widgetData);

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      renderWidget(widget);
      break;
    default:
      break;
  }
}
