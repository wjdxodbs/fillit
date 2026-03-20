import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWidgetUpdateById, type WidgetConfigurationScreenProps } from "react-native-android-widget";
import { getSavedDateWidgetData, getWidgetDataForConfig, getYearWidgetData } from "./widgetDataHelpers";
import { renderFillitWidget } from "./widget-task-handler";
import type { WidgetConfig } from "./widget-config";
import { widgetConfigKey } from "./widget-config";

type Props = Pick<WidgetConfigurationScreenProps, "widgetInfo" | "renderWidget" | "setResult">;

export function useWidgetConfiguration({ widgetInfo, renderWidget, setResult }: Props) {
  const finishWith = async (config: WidgetConfig) => {
    await AsyncStorage.setItem(
      widgetConfigKey(widgetInfo.widgetId),
      JSON.stringify(config)
    );
    const data =
      config.mode === "year"
        ? getYearWidgetData()
        : getSavedDateWidgetData(config.title, config.baseDate, config.targetDate);
    renderWidget(renderFillitWidget(data));
    await requestWidgetUpdateById({
      widgetName: "FillitGrass",
      widgetId: widgetInfo.widgetId,
      renderWidget: async (info) => {
        const widgetData = await getWidgetDataForConfig(info.widgetId);
        return renderFillitWidget(widgetData);
      },
    });
    setResult("ok");
  };

  return { finishWith };
}
