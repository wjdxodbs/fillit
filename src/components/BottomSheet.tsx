import React, { useMemo } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../stores/themeStore";
import type { Theme } from "../theme";

interface Props {
  visible: boolean;
  backdropOpacity: Animated.Value;
  sheetTranslateY: Animated.Value;
  onClose: () => void;
  children: React.ReactNode;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: 32,
      paddingTop: 12,
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: theme.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 16,
    },
  });

export function BottomSheet({ visible, backdropOpacity, sheetTranslateY, onClose, children }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  );
}
