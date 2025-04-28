export interface HistoryDataItem {
  Date: string;      // format ISO ex: "2025-04-22T09:06:00+02:00"
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Dividends: number;
  'Stock Splits': number;
}