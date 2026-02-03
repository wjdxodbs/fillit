import React from "react";
import { StyleSheet, View } from "react-native";
import { useGrassColor } from "../contexts/GrassColorContext";
import { theme } from "../theme";

type CellState = "empty" | "filled" | "today" | "highlight";

interface DayCellProps {
  state: CellState;
  size?: number;
}

export function DayCell({ state, size = 10 }: DayCellProps) {
  const { color: grassColor } = useGrassColor();
  // 채움·오늘·하이라이트 모두 지정한 색상 사용
  const backgroundColor = state === "empty" ? theme.grassEmpty : grassColor;

  return (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          borderRadius: size * 0.25,
          backgroundColor,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  cell: {},
});
