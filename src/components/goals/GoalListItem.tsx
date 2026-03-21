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
import { useTheme } from "../../stores/themeStore";
import { type Theme } from "../../theme";
import type { SavedDate } from "../../types";
import { formatDateRange } from "../../utils/dateUtils";
import { useBottomSheet } from "../../hooks/useBottomSheet";
import { useGoalProgress } from "../../hooks/goals/useGoalProgress";
import { GoalItemMenu } from "./GoalItemMenu";

const PROGRESS_GRADIENT_COLORS = ["rgba(0,196,154,0.35)", "rgba(0,100,80,0.4)"] as const;
const COMPLETED_BADGE_BG = "rgba(0,196,154,0.15)";

interface GoalListItemProps {
  item: SavedDate;
  todayStr: string;
  onPress: (item: SavedDate) => void;
  onEdit: (item: SavedDate) => void;
  onDelete: (item: SavedDate) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
      backgroundColor: COMPLETED_BADGE_BG,
      borderRadius: 6,
    },
    completedBadgeText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.grassFilled,
    },
  });

export const GoalListItem = React.memo(function GoalListItem({
  item,
  todayStr,
  onPress,
  onEdit,
  onDelete,
}: GoalListItemProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { visible: menuVisible, setVisible: setMenuVisible, close: closeSheet, backdropOpacity, sheetTranslateY } =
    useBottomSheet();
  const { isCompleted, progressPercent } = useGoalProgress(item.baseDate, item.targetDate, todayStr);

  return (
    <>
      <Pressable style={[styles.item, isCompleted && styles.itemCompleted]} onPress={() => onPress(item)}>
        <View style={styles.itemProgressBgWrap}>
          <LinearGradient
            colors={PROGRESS_GRADIENT_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.itemProgressBg, { width: `${Math.min(100, progressPercent)}%` }]}
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
            {formatDateRange(item.baseDate, item.targetDate)}
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

      <GoalItemMenu
        title={item.title}
        visible={menuVisible}
        backdropOpacity={backdropOpacity}
        sheetTranslateY={sheetTranslateY}
        onClose={() => closeSheet()}
        onEdit={() => closeSheet(() => onEdit(item))}
        onDelete={() => closeSheet(() => onDelete(item))}
      />
    </>
  );
});
