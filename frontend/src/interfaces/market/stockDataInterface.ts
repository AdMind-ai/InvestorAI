export interface StockData {
  id: number;
  created_at: string[];
  date: string;
  company: string;
  stock_symbol: string;
  stock_exchange: string;
  stock_price_today_usd: number[];
  stock_price_today_eur: number[];
  market_cap_usd: string;
  market_cap_eur: string;
  pe_ratio: number;
  sector: string;
  stock_volatility_level: string;
  short_term_forecast: string;
  possible_risk_factors: string;
  latest_news: string;
  analyst_recommendation: string;
}