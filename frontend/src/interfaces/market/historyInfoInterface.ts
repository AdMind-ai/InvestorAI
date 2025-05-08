export interface TradingPeriod {
  timezone?: string | null;
  end?: number | null;
  start?: number | null;
  gmtoffset?: number | null;
}

export interface CurrentTradingPeriod {
  pre?: TradingPeriod | null;
  regular?: TradingPeriod | null;
  post?: TradingPeriod | null;
}

export interface HistoryInfo {
  currency?: string | null;
  symbol?: string | null;
  exchangeName?: string | null;
  fullExchangeName?: string | null;
  instrumentType?: string | null;
  firstTradeDate?: number | null;
  regularMarketTime?: number | null;
  hasPrePostMarketData?: boolean | null;
  gmtoffset?: number | null;
  timezone?: string | null;
  exchangeTimezoneName?: string | null;
  regularMarketPrice?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  regularMarketDayHigh?: number | null;
  regularMarketDayLow?: number | null;
  regularMarketVolume?: number | null;
  longName?: string | null;
  shortName?: string | null;
  chartPreviousClose?: number | null;
  previousClose?: number | null;
  scale?: number | null;
  priceHint?: number | null;
  currentTradingPeriod?: CurrentTradingPeriod | null;
  tradingPeriods?: {
    pre_start?: string[];
    pre_end?: string[];
    start?: string[];
    end?: string[];
    post_start?: string[];
    post_end?: string[];
  };
  dataGranularity?: string | null;
  range?: string | null;
  validRanges?: string[];
  lastTrade?: {
    Price?: number | null;
    Time?: string | null;
  };
}