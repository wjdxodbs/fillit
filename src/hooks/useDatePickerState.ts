import { useCallback, useState } from "react";

interface PickerState {
  show: false | "base" | "target";
  viewYear: number;
  viewMonth: number;
}

export function useDatePickerState(today: Date, oneYearLater: Date) {
  const [picker, setPicker] = useState<PickerState>({
    show: false,
    viewYear: today.getFullYear(),
    viewMonth: today.getMonth(),
  });

  const canGoPrevMonth =
    picker.viewYear > today.getFullYear() ||
    (picker.viewYear === today.getFullYear() && picker.viewMonth > today.getMonth());

  const canGoNextMonth =
    picker.viewYear < oneYearLater.getFullYear() ||
    (picker.viewYear === oneYearLater.getFullYear() &&
      picker.viewMonth < oneYearLater.getMonth());

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

  const resetPicker = useCallback((year: number, month: number) => {
    setPicker({ show: false, viewYear: year, viewMonth: month });
  }, []);

  return {
    picker,
    setPicker,
    resetPicker,
    canGoPrevMonth,
    canGoNextMonth,
    goPrevMonth,
    goNextMonth,
  };
}
