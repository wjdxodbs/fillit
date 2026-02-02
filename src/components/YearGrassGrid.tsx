import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { DayCell } from './DayCell';
import { theme } from '../theme';

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface YearGrassGridProps {
  year: number;
  endDate: Date | string;
  cellSize?: number;
  highlightEndDate?: boolean;
}

export function YearGrassGrid({
  year,
  endDate,
  cellSize = 10,
  highlightEndDate = true,
}: YearGrassGridProps) {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const endDayOfYear = end.getFullYear() === year ? getDayOfYear(end) : 0;

  const { rows, daysInYear } = useMemo(() => {
    const daysInYear = isLeapYear(year) ? 366 : 365;
    const jan1 = new Date(year, 0, 1);
    const startWeekday = jan1.getDay();

    const cells: Array<{ dayOfYear: number | null }> = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ dayOfYear: null });
    }
    for (let d = 1; d <= daysInYear; d++) {
      cells.push({ dayOfYear: d });
    }

    const rows: Array<Array<{ dayOfYear: number | null }>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      const row = cells.slice(i, i + 7);
      while (row.length < 7) row.push({ dayOfYear: null });
      rows.push(row);
    }
    return { rows, daysInYear };
  }, [year]);

  const today = useMemo(() => new Date(), []);

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => {
            if (cell.dayOfYear === null) {
              return (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  style={[styles.cellWrapper, { width: cellSize, height: cellSize }]}
                >
                  <DayCell state="empty" size={cellSize} />
                </View>
              );
            }
            const dayOfYear = cell.dayOfYear;
            const filled = dayOfYear <= endDayOfYear;
            const isEndDay = dayOfYear === endDayOfYear;
            const cellDate = new Date(year, 0, dayOfYear);
            const isToday = isSameDay(cellDate, today);

            let state: 'empty' | 'filled' | 'today' | 'highlight' = filled
              ? 'filled'
              : 'empty';
            if (filled && highlightEndDate && isEndDay) {
              state = 'highlight';
            } else if (filled && isToday && highlightEndDate) {
              state = 'today';
            }

            return (
              <View
                key={`${rowIndex}-${colIndex}`}
                style={[styles.cellWrapper, { width: cellSize, height: cellSize }]}
              >
                <DayCell state={state} size={cellSize} />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  cellWrapper: {
    marginRight: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
