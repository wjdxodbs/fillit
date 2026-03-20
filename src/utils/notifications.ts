import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { SavedDate } from "../types";
import { parseDateStr } from "./dateUtils";

export async function setupNotificationChannel() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("goal-reminders", {
      name: "목표일 알림",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleGoalReminder(goal: SavedDate): Promise<void> {
  await cancelGoalReminder(goal.id);

  const { year, month, day } = parseDateStr(goal.targetDate);
  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayBeforeStart = new Date(year, month, day - 1);

  // D-1 오전 9시 알림: 오늘이 D-1 이전일 때만 등록
  if (todayStart < dayBeforeStart) {
    const dayBeforeNotif = new Date(year, month, day - 1, 9, 0, 0);
    await Notifications.scheduleNotificationAsync({
      identifier: goal.id + "_d1",
      content: {
        title: "목표일이 내일이에요!",
        body: `'${goal.title}' 목표일이 내일입니다.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dayBeforeNotif,
      },
    });
  }

  // D-day 오전 9시 알림
  const ddayNotif = new Date(year, month, day, 9, 0, 0);
  if (ddayNotif > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: goal.id + "_dday",
      content: {
        title: "오늘이 목표일이에요!",
        body: `'${goal.title}' 목표일 당일입니다.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: ddayNotif,
      },
    });
  }
}

export async function cancelGoalReminder(goalId: string): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(goalId + "_d1").catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(goalId + "_dday").catch(() => {}),
  ]);
}

export async function rescheduleAllReminders(goals: SavedDate[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Promise.all(goals.map(scheduleGoalReminder));
}
