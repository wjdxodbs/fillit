import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, type ThemeMode } from "../stores/themeStore";
import { useBottomSheet } from "../hooks/useBottomSheet";
import { BottomSheet } from "./BottomSheet";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const MODES: { mode: ThemeMode; label: string; icon: IoniconName }[] = [
  { mode: "light", label: "라이트", icon: "sunny" },
  { mode: "dark", label: "다크", icon: "moon" },
  { mode: "system", label: "시스템", icon: "phone-portrait" },
];

const TRIGGER_ICONS: Record<ThemeMode, IoniconName> = {
  light: "sunny-outline",
  dark: "moon-outline",
  system: "phone-portrait-outline",
};

export const ThemeSelector = React.memo(function ThemeSelector() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { visible, setVisible, close, backdropOpacity, sheetTranslateY } = useBottomSheet();

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={TRIGGER_ICONS[themeMode]} size={22} color={theme.textSecondary} />
      </TouchableOpacity>

      <BottomSheet
        visible={visible}
        backdropOpacity={backdropOpacity}
        sheetTranslateY={sheetTranslateY}
        onClose={() => close()}
      >
        <Text style={[styles.title, { color: theme.text }]}>테마</Text>
        {MODES.map(({ mode, label, icon }, i) => {
          const active = themeMode === mode;
          return (
            <React.Fragment key={mode}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              <TouchableOpacity
                style={styles.option}
                onPress={() => close(() => setThemeMode(mode))}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={active ? theme.grassFilled : theme.textSecondary}
                  style={styles.optionIcon}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    { color: active ? theme.grassFilled : theme.text },
                  ]}
                >
                  {label}
                </Text>
                {active && (
                  <Ionicons name="checkmark" size={18} color={theme.grassFilled} />
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </BottomSheet>
    </>
  );
});

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
  },
});
