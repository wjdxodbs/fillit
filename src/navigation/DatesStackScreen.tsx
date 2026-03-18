import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DatesListScreen } from "../screens/DatesListScreen";
import { DateDetailScreen } from "../screens/DateDetailScreen";
import { theme } from "../theme";

export type DatesStackParamList = {
  DatesList: undefined;
  DateDetail: { title: string; baseDate: string; targetDate: string };
};

const DatesStack = createNativeStackNavigator<DatesStackParamList>();

export function DatesStackScreen() {
  return (
    <DatesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        animation: "fade",
      }}
    >
      <DatesStack.Screen
        name="DatesList"
        component={DatesListScreen}
        options={{ title: "" }}
      />
      <DatesStack.Screen
        name="DateDetail"
        component={DateDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </DatesStack.Navigator>
  );
}
