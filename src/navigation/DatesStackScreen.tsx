import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DatesListScreen } from "../screens/DatesListScreen";
import { DateDetailScreen } from "../screens/DateDetailScreen";
import { theme } from "../theme";

type DatesStackParamList = {
  DatesList: undefined;
  DateDetail: { title: string; baseDate: string; targetDate: string };
};

const DatesStack = createNativeStackNavigator<DatesStackParamList>();

export function DatesStackScreen() {
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
