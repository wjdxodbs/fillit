import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { SavedDate } from "../types";

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

  const [year, month, day] = goal.targetDate.split("-").map(Number);
  // 목표일 하루 전 오전 9시
  const notifDate = new Date(year, month - 1, day - 1, 9, 0, 0);

  if (notifDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: goal.id,
    content: {
      title: "목표일이 내일이에요!",
      body: `'${goal.title}' 목표일이 내일입니다.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifDate,
    },
  });
}

export async function cancelGoalReminder(goalId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(goalId).catch(() => {});
}

export async function rescheduleAllReminders(goals: SavedDate[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Promise.all(goals.map(scheduleGoalReminder));
}
