import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
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
import { getDaysBetween, getElapsedDays, formatDate, toDateStr, calcProgress } from "../utils/dateUtils";

interface GoalListItemProps {
  item: SavedDate;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalListItem({ item, onPress, onEdit, onDelete }: GoalListItemProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (menuVisible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [menuVisible, backdropOpacity, sheetTranslateY]);

  const closeSheet = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 300, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setMenuVisible(false);
      callback?.();
    });
  }, [backdropOpacity, sheetTranslateY]);

  const totalDays = getDaysBetween(item.baseDate, item.targetDate);
  const todayStr = toDateStr(new Date());
  const isCompleted = todayStr > item.targetDate;
  const elapsedDays = getElapsedDays(item.baseDate, item.targetDate, totalDays, todayStr);
  const progressPercent = calcProgress(elapsedDays, totalDays);

  return (
    <>
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
            setMenuVisible(true);
          }}
          style={styles.moreBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </Pressable>

      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={() => closeSheet()}
        statusBarTranslucent
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeSheet()} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity
            style={styles.sheetAction}
            onPress={() => closeSheet(onEdit)}
          >
            <Text style={styles.sheetActionEdit}>수정</Text>
          </TouchableOpacity>
          <View style={styles.sheetDivider} />
          <TouchableOpacity
            style={styles.sheetAction}
            onPress={() => closeSheet(onDelete)}
          >
            <Text style={styles.sheetActionDelete}>삭제</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
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
  moreBtn: {
    padding: 8,
    marginLeft: 4,
    zIndex: 1,
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 16,
  },
  sheetAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: theme.border,
  },
  sheetActionEdit: {
    fontSize: 16,
    color: theme.text,
    fontWeight: "500",
  },
  sheetActionDelete: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "500",
  },
});
