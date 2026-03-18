import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  Animated,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTodayStr } from "../hooks/useTodayStr";
import { useTheme } from "../stores/themeStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DatesStackParamList } from "../navigation/DatesStackScreen";
import { Ionicons } from "@expo/vector-icons";
import { useSavedDates } from "../hooks/useSavedDates";
import type { SavedDate } from "../types";
import { useGoalForm } from "../hooks/useGoalForm";
import { SimpleCalendar } from "../components/SimpleCalendar";
import { GoalListItem } from "../components/GoalListItem";
import { type Theme } from "../theme";
import { formatDate } from "../utils/dateUtils";

function SkeletonItem({ opacity, theme }: { opacity: Animated.Value; theme: Theme }) {
  const skeletonStyles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          backgroundColor: theme.surface,
          borderRadius: 12,
          paddingVertical: 18,
          paddingHorizontal: 16,
          marginBottom: 10,
        },
        titleBar: {
          height: 14,
          width: "60%",
          backgroundColor: theme.border,
          borderRadius: 6,
          marginBottom: 8,
        },
        dateBar: {
          height: 11,
          width: "40%",
          backgroundColor: theme.border,
          borderRadius: 6,
        },
      }),
    [theme]
  );
  return (
    <Animated.View style={[skeletonStyles.item, { opacity }]}>
      <View style={skeletonStyles.titleBar} />
      <View style={skeletonStyles.dateBar} />
    </Animated.View>
  );
}

function SkeletonList() {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return (
    <View style={{ padding: 20 }}>
      {[0, 1].map((i) => (
        <SkeletonItem key={i} opacity={opacity} theme={theme} />
      ))}
    </View>
  );
}

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
    separator: {
      height: 1,
      backgroundColor: theme.border,
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
    modalTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
      marginBottom: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modal: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
    },
    input: {
      backgroundColor: "transparent",
      paddingVertical: 14,
      paddingHorizontal: 0,
      fontSize: 16,
      color: theme.text,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 14,
    },
    dateArrowWrap: {
      width: 20,
      flexShrink: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    dateButton: {
      backgroundColor: "transparent",
      paddingVertical: 4,
      paddingHorizontal: 8,
      justifyContent: "center",
      borderRadius: 8,
    },
    dateButtonFocused: {
      backgroundColor: theme.background,
      borderRadius: 8,
    },
    dateButtonHalf: {
      flex: 1,
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.text,
    },
    dateButtonPlaceholder: {
      color: theme.textSecondary,
    },
    datePickerContainer: {
      marginBottom: 12,
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelBtn: {
      backgroundColor: theme.backgroundSecondary,
    },
    cancelBtnText: {
      color: theme.textSecondary,
    },
    saveBtn: {
      backgroundColor: theme.grassFilled,
    },
    saveBtnDisabled: {
      opacity: 0.4,
    },
    saveBtnText: {
      color: "#fff",
      fontWeight: "600",
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
  const {
    modalVisible,
    title,
    setTitle,
    baseDate,
    targetDate,
    showDatePicker,
    viewYear,
    viewMonth,
    canGoPrevMonth,
    canGoNextMonth,
    calendarMinDate,
    calendarMaxDate,
    calendarSelectedDate,
    editingId,
    openAdd,
    openEdit,
    closeModal,
    save,
    canSave,
    isSaving,
    goPrevMonth,
    goNextMonth,
    openBasePicker,
    openTargetPicker,
    onSelectDate,
  } = useGoalForm(add, update);

  const handleNavigate = useCallback((item: SavedDate) => {
    navigation.navigate("DateDetail", {
      title: item.title,
      baseDate: item.baseDate,
      targetDate: item.targetDate,
    });
  }, [navigation]);

  const handleEdit = useCallback((item: SavedDate) => openEdit(item), [openEdit]);

  const handleDelete = useCallback((item: SavedDate) => {
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
  }, [remove]);

  const renderItem = useCallback(({ item }: { item: SavedDate }) => (
    <GoalListItem
      item={item}
      todayStr={todayStr}
      onPress={handleNavigate}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ), [todayStr, handleNavigate, handleEdit, handleDelete]);

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
      <View style={styles.separator} />
      {loading ? (
        <SkeletonList />
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
              <Text style={styles.emptySubtitle}>
                + 버튼을 눌러 목표를 추가해보세요
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          enabled={false}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeModal}
          />
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{editingId ? "목표 수정" : "목표 추가"}</Text>
            <TextInput
              style={styles.input}
              placeholder="제목"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={30}
            />
            <View style={styles.dateRow}>
              <Pressable
                style={[
                  styles.dateButton,
                  styles.dateButtonHalf,
                  showDatePicker === "base" && styles.dateButtonFocused,
                ]}
                onPress={openBasePicker}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    !baseDate && styles.dateButtonPlaceholder,
                  ]}
                >
                  {baseDate ? formatDate(baseDate) : "기준 날짜"}
                </Text>
              </Pressable>
              <View style={styles.dateArrowWrap}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={theme.textSecondary}
                />
              </View>
              <Pressable
                style={[
                  styles.dateButton,
                  styles.dateButtonHalf,
                  showDatePicker === "target" && styles.dateButtonFocused,
                ]}
                onPress={openTargetPicker}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    !targetDate && styles.dateButtonPlaceholder,
                  ]}
                >
                  {targetDate ? formatDate(targetDate) : "목표 날짜"}
                </Text>
              </Pressable>
            </View>
            {showDatePicker && (
              <View style={styles.datePickerContainer}>
                <SimpleCalendar
                  year={viewYear}
                  month={viewMonth}
                  minimumDate={calendarMinDate}
                  maximumDate={calendarMaxDate}
                  selectedDate={calendarSelectedDate}
                  onSelectDate={onSelectDate}
                  onPrevMonth={goPrevMonth}
                  onNextMonth={goNextMonth}
                  canGoPrev={canGoPrevMonth}
                  canGoNext={canGoNextMonth}
                />
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={closeModal}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn, (!canSave || isSaving) && styles.saveBtnDisabled]}
                onPress={save}
                disabled={!canSave || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
