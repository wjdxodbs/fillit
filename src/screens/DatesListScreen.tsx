import React, { useCallback, useLayoutEffect, useMemo } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTodayStr } from "../hooks/useTodayStr";
import { useTheme } from "../stores/themeStore";
import { useSavedDates } from "../hooks/useSavedDates";
import { useGoalForm } from "../hooks/goals/useGoalForm";
import type { DatesStackParamList } from "../navigation/DatesStackScreen";
import type { SavedDate } from "../types";
import type { Theme } from "../theme";
import { GoalListItem } from "../components/goals/GoalListItem";
import { SkeletonGoalList } from "../components/goals/SkeletonGoalList";
import { AddEditGoalModal } from "../components/goals/AddEditGoalModal";
import { ScreenSeparator } from "../components/common/ScreenSeparator";

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    addBtn: {
      padding: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    list: {
      padding: 20,
      paddingBottom: 40,
    },
    emptyState: {
      alignItems: "center",
      marginTop: 60,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginTop: 8,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
    },
  });

type Props = NativeStackScreenProps<DatesStackParamList, "DatesList">;

export function DatesListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { dates, loading, add, update, remove } = useSavedDates();
  const todayStr = useTodayStr();

  const sortedDates = useMemo(() => {
    const isCompleted = (d: { targetDate: string }) => d.targetDate < todayStr;
    return [...dates].sort((a, b) => {
      const ac = isCompleted(a) ? 1 : 0;
      const bc = isCompleted(b) ? 1 : 0;
      if (ac !== bc) return ac - bc;
      return a.targetDate < b.targetDate ? -1 : a.targetDate > b.targetDate ? 1 : 0;
    });
  }, [dates, todayStr]);

  const { openAdd, openEdit, ...modalProps } = useGoalForm(add, update);

  const handleNavigate = useCallback(
    (item: SavedDate) => {
      navigation.navigate("DateDetail", {
        title: item.title,
        baseDate: item.baseDate,
        targetDate: item.targetDate,
      });
    },
    [navigation]
  );

  const handleEdit = useCallback((item: SavedDate) => openEdit(item), [openEdit]);

  const handleDelete = useCallback(
    (item: SavedDate) => {
      Alert.alert("목표 삭제", `'${item.title}'을 삭제할까요?`, [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () =>
            remove(item.id).catch(() =>
              Alert.alert("삭제 실패", "목표를 삭제하지 못했습니다. 다시 시도해주세요.")
            ),
        },
      ]);
    },
    [remove]
  );

  const renderItem = useCallback(
    ({ item }: { item: SavedDate }) => (
      <GoalListItem
        item={item}
        todayStr={todayStr}
        onPress={handleNavigate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [todayStr, handleNavigate, handleEdit, handleDelete]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "목표일 설정",
      headerRight: () => (
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={24} color={theme.grassFilled} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, openAdd, theme, styles.addBtn]);

  return (
    <View style={styles.container}>
      <ScreenSeparator />
      {loading ? (
        <SkeletonGoalList />
      ) : (
        <FlatList
          data={sortedDates}
          keyExtractor={(item) => item.id}
          removeClippedSubviews
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="flag-outline"
                size={48}
                color={theme.grassFilled}
                style={{ opacity: 0.5 }}
              />
              <Text style={styles.emptyTitle}>아직 목표일이 없어요</Text>
              <Text style={styles.emptySubtitle}>+ 버튼을 눌러 목표를 추가해보세요</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
      <AddEditGoalModal {...modalProps} />
    </View>
  );
}
