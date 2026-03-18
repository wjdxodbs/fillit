import React, { useMemo } from "react";
import { COLUMNS } from "./gridConstants";
import { useCellSize } from "../hooks/useCellSize";
import { GrassGrid } from "./GrassGrid";
import type { CellState } from "./DayCell";

interface RangeGrassGridProps {
  totalDays: number;
  elapsedDays: number;
  /** 오늘이 targetDate를 지난 경우 true. 마지막 셀을 highlight(목표 완료)로 표시 */
  isCompleted?: boolean;
  cellSize?: number;
}

export function RangeGrassGrid({
  totalDays,
  elapsedDays,
  isCompleted = false,
  cellSize: cellSizeProp,
}: RangeGrassGridProps) {
  const cellSize = useCellSize(cellSizeProp);

  const rows = useMemo(() => {
    const cells: CellState[] = [];
    for (let i = 0; i < totalDays; i++) {
      const filled = i < elapsedDays;
      const isLastCell = i === totalDays - 1;
      const isTodayCell =
        i === elapsedDays - 1 && elapsedDays > 0 && !isCompleted;
      let state: CellState = filled ? "filled" : "empty";
      if (filled && isTodayCell) state = "today";
      else if (filled && isLastCell && isCompleted) state = "highlight";
      cells.push(state);
    }
    const rows: CellState[][] = [];
    for (let i = 0; i < cells.length; i += COLUMNS) {
      rows.push(cells.slice(i, i + COLUMNS));
    }
    return rows;
  }, [totalDays, elapsedDays, isCompleted]);

  return <GrassGrid rows={rows} cellSize={cellSize} />;
}
