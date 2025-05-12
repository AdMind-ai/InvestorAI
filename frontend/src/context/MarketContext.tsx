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
  const { companyInfoAdm } = useGlobal();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [historyInfo, setHistoryInfo] = useState<HistoryInfo | null>(null);
  const [historyData, setHistoryData] = useState<HistoryDataItem[]>([]);
  const [period, setPeriod] = useState<string>("1mo");
  const [interval, setInterval] = useState<string>("1d");
  const [varPercent, setVarPercent] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const [insightReport, setInsightReport] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1 2025');

  const [competitorNewsCurrentPage, setCompetitorNewsCurrentPage] = useState(1);
  const [competitorNews, setCompetitorNews] = useState<Article[]>([]);
  const [sectorNews, setSectorNews] = useState<Article[]>([]);

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  
  const [overviewReport, setOverviewReport] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  const citeLinks = (text: string, citations: string[]) => {
    return text.replace(/\[(\d+)\]/g, (match: string, num: string) => {
      const citationIndex = parseInt(num, 10) - 1; 
      if (citationIndex >= 0 && citationIndex < citations.length) {
        const citationLink = citations[citationIndex];
        return ` [[${num}]](${citationLink})`;
      }
      return match; 
    });
  };

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
    fetchQuarterlyReport(
      'Apple', 
      selectedQuarter.split(' ')[0], 
      selectedQuarter.split(' ')[1]
    ).then(res => setInsightReport(res.insight_report));
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
    console.log(companyInfoAdm)
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
      insightReport,
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

