import React, { useMemo } from "react";
import { isLeapYear, getDayOfYear, chunkArray } from "../../utils/dateUtils";
import { COLUMNS, resolveCellState } from "../../constants/gridConstants";
import type { CellState } from "../common/DayCell";
import { useCellSize } from "../../hooks/useCellSize";
import { GrassGrid } from "../common/GrassGrid";


interface YearGrassGridProps {
  year: number;
  endDate: Date;
  cellSize?: number;
}

export const YearGrassGrid = React.memo(function YearGrassGrid({
  year,
  endDate,
  cellSize: cellSizeProp,
}: YearGrassGridProps) {
  const cellSize = useCellSize(cellSizeProp);

  const rows = useMemo(() => {
    const endDayOfYear =
      endDate.getFullYear() === year ? getDayOfYear(endDate) : 0;
    const daysInYear = isLeapYear(year) ? 366 : 365;
    const cells: CellState[] = [];
    for (let d = 1; d <= daysInYear; d++) {
      const filled = d <= endDayOfYear;
      const isToday = d === endDayOfYear;
      cells.push(resolveCellState(filled, isToday, false));
    }
    return chunkArray(cells, COLUMNS);
  }, [year, endDate]);

  return <GrassGrid rows={rows} cellSize={cellSize} />;
});
