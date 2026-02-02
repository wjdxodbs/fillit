import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

type CellState = 'empty' | 'filled' | 'today' | 'highlight';

interface DayCellProps {
  state: CellState;
  size?: number;
}

export function DayCell({ state, size = 10 }: DayCellProps) {
  const backgroundColor =
    state === 'filled'
      ? theme.grassFilled
      : state === 'today' || state === 'highlight'
        ? theme.grassToday
        : theme.grassEmpty;

  return (
    <View
      style={[
        styles.cell,
        { width: size, height: size, borderRadius: size * 0.25, backgroundColor },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  cell: {},
});
