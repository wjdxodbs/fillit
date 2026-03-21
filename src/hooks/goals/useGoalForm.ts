import { useCallback, useMemo, useState } from "react";
import { Alert, Keyboard } from "react-native";
import type { SavedDate } from "../../types";
import { toDateStr, parseDateStr } from "../../utils/dateUtils";
import { useDatePickerState } from "./useDatePickerState";

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
  const [form, setForm] = useState({ title: "", baseDate: "", targetDate: "" });

  const { picker, setPicker, resetPicker, canGoPrevMonth, canGoNextMonth, goPrevMonth, goNextMonth } =
    useDatePickerState(today, oneYearLater);

  const setTitle = (v: string) => setForm((prev) => ({ ...prev, title: v }));

  const openAdd = useCallback(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setToday(t);
    setEditingId(null);
    setForm({ title: "", baseDate: toDateStr(t), targetDate: "" });
    resetPicker(t.getFullYear(), t.getMonth());
    setModalVisible(true);
  }, [resetPicker]);

  const openEdit = useCallback(
    (item: SavedDate) => {
      const base = new Date(item.baseDate + "T12:00:00");
      base.setHours(0, 0, 0, 0);
      const minDate = base < new Date() ? base : new Date();
      minDate.setHours(0, 0, 0, 0);
      setToday(minDate);
      setEditingId(item.id);
      setForm({ title: item.title, baseDate: item.baseDate, targetDate: item.targetDate });
      const { year, month } = parseDateStr(item.baseDate);
      resetPicker(year, month);
      setModalVisible(true);
    },
    [resetPicker]
  );

  const closeModal = () => {
    if (isSaving) return;
    setModalVisible(false);
  };

  const save = async () => {
    const { title, baseDate, targetDate } = form;
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
  };

  const openPickerFor = (show: "base" | "target", dateStr?: string) => {
    Keyboard.dismiss();
    if (dateStr) {
      const { year, month } = parseDateStr(dateStr);
      setPicker((prev) => ({ ...prev, show, viewYear: year, viewMonth: month }));
    } else {
      setPicker((prev) => ({ ...prev, show }));
    }
  };

  const openBasePicker = () => openPickerFor("base", form.baseDate);
  const openTargetPicker = () => openPickerFor("target", form.targetDate || form.baseDate);

  const onSelectDate = useCallback(
    (dateStr: string) => {
      Keyboard.dismiss();
      if (picker.show === "base") {
        const { year, month } = parseDateStr(dateStr);
        setForm((prev) => ({ ...prev, baseDate: dateStr }));
        setPicker({ show: "target", viewYear: year, viewMonth: month });
      } else {
        setForm((prev) => ({ ...prev, targetDate: dateStr }));
        setPicker((prev) => ({ ...prev, show: false }));
      }
    },
    [picker.show, setPicker]
  );

  let calendarMinDate: Date;
  if (picker.show === "base") calendarMinDate = today;
  else if (form.baseDate) calendarMinDate = new Date(form.baseDate + "T12:00:00");
  else calendarMinDate = today;

  let calendarMaxDate: Date;
  if (picker.show === "target") calendarMaxDate = oneYearLater;
  else if (form.targetDate) calendarMaxDate = new Date(form.targetDate + "T12:00:00");
  else calendarMaxDate = oneYearLater;

  const calendarSelectedDate = picker.show === "base" ? form.baseDate : form.targetDate;

  const canSave =
    form.title.trim().length > 0 &&
    form.targetDate.length > 0 &&
    form.baseDate <= form.targetDate;

  return {
    modalVisible,
    editingId,
    title: form.title,
    setTitle,
    baseDate: form.baseDate,
    targetDate: form.targetDate,
    canSave,
    isSaving,
    showDatePicker: picker.show,
    viewYear: picker.viewYear,
    viewMonth: picker.viewMonth,
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
