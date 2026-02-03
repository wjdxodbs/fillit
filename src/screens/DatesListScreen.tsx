import React, { useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSavedDates } from "../hooks/useSavedDates";
import { theme } from "../theme";
import type { SavedDate } from "../types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CALENDAR_WEEKS = 6;
const CALENDAR_ROW_HEIGHT = 36;
const CALENDAR_ROW_GAP = 4;
const CALENDAR_GRID_HEIGHT =
  CALENDAR_WEEKS * (CALENDAR_ROW_HEIGHT + CALENDAR_ROW_GAP) - CALENDAR_ROW_GAP;
const CALENDAR_HEADER_HEIGHT = 44;
const CALENDAR_WEEKDAY_ROW_HEIGHT = 28;
const CALENDAR_TOTAL_HEIGHT =
  CALENDAR_HEADER_HEIGHT +
  12 +
  CALENDAR_WEEKDAY_ROW_HEIGHT +
  CALENDAR_ROW_GAP +
  CALENDAR_GRID_HEIGHT;

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일`;
}

function getDaysBetween(baseStr: string, targetStr: string): number {
  const a = new Date(baseStr + "T12:00:00");
  const b = new Date(targetStr + "T12:00:00");
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function SimpleCalendar({
  year,
  month,
  minimumDate,
  maximumDate,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  canGoPrev,
  canGoNext,
}: {
  year: number;
  month: number;
  minimumDate: Date;
  maximumDate?: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}) {
  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const daysInMonth = last.getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length < CALENDAR_WEEKS * 7) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < CALENDAR_WEEKS * 7; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [year, month]);

  const dateStr = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const isSelectable = (day: number | null) => {
    if (day === null) return false;
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = d.getTime();
    if (t < minimumDate.getTime()) return false;
    if (maximumDate && t > maximumDate.getTime()) return false;
    return true;
  };

  const isSelected = (day: number | null) =>
    day !== null && selectedDate === dateStr(day);

  return (
    <View style={calendarStyles.wrap}>
      <View style={calendarStyles.header}>
        <TouchableOpacity
          onPress={onPrevMonth}
          disabled={!canGoPrev}
          style={calendarStyles.navBtn}
        >
          <Text
            style={[
              calendarStyles.navText,
              !canGoPrev && calendarStyles.navDisabled,
            ]}
          >
            ‹
          </Text>
        </TouchableOpacity>
        <Text style={calendarStyles.monthTitle}>
          {year}년 {month + 1}월
        </Text>
        <TouchableOpacity
          onPress={onNextMonth}
          disabled={!canGoNext}
          style={calendarStyles.navBtn}
        >
          <Text
            style={[
              calendarStyles.navText,
              !canGoNext && calendarStyles.navDisabled,
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>
      <View style={calendarStyles.weekdayRow}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={calendarStyles.weekdayCell}>
            <Text style={calendarStyles.weekdayText}>{w}</Text>
          </View>
        ))}
      </View>
      <View style={calendarStyles.gridBody}>
        {weeks.map((row, ri) => (
          <View key={ri} style={calendarStyles.weekRow}>
            {row.map((day, ci) => {
              const selectable = isSelectable(day);
              const selected = isSelected(day);
              return (
                <TouchableOpacity
                  key={ci}
                  style={[
                    calendarStyles.dayCell,
                    !selectable && calendarStyles.dayCellDisabled,
                  ]}
                  onPress={() => {
                    if (day !== null && selectable) {
                      onSelectDate(dateStr(day));
                    }
                  }}
                  disabled={!selectable}
                >
                  <View
                    style={[
                      calendarStyles.dayCellInner,
                      selected && calendarStyles.dayCellInnerSelected,
                    ]}
                  >
                    <Text
                      style={[
                        calendarStyles.dayText,
                        !selectable && calendarStyles.dayTextDisabled,
                        selected && calendarStyles.dayTextSelected,
                      ]}
                      numberOfLines={1}
                      allowFontScaling={false}
                    >
                      {day ?? ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const MIN_DAY_CELL_WIDTH = 32;
const CALENDAR_MIN_WIDTH = 7 * MIN_DAY_CELL_WIDTH;

const calendarStyles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    height: CALENDAR_TOTAL_HEIGHT,
    minWidth: CALENDAR_MIN_WIDTH,
  },
  gridBody: {
    height: CALENDAR_GRID_HEIGHT,
    overflow: "visible",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: CALENDAR_HEADER_HEIGHT,
    marginBottom: 12,
  },
  navBtn: { padding: 8 },
  navText: { fontSize: 22, color: theme.text, fontWeight: "600" },
  navDisabled: { color: theme.textSecondary, opacity: 0.5 },
  monthTitle: { fontSize: 16, fontWeight: "600", color: theme.text },
  weekRow: {
    flexDirection: "row",
    height: CALENDAR_ROW_HEIGHT,
    marginBottom: CALENDAR_ROW_GAP,
    overflow: "visible",
  },
  weekdayRow: {
    flexDirection: "row",
    height: CALENDAR_WEEKDAY_ROW_HEIGHT,
    marginBottom: CALENDAR_ROW_GAP,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: { fontSize: 12, color: theme.textSecondary, fontWeight: "600" },
  dayCell: {
    flex: 1,
    minWidth: MIN_DAY_CELL_WIDTH,
    height: CALENDAR_ROW_HEIGHT,
    maxHeight: CALENDAR_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellDisabled: {},
  dayCellInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellInnerSelected: {
    backgroundColor: theme.grassFilled,
  },
  dayText: {
    fontSize: 13,
    color: theme.text,
    textAlign: "center",
  },
  dayTextDisabled: { color: theme.textSecondary, opacity: 0.4 },
  dayTextSelected: { color: "#fff", fontWeight: "600" },
});

function ListItem({
  item,
  onPress,
  onDelete,
}: {
  item: SavedDate;
  onPress: () => void;
  onDelete: () => void;
}) {
  const totalDays = getDaysBetween(item.baseDate, item.targetDate);
  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(t.getDate()).padStart(2, "0")}`;
  }, []);
  const base = new Date(item.baseDate + "T12:00:00");
  const target = new Date(item.targetDate + "T12:00:00");
  const today = new Date(todayStr + "T12:00:00");
  base.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const baseTime = base.getTime();
  const targetTime = target.getTime();
  const todayTime = today.getTime();
  let elapsedDays = 0;
  if (todayTime < baseTime) elapsedDays = 0;
  else if (todayTime > targetTime) elapsedDays = totalDays;
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
          {formatDisplayDate(item.baseDate)} ~{" "}
          {formatDisplayDate(item.targetDate)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={22} color={theme.textSecondary} />
      </TouchableOpacity>
    </Pressable>
  );
}

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
  const sortedDates = useMemo(
    () =>
      [...dates].sort((a, b) =>
        a.targetDate < b.targetDate ? -1 : a.targetDate > b.targetDate ? 1 : 0
      ),
    [dates]
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState<
    false | "base" | "target"
  >(false);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const currentYear = today.getFullYear();
  // 오늘(예: 2월) 기준 → 다음 해 같은 달 전월까지 (27년 1월까지)
  const oneYearLater = useMemo(
    () => new Date(today.getFullYear() + 1, today.getMonth(), 0),
    [today]
  );

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const canGoPrevMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const canGoNextMonth =
    viewYear < oneYearLater.getFullYear() ||
    (viewYear === oneYearLater.getFullYear() &&
      viewMonth < oneYearLater.getMonth());

  const openAdd = () => {
    const todayStr = `${currentYear}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
    setTitle("");
    setBaseDate(todayStr);
    setTargetDate("");
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setShowDatePicker(false);
    setModalVisible(true);
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const save = async () => {
    if (!title.trim() || !baseDate.trim() || !targetDate.trim()) return;
    if (baseDate > targetDate) return;
    await add(title.trim(), baseDate, targetDate);
    setModalVisible(false);
  };

  const calendarMinDate =
    showDatePicker === "base"
      ? today
      : baseDate
      ? new Date(baseDate + "T12:00:00")
      : today;
  const calendarMaxDate =
    showDatePicker === "target"
      ? oneYearLater
      : targetDate
      ? new Date(targetDate + "T12:00:00")
      : oneYearLater;
  const calendarSelectedDate =
    showDatePicker === "base" ? baseDate : targetDate;
  const setCalendarSelectedDate =
    showDatePicker === "base" ? setBaseDate : setTargetDate;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Text style={styles.headerTitle}>목표일 설정</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={20} color="#fff" />
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
            <Text style={styles.empty}>목표일 설정이 없습니다.</Text>
          }
          renderItem={({ item }) => (
            <ListItem
              item={item}
              onPress={() =>
                navigation.navigate("DateDetail", {
                  title: item.title,
                  baseDate: item.baseDate,
                  targetDate: item.targetDate,
                })
              }
              onDelete={() => remove(item.id)}
            />
          )}
        />
      )}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          enabled={false}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
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
                onPress={() => {
                  Keyboard.dismiss();
                  const dateStr =
                    baseDate ||
                    `${currentYear}-${String(today.getMonth() + 1).padStart(
                      2,
                      "0"
                    )}-${String(today.getDate()).padStart(2, "0")}`;
                  if (baseDate) {
                    const [y, m] = dateStr.split("-").map(Number);
                    setViewYear(y);
                    setViewMonth(m - 1);
                  }
                  setShowDatePicker("base");
                }}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    !baseDate && styles.dateButtonPlaceholder,
                  ]}
                >
                  {baseDate ? formatDisplayDate(baseDate) : "기준 날짜"}
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
                onPress={() => {
                  Keyboard.dismiss();
                  if (targetDate) {
                    const [y, m] = targetDate.split("-").map(Number);
                    setViewYear(y);
                    setViewMonth(m - 1);
                  } else if (baseDate) {
                    const [y, m] = baseDate.split("-").map(Number);
                    setViewYear(y);
                    setViewMonth(m - 1);
                  }
                  setShowDatePicker("target");
                }}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    !targetDate && styles.dateButtonPlaceholder,
                  ]}
                >
                  {targetDate ? formatDisplayDate(targetDate) : "목표 날짜"}
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
                  onSelectDate={(dateStr) => {
                    Keyboard.dismiss();
                    if (showDatePicker === "base") {
                      setBaseDate(dateStr);
                      const [y, m] = dateStr.split("-").map(Number);
                      setViewYear(y);
                      setViewMonth(m - 1);
                      setShowDatePicker("target");
                    } else {
                      setTargetDate(dateStr);
                      setShowDatePicker(false);
                    }
                  }}
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
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={save}
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
    padding: 6,
    backgroundColor: theme.grassFilled,
    borderRadius: 6,
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
  empty: {
    color: theme.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
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
    padding: 8,
    marginLeft: 4,
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
  saveBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
