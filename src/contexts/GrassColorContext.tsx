import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@fillit/grassColor";
/** 기본: 초록색 */
const DEFAULT_COLOR = "#4caf50";
/** 허용 색상(빨·주·보·초·파). 이 목록에 없으면 기본색으로 초기화 */
const PRESET_COLORS = ["#f44336", "#ff9800", "#9c27b0", "#4caf50", "#2196f3"];
/** 예전 테마 민트 계열 – 저장돼 있으면 기본색으로 덮어씀 */
const LEGACY_MINT = ["#26a69a", "#4db6ac", "#80cbc4", "#147a6f"];

type GrassColorContextValue = {
  color: string;
  setColor: (color: string) => void;
};

const GrassColorContext = createContext<GrassColorContextValue | null>(null);

export function GrassColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [color, setColorState] = useState(DEFAULT_COLOR);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const saved = raw?.trim().toLowerCase();
        if (saved && PRESET_COLORS.includes(saved)) {
          setColorState(saved);
        } else if (
          saved &&
          (LEGACY_MINT.includes(saved) || !PRESET_COLORS.includes(saved))
        ) {
          // 예전 민트 또는 그 외 값 → 기본색으로 덮어쓰기
          setColorState(DEFAULT_COLOR);
          await AsyncStorage.setItem(STORAGE_KEY, DEFAULT_COLOR);
        }
      } catch {
        // keep default
      }
    })();
  }, []);

  const setColor = useCallback((value: string) => {
    setColorState(value);
    AsyncStorage.setItem(STORAGE_KEY, value).catch(() => {});
  }, []);

  return (
    <GrassColorContext.Provider value={{ color, setColor }}>
      {children}
    </GrassColorContext.Provider>
  );
}

export function useGrassColor(): GrassColorContextValue {
  const ctx = useContext(GrassColorContext);
  if (!ctx) {
    return {
      color: DEFAULT_COLOR,
      setColor: () => {},
    };
  }
  return ctx;
}

/** hex 색상을 더 진하게 (0~1, 클수록 진함) */
export function darkenHex(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const r = Math.max(0, Math.floor(parseInt(n.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(parseInt(n.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.floor(parseInt(n.slice(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
