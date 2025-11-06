// src/interfaces/market.ts

// Generic company info returned by /stocks/company-info/
export type CompanyInfo = {
  name?: string;
  symbol?: string;
  sector?: string;
  industry?: string;
  website?: string;
  description?: string;
  [key: string]: unknown;
};

// Data shape for investing scraper; keep flexible since UI doesn't rely on strict fields yet
export type StockData = Record<string, unknown>;

// Raw history item from backend may have Date OR Datetime
export type RawHistoryDataItem = {
  Date?: string;
  Datetime?: string;
  Open?: number;
  High?: number;
  Low?: number;
  Close?: number;
  Volume?: number;
  [key: string]: unknown;
};

// Normalized history item used in the frontend
export type HistoryDataItem = {
  Date: string; // always present after normalization
  Open?: number;
  High?: number;
  Low?: number;
  Close?: number;
  Volume?: number;
  [key: string]: unknown;
};

// Metadata about the history response (keep permissive)
export type HistoryInfo = {
  period?: string;
  interval?: string;
  [key: string]: unknown;
};

// News Article used by market news endpoint
export type Article = {
  id?: number;
  company?: string;
  type?: string;
  title: string;
  url?: string;
  category: string;
  relevance: 'high' | 'medium' | 'low' | '';
  date_published: string; // ISO
  created_at?: string;
};

// Related company returned by /openai/competitors-search/
export type RelatedCompany = {
  name: string;
  kind: 'competitor' | 'client' | 'fornitori';
  stock_symbol?: string;
  website?: string;
  sectors?: string[];
  logo?: string;
  description?: string;
  [key: string]: unknown;
};
