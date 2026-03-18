import { useCallback, useMemo, useState } from "react";
import { Alert, Keyboard } from "react-native";
import type { SavedDate } from "../types";
import { toDateStr } from "../utils/dateUtils";

export function useGoalForm(
  add: (title: string, baseDate: string, targetDate: string) => Promise<unknown>,
  update: (id: string, title: string, baseDate: string, targetDate: string) => Promise<unknown>
) {
  const [today, setToday] = useState(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  });

  const oneYearLater = useMemo(
    () => new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
    [today]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState<false | "base" | "target">(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const canGoPrevMonth =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const canGoNextMonth =
    viewYear < oneYearLater.getFullYear() ||
    (viewYear === oneYearLater.getFullYear() &&
      viewMonth < oneYearLater.getMonth());

  const openAdd = useCallback(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setToday(t);
    setEditingId(null);
    setTitle("");
    setBaseDate(toDateStr(t));
    setTargetDate("");
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setShowDatePicker(false);
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((item: SavedDate) => {
    const base = new Date(item.baseDate + "T12:00:00");
    base.setHours(0, 0, 0, 0);
    const minDate = base < new Date() ? base : new Date();
    minDate.setHours(0, 0, 0, 0);
    setToday(minDate);
    setEditingId(item.id);
    setTitle(item.title);
    setBaseDate(item.baseDate);
    setTargetDate(item.targetDate);
    const [y, m] = item.baseDate.split("-").map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    setShowDatePicker(false);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    if (isSaving) return;
    setModalVisible(false);
  }, [isSaving]);

  const goPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const save = useCallback(async () => {
    if (!title.trim() || !baseDate.trim() || !targetDate.trim()) return;
    if (baseDate > targetDate) {
      Alert.alert("날짜 오류", "목표 날짜는 기준 날짜 이후여야 합니다.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await update(editingId, title.trim(), baseDate, targetDate);
      } else {
        await add(title.trim(), baseDate, targetDate);
      }
      setModalVisible(false);
    } catch {
      Alert.alert("저장 실패", "목표를 저장하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  }, [title, baseDate, targetDate, editingId, add, update]);

  const openBasePicker = useCallback(() => {
    Keyboard.dismiss();
    if (baseDate) {
      const [y, m] = baseDate.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
    setShowDatePicker("base");
  }, [baseDate]);

  const openTargetPicker = useCallback(() => {
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
  }, [targetDate, baseDate]);

  const onSelectDate = useCallback(
    (dateStr: string) => {
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
    },
    [showDatePicker]
  );

  let calendarMinDate: Date;
  if (showDatePicker === "base") calendarMinDate = today;
  else if (baseDate) calendarMinDate = new Date(baseDate + "T12:00:00");
  else calendarMinDate = today;

  let calendarMaxDate: Date;
  if (showDatePicker === "target") calendarMaxDate = oneYearLater;
  else if (targetDate) calendarMaxDate = new Date(targetDate + "T12:00:00");
  else calendarMaxDate = oneYearLater;
  const calendarSelectedDate = showDatePicker === "base" ? baseDate : targetDate;

  const canSave =
    title.trim().length > 0 &&
    targetDate.length > 0 &&
    baseDate <= targetDate;

  return {
    modalVisible,
    editingId,
    title,
    setTitle,
    baseDate,
    targetDate,
    canSave,
    isSaving,
    showDatePicker,
    viewYear,
    viewMonth,
    canGoPrevMonth,
    canGoNextMonth,
    calendarMinDate,
    calendarMaxDate,
    calendarSelectedDate,
    openAdd,
    openEdit,
    closeModal,
    save,
    goPrevMonth,
    goNextMonth,
    openBasePicker,
    openTargetPicker,
    onSelectDate,
  };
}
