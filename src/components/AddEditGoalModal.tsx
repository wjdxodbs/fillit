import React, { useMemo } from "react";
import {
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../stores/themeStore";
import { SimpleCalendar } from "./SimpleCalendar";
import { formatDate } from "../utils/dateUtils";
import type { Theme } from "../theme";

interface Props {
  modalVisible: boolean;
  editingId: string | null;
  title: string;
  setTitle: (v: string) => void;
  baseDate: string;
  targetDate: string;
  showDatePicker: false | "base" | "target";
  viewYear: number;
  viewMonth: number;
  canGoPrevMonth: boolean;
  canGoNextMonth: boolean;
  calendarMinDate: Date;
  calendarMaxDate: Date;
  calendarSelectedDate: string;
  closeModal: () => void;
  save: () => void;
  canSave: boolean;
  isSaving: boolean;
  goPrevMonth: () => void;
  goNextMonth: () => void;
  openBasePicker: () => void;
  openTargetPicker: () => void;
  onSelectDate: (dateStr: string) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    modalTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      textAlign: "center",
      marginBottom: 16,
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

export function AddEditGoalModal({
  modalVisible,
  editingId,
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
  closeModal,
  save,
  canSave,
  isSaving,
  goPrevMonth,
  goNextMonth,
  openBasePicker,
  openTargetPicker,
  onSelectDate,
}: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
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
        <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
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
              <Text style={[styles.dateButtonText, !baseDate && styles.dateButtonPlaceholder]}>
                {baseDate ? formatDate(baseDate) : "기준 날짜"}
              </Text>
            </Pressable>
            <View style={styles.dateArrowWrap}>
              <Ionicons name="arrow-forward" size={16} color={theme.textSecondary} />
            </View>
            <Pressable
              style={[
                styles.dateButton,
                styles.dateButtonHalf,
                showDatePicker === "target" && styles.dateButtonFocused,
              ]}
              onPress={openTargetPicker}
            >
              <Text style={[styles.dateButtonText, !targetDate && styles.dateButtonPlaceholder]}>
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
            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closeModal}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                styles.saveBtn,
                (!canSave || isSaving) && styles.saveBtnDisabled,
              ]}
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
  );
}
