import React, { createContext, useContext, useState, useEffect } from "react";
import type { HistoryInfo, HistoryDataItem, CompanyInfo, StockData, Article, Competitor } from "../interfaces/market";
import {
    fetchCompanyInfo,
    fetchStockHistory,
    fetchStockData,
    fetchQuarterlyReport,
    fetchMarketNews,
    fetchCompetitors,
    fetchMarketOverview
} from '../api/marketApi';
import { useGlobal } from "./GlobalContext";

interface MarketContextType {
  // Shared states
  stockData: StockData | null;
  setStockData: React.Dispatch<React.SetStateAction<StockData | null>>;
  historyInfo: HistoryInfo | null;
  setHistoryInfo: React.Dispatch<React.SetStateAction<HistoryInfo | null>>;
  historyData: HistoryDataItem[];
  setHistoryData: React.Dispatch<React.SetStateAction<HistoryDataItem[]>>;
  period: string;
  setPeriod: React.Dispatch<React.SetStateAction<string>>;
  interval: string;
  setInterval: React.Dispatch<React.SetStateAction<string>>;
  varPercent: boolean;
  setVarPercent: React.Dispatch<React.SetStateAction<boolean>>;
  companyInfo: CompanyInfo | null;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo | null>>;
  insightReport: string; 
  citationsInsight: string[];
  insightOptions: string[];
  selectedQuarter: string;
  setSelectedQuarter: React.Dispatch<React.SetStateAction<string>>;
  competitorNews: Article[];
  sectorNews: Article[];
  competitorNewsCurrentPage: number;
  competitors: Competitor[];
  overviewReport: string;
  citations: string[];
  // Adicione outros que quiser compartilhar
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Shared states
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [historyInfo, setHistoryInfo] = useState<HistoryInfo | null>(null);
  const [historyData, setHistoryData] = useState<HistoryDataItem[]>([]);
  const [period, setPeriod] = useState<string>("5d");
  const [interval, setInterval] = useState<string>("15m");
  const [varPercent, setVarPercent] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const [insightReport, setInsightReport] = useState('');
  const [citationsInsight, setCitationsInsight] = useState<string[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [insightOptions, setInsightOptions] = useState<string[]>([]);

  const [competitorNewsCurrentPage, setCompetitorNewsCurrentPage] = useState(1);
  const [competitorNews, setCompetitorNews] = useState<Article[]>([]);
  const [sectorNews, setSectorNews] = useState<Article[]>([]);

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  
  const [overviewReport, setOverviewReport] = useState('');
  const [citations, setCitations] = useState<string[]>([]);

  function citeLinks(text: string, citations: string[]): string {
    return text.replace(/\[(\d+)\]/g, (match: string, num: string): string => {
      const citationIndex = parseInt(num, 10) - 1;
      if (citationIndex >= 0 && citationIndex < citations.length) {
        const citationLink: string = citations[citationIndex];
        return ` [[${num}]](${citationLink})`;
      }
      return match;
    });
  }

  // Fetch Data
  useEffect(() => {
    fetchCompanyInfo().then(setCompanyInfo);
  }, []);

  useEffect(() => {
    fetchStockHistory(period, interval).then(({ info, data }) => {
      setHistoryInfo(info);
      setHistoryData(data);
    });
  }, [period, interval]);


  useEffect(() => {
      fetchStockData().then(setStockData);
  }, []);

  useEffect(() => {
    const [quarter, year] = selectedQuarter ? selectedQuarter.split(' ') : [undefined, undefined];
  
    fetchQuarterlyReport(quarter, year).then(({ insightOptions, insight_report, citationsInsight }) => {
      setInsightOptions(insightOptions);
  
      if (insight_report) {
        const thinkTagMatch = /<think>[\s\S]*?<\/think>/g;
        let reportContent = insight_report.replace(thinkTagMatch, '');
        reportContent = citeLinks(reportContent, citationsInsight ?? []);
  
        setInsightReport(reportContent);
        setCitationsInsight(citationsInsight ?? []);
      } else {
        setInsightReport('');
        setCitationsInsight([]);
      }
  
      if (!selectedQuarter && insightOptions.length > 0) {
        setSelectedQuarter(insightOptions[0]);
      }
    });
  }, [selectedQuarter]);

  useEffect(() => {
    setCompetitorNewsCurrentPage(1)
    fetchMarketNews().then(articles => {
      setCompetitorNews(articles.filter(article => article.type === 'competitors'));
      setSectorNews(articles.filter(article => article.type === 'sector'));
    });
  }, []);

  useEffect(() => {
    fetchCompetitors().then(setCompetitors);
  }, []);

  useEffect(() => {
    fetchMarketOverview().then(({ report, citations }) => {
      const thinkTagMatch = /<think>[\s\S]*?<\/think>/g;
      let reportContent = report.replace(thinkTagMatch, '');
      reportContent = citeLinks(reportContent, citations);

      setOverviewReport(reportContent);
      setCitations(citations);
    });
  }, []);


  return (
    <MarketContext.Provider value={{
      stockData, setStockData,
      historyInfo, setHistoryInfo,
      historyData, setHistoryData,
      period, setPeriod,
      interval, setInterval,
      varPercent, setVarPercent,
      companyInfo, setCompanyInfo,
      insightReport, citationsInsight,
      insightOptions,
      selectedQuarter, setSelectedQuarter,
      competitorNews, sectorNews,
      competitorNewsCurrentPage,
      competitors,
      overviewReport, citations
    }}>
      {children}
    </MarketContext.Provider>
  );
};

// Hook to use MarketContext
export const useMarket = () => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside MarketProvider");
  return ctx;
};

