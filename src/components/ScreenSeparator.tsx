import React from "react";
import { View } from "react-native";
import { useTheme } from "../stores/themeStore";

export function ScreenSeparator() {
  const { theme } = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border }} />;
}
