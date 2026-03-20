import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { COLUMNS, CELL_GAP, GRID_HORIZONTAL_PADDING } from "../constants/gridConstants";

export function useCellSize(cellSizeProp?: number): number {
  const { width } = useWindowDimensions();
  return useMemo(() => {
    if (cellSizeProp != null) return cellSizeProp;
    const available = width - GRID_HORIZONTAL_PADDING;
    return Math.max(1, Math.floor((available - (COLUMNS - 1) * CELL_GAP) / COLUMNS));
  }, [width, cellSizeProp]);
}
