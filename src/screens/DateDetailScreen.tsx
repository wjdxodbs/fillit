import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { YearGrassGrid } from '../components/YearGrassGrid';
import { theme } from '../theme';

function getProgressPercent(year: number, endDate: Date): number {
  const isLeap = (y: number) =>
    (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInYear = isLeap(year) ? 366 : 365;
  const start = new Date(year, 0, 0);
  const diff = endDate.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.min(100, Math.round((dayOfYear / daysInYear) * 100));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}월 ${day}일`;
}

type DateDetailScreenProps = {
  route: { params: { title: string; date: string } };
};

export function DateDetailScreen({ route }: DateDetailScreenProps) {
  const { title, date } = route.params;
  const endDate = useMemo(() => new Date(date + 'T12:00:00'), [date]);
  const year = endDate.getFullYear();
  const progress = useMemo(
    () => getProgressPercent(year, endDate),
    [year, endDate]
  );
  const dayOfYear = useMemo(() => {
    const start = new Date(year, 0, 0);
    const diff = endDate.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [year, endDate]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{formatDate(date)}</Text>
      <Text style={styles.progress}>
        {year}년 {dayOfYear}일 경과 ({progress}%)
      </Text>
      <View style={styles.gridWrap}>
        <YearGrassGrid
          year={year}
          endDate={date}
          cellSize={10}
          highlightEndDate={true}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  progress: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  gridWrap: {
    alignSelf: 'flex-start',
  },
});
