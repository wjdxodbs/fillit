import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useGrassColor } from "../contexts/GrassColorContext";
import { theme } from "../theme";

/** 빨, 주, 보, 초, 파 (기본: 초록) */
const PRESET_COLORS = [
  "#f44336", // 빨강
  "#ff9800", // 주황
  "#9c27b0", // 보라
  "#4caf50", // 초록 (기본)
  "#2196f3", // 파랑
];

export function GrassColorPicker() {
  const { color, setColor } = useGrassColor();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        style={[styles.swatch, { backgroundColor: color }]}
        onPress={() => setVisible(true)}
        accessibilityLabel="잔디 색상 선택"
      />
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>잔디 색상</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.optionSwatch,
                    { backgroundColor: c },
                    color === c && styles.optionSwatchSelected,
                  ]}
                  onPress={() => {
                    setColor(c);
                    setVisible(false);
                  }}
                />
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 16,
    textAlign: "center",
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  optionSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
    margin: 6,
  },
  optionSwatchSelected: {
    borderColor: theme.text,
  },
});
