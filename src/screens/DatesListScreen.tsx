import React, { useCallback, useMemo, useState } from "react";
import {
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSavedDates } from "../hooks/useSavedDates";
import { useGoalForm } from "../hooks/useGoalForm";
import { SimpleCalendar } from "../components/SimpleCalendar";
import { GoalListItem } from "../components/GoalListItem";
import { theme } from "../theme";
import { formatDate, toDateStr } from "../utils/dateUtils";

export function DatesListScreen({
  navigation,
}: {
  navigation: {
    navigate: (
      name: string,
      params: { title: string; baseDate: string; targetDate: string }
    ) => void;
  };
}) {
  const insets = useSafeAreaInsets();
  const { dates, loading, add, remove } = useSavedDates();
  const [todayStr, setTodayStr] = useState(() => toDateStr(new Date()));
  useFocusEffect(
    useCallback(() => {
      setTodayStr(toDateStr(new Date()));
    }, [])
  );
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
    openAdd,
    closeModal,
    save,
    canSave,
    goPrevMonth,
    goNextMonth,
    openBasePicker,
    openTargetPicker,
    onSelectDate,
  } = useGoalForm(add);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Text style={styles.headerTitle}>목표일 설정</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={24} color={theme.grassFilled} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text style={styles.loading}>불러오는 중...</Text>
      ) : (
        <FlatList
          data={sortedDates}
          keyExtractor={(item) => item.id}
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
          renderItem={({ item }) => (
            <GoalListItem
              item={item}
              onPress={() =>
                navigation.navigate("DateDetail", {
                  title: item.title,
                  baseDate: item.baseDate,
                  targetDate: item.targetDate,
                })
              }
              onDelete={() =>
                Alert.alert("목표 삭제", `'${item.title}'을 삭제할까요?`, [
                  { text: "취소", style: "cancel" },
                  {
                    text: "삭제",
                    style: "destructive",
                    onPress: () => remove(item.id),
                  },
                ])
              }
            />
          )}
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
            <Text style={styles.modalTitle}>목표 추가</Text>
            <TextInput
              style={styles.input}
              placeholder="제목"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
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
                style={[styles.modalBtn, styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                onPress={save}
                disabled={!canSave}
              >
                <Text style={styles.saveBtnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text,
  },
  addBtn: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  loading: {
    color: theme.textSecondary,
    textAlign: "center",
    marginTop: 40,
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
