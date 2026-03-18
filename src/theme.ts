const MAIN_COLOR = "#00C49A";
const TODAY_CELL_COLOR = "#00a87d";
const DANGER_COLOR = "#ef4444";

type HexColor = `#${string}`;

export type Theme = {
  background: HexColor;
  backgroundSecondary: HexColor;
  surface: HexColor;
  text: HexColor;
  textSecondary: HexColor;
  grassFilled: HexColor;
  grassEmpty: HexColor;
  grassTodayCell: HexColor;
  grassHighlight: HexColor;
  border: HexColor;
  tabActive: HexColor;
  tabInactive: HexColor;
  danger: HexColor;
};

export const darkTheme: Theme = {
  background: "#121212",
  backgroundSecondary: "#1a1a1a",
  surface: "#252525",
  text: "#e0e0e0",
  textSecondary: "#9e9e9e",
  grassFilled: MAIN_COLOR,
  grassEmpty: "#2d2d2d",
  grassTodayCell: TODAY_CELL_COLOR,
  grassHighlight: "#e0e0e0",
  border: "#333333",
  tabActive: MAIN_COLOR,
  tabInactive: "#8e8e8e",
  danger: DANGER_COLOR,
};

export const lightTheme: Theme = {
  background: "#f5f5f5",
  backgroundSecondary: "#ffffff",
  surface: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#6b6b6b",
  grassFilled: MAIN_COLOR,
  grassEmpty: "#e0e0e0",
  grassTodayCell: TODAY_CELL_COLOR,
  grassHighlight: "#1a1a1a",
  border: "#e0e0e0",
  tabActive: MAIN_COLOR,
  tabInactive: "#9e9e9e",
  danger: DANGER_COLOR,
};
