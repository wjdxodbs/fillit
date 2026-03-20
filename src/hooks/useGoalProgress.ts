import { useMemo } from "react";
import { getDaysBetween, getElapsedDays, calcProgress } from "../utils/dateUtils";

export function useGoalProgress(baseDate: string, targetDate: string, todayStr: string) {
  return useMemo(() => {
    const totalDays = getDaysBetween(baseDate, targetDate);
    const elapsedDays = getElapsedDays(baseDate, targetDate, totalDays, todayStr);
    const isCompleted = todayStr > targetDate;
    const progressPercent = calcProgress(elapsedDays, totalDays);
    return { totalDays, elapsedDays, isCompleted, progressPercent };
  }, [baseDate, targetDate, todayStr]);
}
