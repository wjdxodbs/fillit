import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../theme";
import type { SavedDate } from "../types";
import { getDaysBetween, getElapsedDays, formatDate, toDateStr } from "../utils/dateUtils";

interface GoalListItemProps {
  item: SavedDate;
  onPress: () => void;
  onDelete: () => void;
}

export function GoalListItem({ item, onPress, onDelete }: GoalListItemProps) {
  const totalDays = getDaysBetween(item.baseDate, item.targetDate);
  const todayStr = toDateStr(new Date());
  const isCompleted = todayStr > item.targetDate;
  const elapsedDays = getElapsedDays(item.baseDate, item.targetDate, totalDays, todayStr);
  const progressPercent =
    totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;

  return (
    <Pressable style={[styles.item, isCompleted && styles.itemCompleted]} onPress={onPress}>
      <View style={styles.itemProgressBgWrap}>
        <LinearGradient
          colors={["rgba(0,196,154,0.35)", "rgba(0,100,80,0.4)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.itemProgressBg,
            { width: `${Math.min(100, progressPercent)}%` },
          ]}
        />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeaderRow}>
          <Text style={[styles.itemTitle, isCompleted && styles.itemTitleCompleted]} numberOfLines={1}>
            {item.title}
          </Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>완료</Text>
            </View>
          )}
        </View>
        <Text style={styles.itemDate}>
          {formatDate(item.baseDate)} ~{" "}
          {formatDate(item.targetDate)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  itemCompleted: {
    opacity: 0.6,
  },
  itemProgressBgWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  itemProgressBg: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
    zIndex: 1,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  itemDate: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  deleteBtn: {
    padding: 13,
    marginLeft: 4,
  },
  itemTitleCompleted: {
    color: theme.textSecondary,
  },
  completedBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(0,196,154,0.15)",
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.grassFilled,
  },
});
