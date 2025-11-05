// src/api/marketApi.ts

import { api } from './api';
import type { StockData, HistoryInfo, HistoryDataItem, RawHistoryDataItem, CompanyInfo, Article, RelatedCompany } from '../interfaces/market';

export type SummaryItem = {
  id: number;
  company: string;
  type: 'sector' | 'competitor' | 'client' | 'fornitori';
  title: string;
  description: string;
  category?: string;
  relevance?: 'high' | 'medium' | 'low';
  created_at: string; // ISO
  sources: string[];
};


// 1. Buscar company info
export async function fetchCompanyInfo(): Promise<CompanyInfo> {
  const response = await api.get('/stocks/company-info/');
  console.log("Company Info Stocks:", response.data);
  return response.data;
}

// 2. Buscar histórico de preços
export async function fetchStockHistory(period: string, interval: string): Promise<{ info: HistoryInfo, data: HistoryDataItem[] }> {
  const response = await api.get('/stocks/history/', { params: { period, interval } });
  // Normaliza Date/Datetime:
  const normalizedData: HistoryDataItem[] = (response.data.data as RawHistoryDataItem[]).map(item => ({
    ...item,
    Date: item.Date || item.Datetime || ''
  }));
  return { info: response.data.info, data: normalizedData };
}

// 3. Buscar dados da empresa/overview
export async function fetchStockData(): Promise<StockData> {
  const response = await api.get<StockData>('/openai/investing-scraper/');
  return response.data;
}

// 4. Buscar quarterly report
export async function fetchQuarterlyReport(
  quarter?: string,
  year?: string
): Promise<{
  insightOptions: string[], 
  insight_report?: string,
  citationsInsight?: string[]
}> {
  const params = quarter && year ? { quarter, year } : {};
  const response = await api.get('/openai/quarterly-report/', { params });

  return {
    insightOptions: response.data.available_options ?? [],
    insight_report: response.data.report?.insight_report ?? '',
    citationsInsight: response.data.report?.citations ?? []
  };
}

// 5. Buscar concorrentes
export async function fetchCompetitors(): Promise<RelatedCompany[]> {
  const response = await api.get('/openai/competitors-search/');
  // Retorna o array do objeto
  return response.data?.related_companies ?? [];
}

// 6. Buscar notícias
export async function fetchMarketNews(): Promise<Article[]> {
  const response = await api.get('/newsapi/market-news/');
  return response.data?.articles as Article[] ?? [];
}

// 7. Buscar market overview report
export async function fetchMarketOverview(): Promise<{ report: string, citations: string[] }> {
  const response = await api.get('/perplexity/market-report/', { params: { recent: true } });
  console.log(response)
  return {
    report: response.data.report ?? '',
    citations: response.data.citations ?? []
  };
}

// 8. Buscar resumos (SummaryNewsArticle list)
export async function fetchMarketSummaries(params: {
  type?: 'competitor' | 'sector' | 'client' | 'fornitori';
  page?: number;
  page_size?: number;
  category?: string;
  relevance?: 'high' | 'medium' | 'low';
}): Promise<{ results: SummaryItem[]; total: number; page: number; page_size: number }>{
  const response = await api.get('/market-summary-news/', { params });
  const data = response.data ?? { results: [], total: 0, page: 1, page_size: 8 };
  // Normalize sources array defensively
  const results: SummaryItem[] = (data.results || []).map((r: any) => ({
    id: r.id,
    company: r.company,
    type: r.type,
    title: r.title,
    description: r.description,
    category: r.category,
    relevance: r.relevance,
    created_at: r.created_at,
    sources: Array.isArray(r.sources) ? r.sources : ([] as string[]),
  }));
  return { results, total: data.total ?? results.length, page: data.page ?? 1, page_size: data.page_size ?? params.page_size ?? 8 };
}