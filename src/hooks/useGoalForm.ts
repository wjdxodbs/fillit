import { useCallback, useMemo, useState } from "react";
import { Alert, Keyboard } from "react-native";
import type { SavedDate } from "../types";
import { toDateStr, parseDateStr } from "../utils/dateUtils";

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
  const [picker, setPicker] = useState<{
    show: false | "base" | "target";
    viewYear: number;
    viewMonth: number;
  }>({ show: false, viewYear: today.getFullYear(), viewMonth: today.getMonth() });

  const setTitle = (v: string) => setForm((prev) => ({ ...prev, title: v }));

  const canGoPrevMonth =
    picker.viewYear > today.getFullYear() ||
    (picker.viewYear === today.getFullYear() && picker.viewMonth > today.getMonth());
  const canGoNextMonth =
    picker.viewYear < oneYearLater.getFullYear() ||
    (picker.viewYear === oneYearLater.getFullYear() &&
      picker.viewMonth < oneYearLater.getMonth());

  const openAdd = useCallback(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setToday(t);
    setEditingId(null);
    setForm({ title: "", baseDate: toDateStr(t), targetDate: "" });
    setPicker({ show: false, viewYear: t.getFullYear(), viewMonth: t.getMonth() });
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((item: SavedDate) => {
    const base = new Date(item.baseDate + "T12:00:00");
    base.setHours(0, 0, 0, 0);
    const minDate = base < new Date() ? base : new Date();
    minDate.setHours(0, 0, 0, 0);
    setToday(minDate);
    setEditingId(item.id);
    setForm({ title: item.title, baseDate: item.baseDate, targetDate: item.targetDate });
    const { year, month } = parseDateStr(item.baseDate);
    setPicker({ show: false, viewYear: year, viewMonth: month });
    setModalVisible(true);
  }, []);

  const closeModal = () => {
    if (isSaving) return;
    setModalVisible(false);
  };

  const goPrevMonth = useCallback(() => {
    setPicker((prev) => {
      if (prev.viewMonth === 0) return { ...prev, viewYear: prev.viewYear - 1, viewMonth: 11 };
      return { ...prev, viewMonth: prev.viewMonth - 1 };
    });
  }, []);

  const goNextMonth = useCallback(() => {
    setPicker((prev) => {
      if (prev.viewMonth === 11) return { ...prev, viewYear: prev.viewYear + 1, viewMonth: 0 };
      return { ...prev, viewMonth: prev.viewMonth + 1 };
    });
  }, []);

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

  const openBasePicker = () => {
    Keyboard.dismiss();
    if (form.baseDate) {
      const { year, month } = parseDateStr(form.baseDate);
      setPicker((prev) => ({ ...prev, show: "base", viewYear: year, viewMonth: month }));
    } else {
      setPicker((prev) => ({ ...prev, show: "base" }));
    }
  };

  const openTargetPicker = () => {
    Keyboard.dismiss();
    if (form.targetDate) {
      const { year, month } = parseDateStr(form.targetDate);
      setPicker((prev) => ({ ...prev, show: "target", viewYear: year, viewMonth: month }));
    } else if (form.baseDate) {
      const { year, month } = parseDateStr(form.baseDate);
      setPicker((prev) => ({ ...prev, show: "target", viewYear: year, viewMonth: month }));
    } else {
      setPicker((prev) => ({ ...prev, show: "target" }));
    }
  };

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
    [picker.show]
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
