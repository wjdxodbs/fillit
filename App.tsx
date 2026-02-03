import React from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GrassColorProvider } from "./src/contexts/GrassColorContext";
import { HomeScreen } from "./src/screens/HomeScreen";
import { DatesListScreen } from "./src/screens/DatesListScreen";
import { DateDetailScreen } from "./src/screens/DateDetailScreen";
import { theme } from "./src/theme";

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

export type DatesStackParamList = {
  DatesList: undefined;
  DateDetail: { title: string; baseDate: string; targetDate: string };
};

const Tab = createBottomTabNavigator();
const DatesStack = createNativeStackNavigator<DatesStackParamList>();

function DatesStackScreen() {
  return (
    <DatesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.backgroundSecondary },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <DatesStack.Screen
        name="DatesList"
        component={DatesListScreen}
        options={{ headerShown: false }}
      />
      <DatesStack.Screen
        name="DateDetail"
        component={DateDetailScreen}
        options={({ route }) => ({
          title: (route.params as { title: string }).title,
        })}
      />
    </DatesStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GrassColorProvider>
        <NavigationContainer theme={AppTheme}>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: theme.backgroundSecondary,
                borderTopColor: theme.border,
              },
              tabBarActiveTintColor: theme.tabActive,
              tabBarInactiveTintColor: theme.tabInactive,
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
              options={{
                tabBarLabel: "등록한 날짜",
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons
                    name={focused ? "calendar" : "calendar-outline"}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </GrassColorProvider>
    </SafeAreaProvider>
  );
}
