import React from "react";
import { FlexWidget, SvgWidget, TextWidget } from "react-native-android-widget";

const GRASS_FILLED = "#00C49A";
const GRASS_EMPTY = "#2d2d2d";
const COLS = 16;
const CELL_SIZE = 6;
const GAP = 1;

function formatDateForWidget(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export interface FillitGrassWidgetProps {
  /** 제목 (올해면 "2026년", 목표일이면 항목 제목) */
  title: string;
  /** 시작일 YYYY-MM-DD */
  baseDate: string;
  /** 목표일 YYYY-MM-DD */
  targetDate: string;
  /** 1년 중 또는 구간 중 채울 마지막 일(1-based). 구간이면 1~totalDays 중 오늘까지 경과 일수 */
  filledUpTo: number;
  /** 구간 총 일수 (올해면 365/366, 목표일이면 base~target 일수) */
  totalDays: number;
}

/**
 * 위젯: 제목 → 시작일~목표일 → 잔디 그리드
 */
export function FillitGrassWidget({
  title,
  baseDate,
  targetDate,
  filledUpTo,
  totalDays,
}: FillitGrassWidgetProps) {
  const ROWS = Math.ceil(totalDays / COLS);
  /** 정확히 totalDays개만 그림. 행을 꽉 채우기 위해 남는 칸 없음 */
  const width = COLS * CELL_SIZE + (COLS - 1) * GAP;
  const height = ROWS * CELL_SIZE + (ROWS - 1) * GAP;

  const rects = Array.from({ length: totalDays }, (_, i) => {
    const dayIndex = i + 1;
    const filled = dayIndex <= filledUpTo;
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const x = col * (CELL_SIZE + GAP);
    const y = row * (CELL_SIZE + GAP);
    const fill = filled ? GRASS_FILLED : GRASS_EMPTY;
    return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${fill}"/>`;
  });

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">${rects.join(
    ""
  )}</svg>`;

  const dateRangeText = `${formatDateForWidget(
    baseDate
  )} ~ ${formatDateForWidget(targetDate)}`;
  const progress =
    totalDays > 0 ? Math.round((filledUpTo / totalDays) * 100) : 0;
  const progressText = `${progress}% 완료`;

  return (
    <FlexWidget
      style={{
        flexDirection: "column",
        padding: 12,
        backgroundColor: "#121212",
        width: "match_parent",
        height: "match_parent",
      }}
    >
      <TextWidget
        text={title}
        style={{ color: "#e0e0e0", fontSize: 18, fontWeight: "600" }}
      />
      <TextWidget
        text={dateRangeText}
        style={{
          color: "#9e9e9e",
          fontSize: 13,
          marginTop: 4,
        }}
      />
      <TextWidget
        text={progressText}
        style={{
          color: "#9e9e9e",
          fontSize: 12,
          marginTop: 2,
        }}
      />
      <SvgWidget
        svg={svgString}
        style={{
          marginTop: 8,
          width: "match_parent",
          height: "match_parent",
        }}
      />
    </FlexWidget>
  );
}
