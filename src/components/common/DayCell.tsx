import React from "react";
import { View, type ViewStyle } from "react-native";

export type CellState = "empty" | "filled" | "today" | "highlight";

interface DayCellProps {
  style: ViewStyle;
}

export function DayCell({ style }: DayCellProps) {
  return <View style={style} />;
}
