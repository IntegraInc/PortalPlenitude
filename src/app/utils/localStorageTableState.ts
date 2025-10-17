/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnState } from "ag-grid-community";
export function getTableStateFromLocalStorage(
  tableName: string
): ColumnState[] {
  const tableState = localStorage.getItem(tableName);

  if (tableState) {
    return JSON.parse(tableState);
  }

  return [];
}

export function setTableStateOnLocalStorage(
  tableName: string,
  state: ColumnState[]
) {
  localStorage.setItem(tableName, JSON.stringify(state));
}

export const onColumnStateChanged = (e: any) => {
  const {
    api: gridApi,
    context: { localStorageKey },
  } = e;
  if (!gridApi) return;
  const state: ColumnState[] = gridApi.getColumnState();
  setTableStateOnLocalStorage(localStorageKey, state);
};
