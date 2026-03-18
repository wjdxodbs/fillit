import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export function useBottomSheet() {
  const [visible, setVisible] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const close = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 300, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      callback?.();
    });
  }, []);

  return { visible, setVisible, close, backdropOpacity, sheetTranslateY };
}
