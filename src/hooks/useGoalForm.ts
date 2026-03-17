import { useCallback, useMemo, useState } from "react";
import { Keyboard } from "react-native";
import { toDateStr } from "../utils/dateUtils";

export function useGoalForm(
  add: (title: string, baseDate: string, targetDate: string) => Promise<unknown>
) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const oneYearLater = useMemo(
    () => new Date(today.getFullYear() + 1, today.getMonth(), 0),
    [today]
  );

  const [modalVisible, setModalVisible] = useState(false);
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
    setTitle("");
    setBaseDate(toDateStr(today));
    setTargetDate("");
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setShowDatePicker(false);
    setModalVisible(true);
  }, [today]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

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
    if (baseDate > targetDate) return;
    await add(title.trim(), baseDate, targetDate);
    closeModal();
  }, [title, baseDate, targetDate, add, closeModal]);

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
  const calendarSelectedDate = showDatePicker === "base" ? baseDate : targetDate;

  return {
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
    goPrevMonth,
    goNextMonth,
    openBasePicker,
    openTargetPicker,
    onSelectDate,
  };
}
