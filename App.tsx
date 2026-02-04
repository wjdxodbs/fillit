import React from "react";
import { View, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

type DatesStackParamList = {
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
        options={({ navigation, route }) => ({
          title: (route.params as { title: string }).title,
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 8, padding: 8 }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </TouchableOpacity>
          ),
        })}
      />
    </DatesStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={AppTheme}>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: "transparent",
                borderTopWidth: 0,
                height: 72,
              },
              tabBarBackground: () => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.backgroundSecondary,
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
                  style={[props.style, { borderRadius: 12 }]}
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
              options={{
                tabBarLabel: "목표일 설정",
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
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
