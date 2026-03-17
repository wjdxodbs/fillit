import React, { useMemo } from "react";
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
import { getDaysBetween, formatDate, toDateStr } from "../utils/dateUtils";

interface GoalListItemProps {
  item: SavedDate;
  onPress: () => void;
  onDelete: () => void;
}

export function GoalListItem({ item, onPress, onDelete }: GoalListItemProps) {
  const totalDays = getDaysBetween(item.baseDate, item.targetDate);
  const todayStr = useMemo(() => toDateStr(new Date()), []);
  let elapsedDays = 0;
  if (todayStr < item.baseDate) elapsedDays = 0;
  else if (todayStr > item.targetDate) elapsedDays = totalDays;
  else elapsedDays = getDaysBetween(item.baseDate, todayStr);
  const progressPercent =
    totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;

  return (
    <Pressable style={styles.item} onPress={onPress}>
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
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
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
});
