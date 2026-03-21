import React, { useEffect, useMemo } from "react";
import { Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { requestWidgetUpdate } from "react-native-android-widget";
import { useTheme } from "./stores/themeStore";
import { setupNotificationChannel, requestNotificationPermission, requestExactAlarmPermissionIfNeeded } from "./utils/notifications";
import { getWidgetDataForConfig } from "./widgets/widgetDataHelpers";
import { renderFillitWidget } from "./widgets/widget-task-handler";
import { RootTabNavigator, linking } from "./navigation/RootTabNavigator";

export function AppContent() {
  const { theme, isDark } = useTheme();

  const appNavTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: isDark,
      colors: {
        ...DefaultTheme.colors,
        primary: theme.grassFilled,
        background: theme.background,
        card: theme.backgroundSecondary,
        text: theme.text,
        border: theme.border,
        notification: theme.grassFilled,
      },
    }),
    [theme, isDark],
  );

  useEffect(() => {
    setupNotificationChannel()
      .then(() => requestNotificationPermission())
      .then((granted) => { if (granted) requestExactAlarmPermissionIfNeeded(); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      requestWidgetUpdate({
        widgetName: "FillitGrass",
        renderWidget: async (widgetInfo) => {
          const data = await getWidgetDataForConfig(widgetInfo.widgetId);
          return renderFillitWidget(data);
        },
      }).catch(() => {
        // 위젯이 없으면 무시
      });
    }
  }, []);

  return (
    <NavigationContainer theme={appNavTheme} linking={linking}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <RootTabNavigator />
      </View>
    </NavigationContainer>
  );
}
