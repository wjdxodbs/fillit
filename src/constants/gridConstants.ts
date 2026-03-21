import type { CellState } from "../components/common/DayCell";

/** 잔디 그리드 열 수 */
export const COLUMNS = 16;
/** 셀 간격 (px) */
export const CELL_GAP = 6;
/** 홈/상세 화면 좌우 패딩 합계 (content 20*2) */
export const GRID_HORIZONTAL_PADDING = 40;
/** 요일 레이블 (일~토) */
export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 셀 상태 결정 헬퍼. isToday가 isHighlight보다 우선 */
export function resolveCellState(
  filled: boolean,
  isToday: boolean,
  isHighlight: boolean,
): CellState {
  if (!filled) return "empty";
  if (isToday) return "today";
  if (isHighlight) return "highlight";
  return "filled";
}
