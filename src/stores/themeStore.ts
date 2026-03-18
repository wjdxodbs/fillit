import { useMemo } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { darkTheme, lightTheme, type Theme } from "../theme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeMode: "system",
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "app_theme_mode",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useTheme(): {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
} {
  const { themeMode, setThemeMode } = useThemeStore();
  const systemScheme = useColorScheme();

  const { theme, isDark } = useMemo(() => {
    const resolved =
      themeMode === "system"
        ? systemScheme === "light"
          ? "light"
          : "dark"
        : themeMode;
    const isDark = resolved === "dark";
    return { theme: isDark ? darkTheme : lightTheme, isDark };
  }, [themeMode, systemScheme]);

  return { theme, themeMode, isDark, setThemeMode };
}
