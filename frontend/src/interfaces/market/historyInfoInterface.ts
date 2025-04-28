export interface TradingPeriod {
    timezone: string;
    end: number;
    start: number;
    gmtoffset: number;
  }
  
  export interface CurrentTradingPeriod {
    pre: TradingPeriod;
    regular: TradingPeriod;
    post: TradingPeriod;
  }
  
  export interface HistoryInfo {
    currency: string;
    symbol: string;
    exchangeName: string;
    fullExchangeName: string;
    instrumentType: string;
    firstTradeDate: number;
    regularMarketTime: number;
    hasPrePostMarketData: boolean;
    gmtoffset: number;
    timezone: string;
    exchangeTimezoneName: string;
    regularMarketPrice: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketVolume: number;
    longName: string;
    shortName: string;
    chartPreviousClose: number;
    previousClose: number;
    scale: number;
    priceHint: number;
    currentTradingPeriod: CurrentTradingPeriod;
    tradingPeriods: {
      end: string[];
      start: string[];
    };
    dataGranularity: string;
    range: string;
    validRanges: string[];
    lastTrade: {
      Price: number;
      Time: string;
    };
  }