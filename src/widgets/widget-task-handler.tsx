import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const totalDays = getDaysBetween(baseDate, targetDate);
  const filledUpTo = getElapsedDays(baseDate, targetDate, totalDays, toDateStr(new Date()));
  return { title, baseDate, targetDate, filledUpTo, totalDays };
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

export async function getWidgetDataForConfig(widgetId: number): Promise<{
  title: string;
  baseDate: string;
  targetDate: string;
  filledUpTo: number;
  totalDays: number;
}> {
  const config = await readWidgetConfig(widgetId);
  if (!config || config.mode === "year") return getYearWidgetData();
  return getSavedDateWidgetData(config.title, config.baseDate, config.targetDate);
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
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      renderWidget(widget);
      break;
    case "WIDGET_CLICK": {
      const config = await readWidgetConfig(widgetInfo.widgetId);
      if (config?.mode === "date") {
        const url = `fillit://DateDetail?title=${encodeURIComponent(config.title)}&baseDate=${config.baseDate}&targetDate=${config.targetDate}`;
        Linking.openURL(url);
      } else {
        Linking.openURL("fillit://Home");
      }
      break;
    }
    default:
      break;
  }
}
