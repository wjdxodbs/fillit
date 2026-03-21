import React, { useMemo } from "react";
import { COLUMNS, resolveCellState } from "../../constants/gridConstants";
import { chunkArray } from "../../utils/dateUtils";
import type { CellState } from "../common/DayCell";
import { useCellSize } from "../../hooks/useCellSize";
import { GrassGrid } from "../common/GrassGrid";

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
      const isTodayCell = i === elapsedDays - 1 && elapsedDays > 0 && !isCompleted;
      cells.push(resolveCellState(filled, isTodayCell, false));
    }
    return chunkArray(cells, COLUMNS);
  }, [totalDays, elapsedDays, isCompleted]);

  return <GrassGrid rows={rows} cellSize={cellSize} />;
}
