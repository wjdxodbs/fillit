import React from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, type ThemeMode } from "../stores/themeStore";
import { useBottomSheet } from "../hooks/useBottomSheet";

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

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => close()}
        statusBarTranslucent
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
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
        </Animated.View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
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
