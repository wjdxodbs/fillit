import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { toDateStr } from "../utils/dateUtils";

/** 포커스될 때마다 오늘 날짜 문자열(YYYY-MM-DD)을 갱신한다. */
export function useTodayStr(): string {
  const [todayStr, setTodayStr] = useState(() => toDateStr(new Date()));
  useFocusEffect(
    useCallback(() => {
      setTodayStr(toDateStr(new Date()));
    }, [])
  );
  return todayStr;
}
