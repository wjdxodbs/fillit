import React from "react";
import { FlexWidget, SvgWidget, TextWidget } from "react-native-android-widget";
import { formatDate, calcProgress } from "../utils/dateUtils";
import { theme } from "../theme";

const GRASS_FILLED = theme.grassFilled;
const GRASS_EMPTY = theme.grassEmpty;
const COLS = 16;
const CELL_SIZE = 6;
const GAP = 1;

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
  /** 클릭 시 이동할 딥링크 URL */
  clickUrl: string;
}


/**
 * 위젯: 제목 → 통계 카드(날짜 범위·완료%·경과·남은 일수·프로그레스바) → 잔디 그리드
 */
export function FillitGrassWidget({
  title,
  baseDate,
  targetDate,
  filledUpTo,
  totalDays,
  clickUrl,
}: FillitGrassWidgetProps) {
  const ROWS = Math.ceil(totalDays / COLS);
  const width = COLS * CELL_SIZE + (COLS - 1) * GAP;
  const height = ROWS * CELL_SIZE + (ROWS - 1) * GAP;
  const progress = calcProgress(filledUpTo, totalDays);
  const remaining = totalDays - filledUpTo;

  const rects = Array.from({ length: totalDays }, (_, i) => {
    const dayIndex = i + 1; // filledUpTo는 1-based이므로 변환
    const filled = dayIndex <= filledUpTo;
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const x = col * (CELL_SIZE + GAP);
    const y = row * (CELL_SIZE + GAP);
    const fill = filled ? GRASS_FILLED : GRASS_EMPTY;
    return `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${fill}"/>`;
  });

  const svgString =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="none">` +
    rects.join("") +
    `</svg>`;

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: clickUrl }}
      style={{
        flexDirection: "column",
        padding: 12,
        paddingTop: 16,
        backgroundColor: theme.background,
        width: "match_parent",
        height: "match_parent",
      }}
    >
      {/* 제목 */}
      <TextWidget
        text={title}
        style={{ color: theme.text, fontSize: 26, fontWeight: "700" }}
      />

      {/* 통계 카드 */}
      <FlexWidget
        style={{
          flexDirection: "column",
          backgroundColor: theme.surface,
          borderRadius: 12,
          padding: 10,
          marginTop: 8,
          width: "match_parent",
        }}
      >
        {/* 날짜 범위 */}
        <TextWidget
          text={`${formatDate(baseDate)} ~ ${formatDate(targetDate)}`}
          style={{
            color: theme.textSecondary,
            fontSize: 14,
            marginBottom: 8,
          }}
        />

        {/* 통계 행: 완료% / 경과 일수 / 남은 일수 */}
        <FlexWidget
          style={{
            flexDirection: "row",
            width: "match_parent",
            marginBottom: 8,
          }}
        >
          <FlexWidget
            style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
          >
            <TextWidget
              text={`${progress}%`}
              style={{ color: GRASS_FILLED, fontSize: 18, fontWeight: "700" }}
            />
            <TextWidget
              text="완료"
              style={{ color: theme.textSecondary, fontSize: 13 }}
            />
          </FlexWidget>

          <FlexWidget
            style={{ width: 1, height: 28, backgroundColor: theme.border }}
          />

          <FlexWidget
            style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
          >
            <TextWidget
              text={String(filledUpTo)}
              style={{ color: GRASS_FILLED, fontSize: 18, fontWeight: "700" }}
            />
            <TextWidget
              text="경과 일수"
              style={{ color: theme.textSecondary, fontSize: 13 }}
            />
          </FlexWidget>

          <FlexWidget
            style={{ width: 1, height: 28, backgroundColor: theme.border }}
          />

          <FlexWidget
            style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
          >
            <TextWidget
              text={String(remaining)}
              style={{ color: GRASS_FILLED, fontSize: 18, fontWeight: "700" }}
            />
            <TextWidget
              text="남은 일수"
              style={{ color: theme.textSecondary, fontSize: 13 }}
            />
          </FlexWidget>
        </FlexWidget>

        {/* 프로그레스 바 */}
        <FlexWidget
          style={{
            flexDirection: "row",
            width: "match_parent",
            height: 6,
          }}
        >
          <FlexWidget
            style={{
              flex: Math.max(0.001, progress),
              height: "match_parent",
              backgroundColor: GRASS_FILLED,
            }}
          />
          <FlexWidget
            style={{
              flex: Math.max(0.001, 100 - progress),
              height: "match_parent",
              backgroundColor: GRASS_EMPTY,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* 잔디 그리드 */}
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
