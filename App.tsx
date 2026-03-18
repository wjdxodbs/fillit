import React, { useEffect } from "react";
import { Platform, View, TouchableOpacity } from "react-native";
import { setupNotificationChannel, requestNotificationPermission } from "./src/utils/notifications";
import { DatesStackScreen } from "./src/navigation/DatesStackScreen";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme, NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import type { LinkingOptions, NavigatorScreenParams } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { DatesStackParamList } from "./src/navigation/DatesStackScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { requestWidgetUpdate } from "react-native-android-widget";
import { HomeScreen } from "./src/screens/HomeScreen";
import { theme } from "./src/theme";
import { FillitGrassWidget } from "./src/widgets/FillitGrassWidget";
import { getWidgetDataForConfig } from "./src/widgets/widget-task-handler";

const AppTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.grassFilled,
    background: theme.background,
    card: theme.backgroundSecondary,
    text: theme.text,
    border: theme.border,
    notification: theme.grassFilled,
  },
};

type RootTabParamList = {
  Home: undefined;
  Dates: NavigatorScreenParams<DatesStackParamList>;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ["fillit://"],
  config: {
    screens: {
      Home: "Home",
      Dates: {
        screens: {
          DatesList: "DatesList",
          DateDetail: "DateDetail",
        },
      },
    },
  },
};

export default function App() {
  // 알림 채널 설정 및 권한 요청
  useEffect(() => {
    setupNotificationChannel();
    requestNotificationPermission().catch(() => {});
  }, []);

  // 앱이 열릴 때마다 위젯 갱신 (자정 알람 실패 대비)
  useEffect(() => {
    if (Platform.OS === "android") {
      requestWidgetUpdate({
        widgetName: "FillitGrass",
        renderWidget: async (widgetInfo) => {
          const data = await getWidgetDataForConfig(widgetInfo.widgetId);
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
        },
      }).catch(() => {
        // 위젯이 없으면 무시
      });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={AppTheme} linking={linking}>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: "transparent",
                borderTopWidth: 0,
                height: 64,
                paddingBottom: 0,
              },
              tabBarItemStyle: {
                justifyContent: "center",
                paddingVertical: 0,
              },
              tabBarBackground: () => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.surface,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                  }}
                />
              ),
              tabBarActiveTintColor: theme.tabActive,
              tabBarInactiveTintColor: theme.tabInactive,
              tabBarButton: (props) => (
                <TouchableOpacity
                  activeOpacity={0.65}
                  onPress={props.onPress}
                  onLongPress={props.onLongPress ?? undefined}
                  delayLongPress={props.delayLongPress ?? undefined}
                  style={[props.style, { borderRadius: 12, justifyContent: "center", alignItems: "center" }]}
                  accessibilityRole={props.accessibilityRole}
                  accessibilityLabel={props.accessibilityLabel}
                  accessibilityState={props.accessibilityState}
                >
                  {props.children}
                </TouchableOpacity>
              ),
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: "홈",
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Dates"
              component={DatesStackScreen}
              options={({ route }) => ({
                tabBarLabel: "목표일 설정",
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? "calendar" : "calendar-outline"}
                    size={size}
                    color={color}
                  />
                ),
                tabBarStyle: getFocusedRouteNameFromRoute(route) === "DateDetail"
                  ? { display: "none" }
                  : {
                      backgroundColor: "transparent",
                      borderTopWidth: 0,
                      height: 64,
                      paddingBottom: 0,
                    },
              })}
            />
          </Tab.Navigator>
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
