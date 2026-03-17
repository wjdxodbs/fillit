import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface StatsCardProps {
  progress: number;
  elapsed: number;
  remaining: number;
  subtitle?: string;
}

export function StatsCard({ progress, elapsed, remaining, subtitle }: StatsCardProps) {
  return (
    <View style={styles.statsCard}>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress}%</Text>
          <Text style={styles.statLabel}>완료</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{elapsed}</Text>
          <Text style={styles.statLabel}>경과 일수</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{remaining}</Text>
          <Text style={styles.statLabel}>남은 일수</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 14,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.grassFilled,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.border,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.grassEmpty,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.grassFilled,
    borderRadius: 2,
  },
});
