import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import type { LinkingOptions, NavigatorScreenParams } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { DatesStackParamList } from "./DatesStackScreen";
import { DatesStackScreen } from "./DatesStackScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { useTheme } from "../stores/themeStore";

export type RootTabParamList = {
  Home: undefined;
  Dates: NavigatorScreenParams<DatesStackParamList>;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_BAR_STYLE = {
  backgroundColor: "transparent",
  borderTopWidth: 0,
  height: 64,
  paddingBottom: 0,
} as const;

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ["fillit://"],
  config: {
    screens: {
      Home: "Home",
      Dates: {
        initialRouteName: "DatesList",
        screens: {
          DatesList: "DatesList",
          DateDetail: {
            path: "DateDetail",
            parse: {
              title: String,
              baseDate: String,
              targetDate: String,
            },
          },
        },
      },
    },
  },
};

export function RootTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
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
            style={[
              props.style,
              { borderRadius: 12, justifyContent: "center", alignItems: "center" },
            ]}
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
          tabBarStyle:
            getFocusedRouteNameFromRoute(route) === "DateDetail"
              ? { display: "none" }
              : TAB_BAR_STYLE,
        })}
      />
    </Tab.Navigator>
  );
}
