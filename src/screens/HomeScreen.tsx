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

export function HomeScreen() {
  const year = new Date().getFullYear();
  const today = useMemo(() => new Date(), []);
  const progress = useMemo(
    () => getProgressPercent(year, today),
    [year, today]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{year}년</Text>
      <Text style={styles.progress}>{progress}% 완료</Text>
      <View style={styles.gridWrap}>
        <YearGrassGrid year={year} endDate={today} cellSize={10} />
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
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  progress: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  gridWrap: {
    alignSelf: 'flex-start',
  },
});
