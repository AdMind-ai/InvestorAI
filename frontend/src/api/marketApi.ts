// src/api/marketApi.ts

import { api } from './api';
import type { StockData, HistoryInfo, HistoryDataItem, RawHistoryDataItem, CompanyInfo, Article, Competitor } from '../interfaces/market';


// 1. Buscar company info
export async function fetchCompanyInfo(): Promise<CompanyInfo> {
  const response = await api.get('/stocks/company-info/');
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
export async function fetchQuarterlyReport(company: string, quarter: string, year: string): Promise<{
  insight_report: string
}> {
  const response = await api.get('/openai/quarterly-report/', {
    params: { company, quarter, year }
  });
  return response.data;
}

// 5. Buscar concorrentes
export async function fetchCompetitors(): Promise<Competitor[]> {
  const response = await api.get('/openai/competitors-search/', {
    params: { recent: true }
  });
  // Retorna o array (confira o formato conforme uso)
  return response.data[0]?.competitors ?? [];
}

// 6. Buscar notícias
export async function fetchMarketNews(): Promise<Article[]> {
  const response = await api.get('/newsapi/market-news/');
  return response.data?.articles as Article[] ?? [];
}

// 7. Buscar market overview report
export async function fetchMarketOverview(): Promise<{ report: string, citations: string[] }> {
  const response = await api.get('/perplexity/market-report/', { params: { recent: true } });
  return {
    report: response.data.report ?? '',
    citations: response.data.citations ?? []
  };
}