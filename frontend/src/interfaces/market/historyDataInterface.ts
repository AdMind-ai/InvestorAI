export interface HistoryDataItem {
  Date: string;      // format ISO ex: "2025-04-22T09:06:00+02:00"
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Dividends?: number | null;
  'Stock Splits'?: number | null;
}

export interface RawHistoryDataItem {
  Date?: string;
  Datetime?: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Dividends?: number | null;
  'Stock Splits'?: number | null;
}