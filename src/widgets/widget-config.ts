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
