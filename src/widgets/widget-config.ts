import AsyncStorage from "@react-native-async-storage/async-storage";

/** 위젯별로 저장하는 설정 키 */
export function widgetConfigKey(widgetId: number): string {
  return `widget_config_${widgetId}`;
}

export type WidgetConfig =
  | { mode: "year" }
  | {
      mode: "date";
      id: string;
      title: string;
      baseDate: string;
      targetDate: string;
    };

export async function readWidgetConfig(widgetId: number): Promise<WidgetConfig | null> {
  const raw = await AsyncStorage.getItem(widgetConfigKey(widgetId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WidgetConfig;
  } catch {
    return null;
  }
}
