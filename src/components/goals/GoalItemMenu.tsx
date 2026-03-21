import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Animated } from "react-native";
import { useTheme } from "../../stores/themeStore";
import type { Theme } from "../../theme";
import { BottomSheet } from "../common/BottomSheet";

interface Props {
  title: string;
  visible: boolean;
  backdropOpacity: Animated.Value;
  sheetTranslateY: Animated.Value;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
      color: theme.danger,
      fontWeight: "500",
    },
  });

export function GoalItemMenu({
  title,
  visible,
  backdropOpacity,
  sheetTranslateY,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BottomSheet
      visible={visible}
      backdropOpacity={backdropOpacity}
      sheetTranslateY={sheetTranslateY}
      onClose={onClose}
    >
      <Text style={styles.sheetTitle} numberOfLines={1}>{title}</Text>
      <TouchableOpacity style={styles.sheetAction} onPress={onEdit}>
        <Text style={styles.sheetActionEdit}>수정</Text>
      </TouchableOpacity>
      <View style={styles.sheetDivider} />
      <TouchableOpacity style={styles.sheetAction} onPress={onDelete}>
        <Text style={styles.sheetActionDelete}>삭제</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}
