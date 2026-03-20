import React from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWidgetUpdateById } from "react-native-android-widget";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FillitGrassWidget } from "./FillitGrassWidget";
import type { FillitGrassWidgetProps } from "./FillitGrassWidget";
import type { WidgetConfig } from "./widget-config";
import { widgetConfigKey } from "./widget-config";
import { getWidgetDataForConfig, getYearWidgetData } from "./widgetDataHelpers";

export function renderFillitWidget(data: FillitGrassWidgetProps) {
  return <FillitGrassWidget {...data} />;
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
