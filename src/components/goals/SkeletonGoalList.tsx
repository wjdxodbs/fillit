import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "../../stores/themeStore";
import type { Theme } from "../../theme";

function SkeletonItem({ opacity, theme }: { opacity: Animated.Value; theme: Theme }) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        item: {
          backgroundColor: theme.surface,
          borderRadius: 12,
          paddingVertical: 18,
          paddingHorizontal: 16,
          marginBottom: 10,
        },
        titleBar: {
          height: 14,
          width: "60%",
          backgroundColor: theme.border,
          borderRadius: 6,
          marginBottom: 8,
        },
        dateBar: {
          height: 11,
          width: "40%",
          backgroundColor: theme.border,
          borderRadius: 6,
        },
      }),
    [theme]
  );
  return (
    <Animated.View style={[styles.item, { opacity }]}>
      <View style={styles.titleBar} />
      <View style={styles.dateBar} />
    </Animated.View>
  );
}

export function SkeletonGoalList() {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <View style={{ padding: 20 }}>
      {[0, 1].map((i) => (
        <SkeletonItem key={i} opacity={opacity} theme={theme} />
      ))}
    </View>
  );
}
