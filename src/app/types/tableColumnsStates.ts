export type TableDefault = {
  [key: string]: ColsDef;
};

export type ColsDef = {
  defaultState: DefaultState[];
  cols: Col[];
};

export type Col = {
  hide: boolean;
  headerName: string;
  field: string;
  width?: number;
  cellRenderer?: string;
  cellStyle?: CellStyle;
  tooltipField?: string;
};

export type DefaultState = {
  colId: string;
  width: number;
  hide: boolean;
  pinned: null;
  sort: null | string;
  sortIndex: number | null;
  aggFunc: null;
  rowGroup: boolean;
  rowGroupIndex: null;
  pivot: boolean;
  pivotIndex: null;
  flex: null;
};

export type CellStyle = {
  textOverflow: string;
};
