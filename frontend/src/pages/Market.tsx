import React, { useState, useEffect } from 'react';
// import { useTheme } from '@mui/material/styles'
import { Box, Typography, Divider, Link, Button, Pagination, Grow, TextField, MenuItem } from '@mui/material'
import ReactMarkdown from 'react-markdown';
import '../styles/markdown.css';
import Layout from '../layouts/Layout'
import type { HistoryInfo, HistoryDataItem, CompanyInfo } from '../interfaces/market';
import { api } from '../api/api'

// Icon Imports
import CardEuroIcon from '../assets/dashboard_icons/card_euro_icon.svg'
import CardArrowsIcon from '../assets/dashboard_icons/card_arrows_icon.svg'
import CardCurveArrowIcon from '../assets/dashboard_icons/card_curvearrow_icon.svg'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Chart Imports
import CrosshairPlugin from 'chartjs-plugin-crosshair';
import { TooltipItem } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { ChartData, ChartTypeRegistry, ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale, 
  LinearScale,   
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  BarController, 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,    
  BarController, 
  CrosshairPlugin
);


interface RawHistoryDataItem {
  Date?: string;
  Datetime?: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Dividends: number;
  'Stock Splits': number;
}


interface Competitor {
  competitor: string;
  logo: string;
  sectors: string[];
  description: string;
  website: string;
}

interface Article {
  company: string;
  type: 'competitors' | 'sector';
  title: string;
  url: string;
  date_published: string;
  created_at: string;
}

interface MarketReportResponse {
  report: string;
  citations: string[];
}

interface StockData {
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


const Market: React.FC = () => {
  // const theme = useTheme()
  // Overview 
  // const riskFactorsRef = useRef<HTMLDivElement>(null);
  // const [linePosition, setLinePosition] = useState<number>(0);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const ellipsisStyles = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '5', 
    cursor: 'zoom-in',
    position: 'relative',
  };

  // Chart data
  const [stockData, setStockData] = useState<StockData | null>(null);
  // const [selectedCompany, setSelectedCompany] = useState<StockData | null>(null);
  const [historyInfo, setHistoryInfo] = useState<HistoryInfo | null>(null);
  const [historyData, setHistoryData] = useState<HistoryDataItem[]>([]);
  const [period, setPeriod] = useState<string>('1mo');     // periodo default: 1 mês
  const [interval, setInterval] = useState<string>('1d');  // intervalo default: 1 dia
  const [varPercent, setVarPercent] = useState(true); 
  const chartDataLabels = historyData.map(d => d.Date || "");
  const periodi = {
    '1d': '1 giorno',
    '5d': '5 giorni',
    '1mo': '1 mese',
    '3mo': '3 mesi',
    '6mo': '6 mesi',
    '1y': '1 anno',
    '2y': '2 anni',
    'ytd': 'Da inizio anno',
    'max': 'Massimo'
  };
  
  const intervalli = {
    '1m': '1 minuto',
    '2m': '2 minuti',
    '5m': '5 minuti',
    '15m': '15 minuti',
    '30m': '30 minuti',
    '1h': '1 ora',
    '1d': '1 giorno',
    '1wk': '1 settimana',
    '1mo': '1 mese'
  };

  // Chart Cards
  const currencySymbol = historyInfo?.currency === 'EUR' ? '€' : '$';
  const prezzoAttuale = historyInfo?.previousClose;
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        const response = await api.get('/stocks/company-info/', {
          params: { symbol: 'GRN.MI' }
        });
        setCompanyInfo(response.data);
      } catch {
        setCompanyInfo(null);
      }
    }
    fetchCompanyInfo();
  }, []);


  // Competitors data
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [visibleCompetitorsCount, setVisibleCompetitorsCount] = useState(12);
  const [hoverIndex, setHoverIndex] = useState<null | number>(null);
  const handleCompetitorsExpand = () => {
    setVisibleCompetitorsCount(visibleCompetitorsCount === 12 ? competitors.length : 12);
  };

  // Articles data
  const [competitorNews, setCompetitorNews] = useState<Article[]>([]);
  const [sectorNews, setSectorNews] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [competitorsPerPage, setCompetitorsPerPage] = useState(10);
  const [sectorPage, setSectorPage] = useState(1);
  const sectorNewsPerPage = 15;

  // Overview report data
  const [overviewReport, setOverviewReport] = useState('');
  const [citations, setCitations] = useState<string[]>([]);

  // Insight Report data
  const [insightReport, setInsightReport] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1 2025');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setCurrentPage(1)

    const fetchStockData = async () => {
      try {
        const response = await api.get<StockData>("/openai/investing-scraper/", {
          params: { company: 'Apple' }
        });

        if (response.data) {
          console.log(response.data)
          setStockData(response.data); 
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    const fetchReport = async () => {
      try {
        const response = await api.get('/openai/quarterly-report/', {
          params: {
            company: 'Apple',
            quarter: selectedQuarter.split(' ')[0],
            year: selectedQuarter.split(' ')[1],
          },
        });

        setInsightReport(response.data.insight_report);
      } catch (error) {
        console.error('Erro ao buscar o relatório:', error);
      }
    };

    const fetchCompetitors = async () => {
      try {
        const response = await api.get("/openai/competitors-search/?recent=true&company=apple inc");
        if (response.data && response.data.length > 0) {
          setCompetitors(response.data[0].competitors);
          console.log(response.data[0].competitors);
        }
      } catch (error) {
        console.error("Erro ao buscar competidores", error);
      }
    };

    const fetchArticles = async () => {
      try {
        const response = await api.get("/openai/market-news/?company=apple inc");
        
        if (response.data && response.data.articles) {
          const articles = response.data.articles as Article[];
          
          setCompetitorNews(articles.filter(article => article.type === 'competitors'));
          setSectorNews(articles.filter(article => article.type === 'sector'));
        }
      } catch (error) {
        console.error("Erro ao buscar notícias", error);
      }
    };

    const fetchOverviewReport = async () => {
      try {
        const response = await api.get<MarketReportResponse>("/perplexity/market-report/", {
          params: {
            recent: true,
            company: 'apple inc'
          }
        });

        if (response.data && response.data.report) {
          let reportContent = response.data.report;

          // Remove conteúdo entre <think>...</think>
          const thinkTagMatch = /<think>[\s\S]*?<\/think>/g;
          reportContent = reportContent.replace(thinkTagMatch, '');
    
          reportContent = citeLinks(reportContent, response.data.citations);

          setOverviewReport(reportContent);
          setCitations(citations);
        }
      } catch (error) {
        console.error("Error fetching the overview report: ", error);
      }
    };

    fetchStockData();
    fetchReport();
    fetchCompetitors();
    fetchArticles();
    fetchOverviewReport();
  }, [selectedQuarter]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const resp = await api.get('/stocks/history/', {
          params: {
            symbol: 'GRN.MI',
            period,     
            interval,
          }
        });
        setHistoryInfo(resp.data.info);

        const normalizedData: HistoryDataItem[] = (resp.data.data as RawHistoryDataItem[]).map(item => ({
          ...item,
          Date: item.Date || item.Datetime || ''
        }));
    
        setHistoryData(normalizedData);
      } catch {
        setHistoryInfo(null);
        setHistoryData([]);
      }
    }

    fetchHistory();
  }, [period, interval]);

  // Pagination logic for competitors
  const paginateCompetitors = () => {
    const start = (currentPage - 1) * competitorsPerPage;
    const end = start + competitorsPerPage;
    return competitorNews.slice(start, end);
  };

  const handleCompetitorsNewsExpand = () => {
    if (competitorsPerPage === 10) {
      setCompetitorsPerPage(30);
    } else {
      setCompetitorsPerPage(10);
    }
  };

  const paginatedSectorNews = () => {
    const start = (sectorPage - 1) * sectorNewsPerPage;
    return sectorNews.slice(start, start + sectorNewsPerPage);
  };

  // const handlePageChange = (newPage: number) => {
  //   setCurrentPage(newPage);
  // };

  const citeLinks = (text: string, citations: string[]) => {
    return text.replace(/\[(\d+)\]/g, (match: string, num: string) => {
      const citationIndex = parseInt(num, 10) - 1; 
      // console.log(citationIndex, citations[citationIndex])
      if (citationIndex >= 0 && citationIndex < citations.length) {
        const citationLink = citations[citationIndex];
        return ` [[${num}]](${citationLink})`;
      }
      return match; 
    });
  };


  const chartData: ChartData<keyof ChartTypeRegistry> = {
    labels: historyData.map(d => {
      if (!d.Date) return "";
      const dt = new Date(d.Date);
    
      // Date: dd/mm/yyyy
      const data = dt.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    
      // Hour: HH:mm
      const hora = dt.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24h
      });
    
      return `${data} ${hora}`; // "28/04/2025 13:38"
    }),
    // labels: stockData ? stockData.created_at.map(date => new Date(date).toLocaleDateString()) : [],
    datasets: [
      {
        type: 'line',
        label: 'Prezzo del titolo (€)',
        data: historyData.map(d => d.Close),
        // data: stockData ? stockData.stock_price_today_eur : [],
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.3)', // preenchimento abaixo da linha colorido com transparência
        fill: true, // preenche a área abaixo da linha
        tension: 0.2, // curva suave (0 é reto, 0.5 mais suavizado)
        pointBackgroundColor: 'blue',
        pointRadius: historyData.length>20? 2:4,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#25d366',
        yAxisID: 'y',
        order: 2,
      },
      {
        // Volume barras
        type: 'bar',
        label: 'Volume',
        data: historyData.map(d => d.Volume),
        yAxisID: 'yVolume',
        backgroundColor: 'rgba(255,165,0,0.4)',
        borderRadius: 4,
        order: 1,
        barPercentage: 1, // largura máxima
        categoryPercentage: 1,
        // Não precisa stack se não houver outros bars
      }, 
    ],
  };

  const chartOptions: ChartOptions<keyof ChartTypeRegistry> = {
    responsive: true, 
    maintainAspectRatio: false, 
    animation: {
      duration: 1500,
      easing: 'easeOutQuart', 
    },
    interaction: {
      mode: 'index',      
      intersect: false  
    },
    layout: {
      padding: {
        left: 10,   // padding esquerdo (em pixels)
        right: 10,  // padding direito (em pixels)
        top: 25,    // padding superior (em pixels)
        bottom: 5  // padding inferior (em pixels)
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // posição da legenda: top, bottom, left, right
        labels: {
          color: '#333', // cor da legenda
          padding: 10,
          font: {
            family: 'Roboto',
            size: 11,
            weight: 'bold',
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const idx = context.dataIndex;
            const d = historyData[idx];
            if (context.dataset.label === 'Volume') {
              return `Volume: ${d.Volume.toLocaleString()}`;
            }
            return [
              `Close: ${d.Close.toFixed(4)}`,
              `Open: ${d.Open.toFixed(4)}`,
              `High: ${d.High.toFixed(4)}`,
              `Low: ${d.Low.toFixed(4)}`,
            ];
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
      // @ts-expect-error crosshair is from external plugin and not in Chart.js types
      crosshair: {
        line: {
          color: '#fff',   
          width: 2,
          dashPattern: [4, 4], 
        },
        sync: { enabled: false },
        zoom: { enabled: false },
        snap: true,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
        offset: false,
      },
      xPrice: {
        grid: {
          display: true,
          color: '#eee', 
          drawTicks: true,        
          tickColor: 'red',
          tickLength: 8,
        },
        ticks: {
          maxTicksLimit: 5,
          callback: function(tickValue: string | number) {
            const dateStr = chartDataLabels[tickValue as number];
            if (!dateStr) return '';

            const d = new Date(dateStr);
            console.log(d, dateStr)
            return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
          },
          color: '#555',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#eee', 
        },
        ticks: {
          color: '#555',
          font: {
            size: 12,
          },
          callback: function(tickValue: string | number) {
            if (typeof tickValue === "number") {
              return tickValue.toFixed(2);
            }
            return tickValue;
          }

        },
        // title: { display: true, text: "Precio" },
      },
      yVolume: {
        position: 'right',
        grid: { display: false },
        // ticks: { display: false }, 
        ticks: {
          display: true,
          color: '#888',
          font: { size: 11 },
          callback: function(tickValue: string | number) {
            // Compact notation: k, M, B
            if (typeof tickValue === "number") {
              const absVal = Math.abs(tickValue);
              if (absVal >= 1_000_000_000) return (tickValue/1e9).toFixed(1).replace('.0','') + 'B';
              if (absVal >= 1_000_000) return (tickValue/1e6).toFixed(1).replace('.0','') + 'M';
              if (absVal >= 1_000) return (tickValue/1e3).toFixed(1).replace('.0','') + 'k';
              return tickValue;
            }
          }
        },
        title: { display: false },
        beginAtZero: true,
        max: Math.max(...historyData.map(d => d.Volume)) * 1, // *3 diminui a altura relativa das barras!
        // O multiplicador faz com que as barras fiquem proporcionais, mas não enormes.
      }
    },
  } as const;

  // const calculateDailyVariation = (prices: number[] | undefined): string => {
  //   if (!prices || prices.length < 2) return "--";
  
  //   const today = prices[0];
  //   const yesterday = prices[1];
  
  //   const variation = ((today - yesterday) / yesterday) * 100;
  //   const roundedVariation = variation.toFixed(2);
  
  //   const symbol = variation > 0 ? "+" : variation < 0 ? "-" : "";
  //   return `${symbol}${roundedVariation}%`;
  // };
  
  function getVarValue(isPercent = true) {
    if (!historyData || historyData.length < 2) return {value: '--', positive: false};
    const last = historyData[0].Close;
    const first = historyData[historyData.length - 1].Close;
    const diff = first - last;
    const positive = diff >= 0;
    if (isPercent) {
      const percent = (diff / last) * 100;
      return {
        value: `${diff >= 0 ? '▲' : '▼'} ${Math.abs(percent).toFixed(2)}%`,
        positive,
      };
    } else {
      const str = (diff >= 0 ? '+ ' : '- ') + Math.abs(diff).toFixed(4);
      return {
        value: str,
        positive,
      };
    }
  }

  function formatTime(epochSeconds?: number) {
    if (!epochSeconds) return '';
    const dt = new Date(epochSeconds * 1000);
    return dt.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,    
    });
  }

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Title */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.2vw',
            padding: 'calc(3vh) calc(3vh) 0 calc(3vh)',
          }}
        >
          <Typography variant="h2" sx={{ marginLeft: '1vw' }}>
            Market Intelligence
          </Typography>

        </Box>
        <Divider sx={{mx:'calc(3vh)'}}/>

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'top',
            height: '100%',
            width: '100%',
            overflow: 'auto',
            // backgroundColor: 'red',
          }}
        >
          {/* Here goes all the dashboards */}
          <Box sx={{ padding: '3vh', width: '100%', display: 'flex', flexDirection: 'column', gap: '3vh' }}>
            <Box sx={{ display: 'flex', gap: '3vh'}}>
              {/* Primeira Fileira */}
              <Box sx={{ display: 'flex', flex: 1.5, flexDirection:'column', gap: '3vh' }}>

                {/* Overview */}
                <Box sx={{ border: '1px solid #ddd', borderRadius: 3, px: 3, py:2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  {/* Title and select */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="#A700FF">
                      Overview del titolo mensile
                    </Typography>
                    <Box>
                      <TextField
                        select
                        label="Periodo"
                        value={period}
                        onChange={e => setPeriod(e.target.value)}
                        size='small'
                        sx={{
                          minWidth: 110,
                          mr: 2,
                          fontSize: '0.85rem',
                          '& .MuiInputBase-root': { fontSize: '0.85rem' },
                          '& .MuiInputLabel-root': { fontSize: '0.85rem' },
                        }}
                      >
                        {Object.entries(periodi).map(([key, label]) => (
                          <MenuItem value={key} key={key} sx={{ fontSize: '0.85rem', minHeight: '1.5em' }}>{label}</MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        label="Intervallo"
                        value={interval}
                        onChange={e => setInterval(e.target.value)}
                        size="small"
                        sx={{
                          minWidth: 110,
                          fontSize: '0.85rem',
                          '& .MuiInputBase-root': { fontSize: '0.85rem' },
                          '& .MuiInputLabel-root': { fontSize: '0.85rem' },
                        }}
                      >
                        {Object.entries(intervalli).map(([key, label]) => (
                          <MenuItem value={key} key={key} sx={{ fontSize: '0.85rem', minHeight: '1.5em' }}>{label}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Graph */}
                    {/* <Box sx={{ flex:1, height: 250, bgcolor: '#f7f7f7', borderRadius: 3, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src="/image/mock_graph_1.png"
                        alt="Mock Graph 1"
                        style={{ width: '100%', height:'100%' }}
                      />
                    </Box> */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection:'column', gap: 1 }}>
                      <Typography sx={{ color: '#888', textAlign: 'start', fontSize: '0.6rem' }}>
                        ultima aggiornamento: {historyInfo?.regularMarketTime ? formatTime(historyInfo.regularMarketTime) : ''}
                      </Typography>
                      <Box sx={{ height: 250, bgcolor: '#f7f7f7', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Chart type="line" data={chartData} options={chartOptions} />
                      </Box>
                    </Box>

                    {/* Cards */}
                    <Box sx={{ display: 'flex', flexDirection:'column', gap: 1, mt: 2, mb:2, width: '150px'}}>
                      <Box sx={{  display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center', height:'70px' }}>
                        <Box
                          component="img"
                          src={CardEuroIcon}
                          alt="Euro Icon"
                          sx={{
                            width: "35px",
                            height: "35px",
                            marginRight: '6px',
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection:'column'}}>
                          <Typography variant="subtitle2"><b>{prezzoAttuale} {currencySymbol}</b></Typography>
                          <Typography variant="caption" sx={{lineHeight:1, mt:0.5}}>Prezzo attuale</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center', height:'70px' }}>
                        <Box
                          component="img"
                          src={CardArrowsIcon}
                          alt="Euro Icon"
                          sx={{
                            width: "35px",
                            height: "35px",
                            marginRight: '6px',
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection:'column'}}>
                          <Typography 
                            variant="subtitle2"
                            onClick={() => setVarPercent(v => !v)}
                            sx={{cursor:'pointer', color: getVarValue(varPercent)?.positive === false ? 'red' : '#10AF2A'}}
                          >
                            <b>{getVarValue(varPercent)?.value}</b>
                          </Typography>
                          <Typography variant="caption" sx={{lineHeight:1, mt:0.5}}>Variazione del periodo</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center', height:'70px' }}>
                        <Box
                          component="img"
                          src={CardCurveArrowIcon}
                          alt="Euro Icon"
                          sx={{
                            width: "35px",
                            height: "35px",
                            marginRight: '6px',
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection:'column'}}>
                          {/* <Typography variant="subtitle2"><b>{stockData? stockData.stock_volatility_level: ''}</b></Typography>
                          <Typography variant="caption" sx={{lineHeight:1, mt:0.5}}>Volatilità</Typography> */}
                          <Typography variant="subtitle2"><b>{companyInfo?.debtToEquity != null ? `${companyInfo.debtToEquity.toFixed(1)}%` : '--'}</b></Typography>
                          <Typography variant="caption" sx={{lineHeight:1, mt:0.5}}>Debt / Equity</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mt: 2, mb:1.5 }}/>

                  {/* Table */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    position: 'relative', 
                    pb:1,
                  }}>

                    {/* Linha pontilhada vertical */}
                    <Box sx={{ 
                      position: 'absolute', 
                      height: '100%', 
                      left: '50%', 
                      top: 0, 
                      borderLeft: '1px dotted #ccc', 
                    }}/>

                    {/* Linha pontilhada horizontal */}
                    {/* <Box sx={{ 
                      position: 'absolute', 
                      width: '100%', 
                      left: 0, 
                      top: `${linePosition}px`, 
                      borderTop: '1px dotted #ccc', 
                    }}/> */}

                    <Box sx={{ flex: '1 1 50%', pb: 1, pl:2, mt:1 }}>
                      <Typography variant="subtitle1">Settore: <b>{companyInfo ? `${companyInfo.industry} / ${companyInfo.sector}` : ''}</b></Typography>
                      <Typography variant="subtitle1">Capitalizzazione mercato: <b>{companyInfo ? `€ ${companyInfo.marketCap?.toLocaleString('it-IT')}` : ''}</b></Typography>
                      <Typography variant="subtitle1">Raccomandazione: <b>{companyInfo ? companyInfo.recommendationKey.replace('_', ' ') : ''}</b></Typography>
                      <Typography variant="subtitle1">Indice PE: <b>{companyInfo && companyInfo.forwardPE != null ? companyInfo.forwardPE.toFixed(1) : 'N/A'}</b></Typography>
                    </Box>

                    <Box 
                      sx={{ flex: '1 1 50%', pb: 1, pl:2, mt:1, maxWidth: '50%' }}
                      onMouseEnter={() => setHoveredElement('risk_factors')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <Typography variant="subtitle1">Eventuali Fattori di Rischio:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={ellipsisStyles}>
                        {stockData?.possible_risk_factors || ''}
                      </Typography>

                      <Grow in={hoveredElement === 'risk_factors'} timeout={'auto'} unmountOnExit >
                        <Box sx={{
                          position: 'absolute',
                          zIndex: 20,
                          bgcolor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 2,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          px: 2,
                          py: 1.5,
                          width: '80%',
                          maxWidth: 800,
                        }}>
                          {/* <Typography variant="subtitle2" sx={{fontSize:'0.8rem'}}>
                            {stockData?.possible_risk_factors || ''}
                          </Typography> */}
                          <div className="markdown-body">
                            <ReactMarkdown>{stockData?.possible_risk_factors || ''}</ReactMarkdown>
                          </div>
                        </Box>
                      </Grow>
                        
                    </Box>

                    <Box sx={{ 
                      width: '100%',                     
                      borderTop: '1px dotted #ccc', 
                    }}/>

                    <Box 
                      sx={{ flex: '1 1 50%', pt: 1, px:2, mt:1 }}
                      onMouseEnter={() => setHoveredElement('latest_news')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <Typography variant="subtitle1">Ultima Notizia Rilevante:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={ellipsisStyles}>
                        {stockData?.latest_news || ''}
                      </Typography>

                      <Grow in={hoveredElement === 'latest_news'} timeout={'auto'} unmountOnExit >
                        <Box sx={{
                          position: 'absolute',
                          zIndex: 20,
                          bgcolor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 2,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          px: 2,
                          py: 1.5,
                          width: '80%',
                          maxWidth: 800,
                        }}>
                          {/* <Typography variant="subtitle2" sx={{fontSize:'0.8rem'}}>
                            {stockData?.latest_news || ''}
                          </Typography> */}
                          <div className="markdown-body">
                            <ReactMarkdown>{stockData?.latest_news || ''}</ReactMarkdown>
                          </div>
                        </Box>
                      </Grow>
                    </Box>

                    <Box 
                      sx={{ flex: '1 1 50%', pt: 1, px:2, mt:1 }}
                      onMouseEnter={() => setHoveredElement('short_forecast')}
                      onMouseLeave={() => setHoveredElement(null)}
                    >
                      <Typography variant="subtitle1">Previsione a Breve Termine:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={ellipsisStyles}>
                        {stockData?.short_term_forecast || ''}
                      </Typography>


                      <Grow in={hoveredElement === 'short_forecast'} timeout={'auto'} unmountOnExit >
                        <Box sx={{
                          position: 'absolute',
                          zIndex: 20,
                          bgcolor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 2,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          px: 2,
                          py: 1.5,
                          width: '80%',
                          maxWidth: 800,
                        }}>
                          {/* <Typography variant="subtitle2" sx={{fontSize:'0.8rem'}}>
                            {stockData?.short_term_forecast || ''}
                          </Typography> */}
                          <div className="markdown-body">
                            <ReactMarkdown>{stockData?.short_term_forecast || ''}</ReactMarkdown>
                          </div>
                        </Box>
                      </Grow>
                    </Box>

                  </Box>
                  
                  {/* <Typography sx={{mt:3, cursor:'pointer', textDecoration:'underline', fontSize:'1rem', textAlign:'center', color:"#888"}}>Espandi</Typography> */}
                </Box>

                {/* Insight Report */}
                <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, px: 3, pt: 2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)', maxHeight: expanded ? 'none' : '382px', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" color="#5072CC">
                      Insight Report - Performance Aziendale
                    </Typography>
                    <Box
                      component="select"
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(e.target.value)}
                      sx={{ borderRadius: 3, py: 1, px: 3, borderColor: '#ccc', color: 'grey' }}
                    >
                      <option>Q1 2025</option>
                      <option>Q2 2025</option>
                      <option>Q3 2025</option>
                      <option>Q4 2025</option>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 8, overflow: 'auto' }}>
                    <div className="markdown-body">
                      <ReactMarkdown>{insightReport}</ReactMarkdown>
                    </div>
                  </Box>
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '80px',
                      background: 'linear-gradient(to top, white 60%, transparent)',
                      pointerEvents: 'none',
                      zIndex: 1, 
                    }}
                  />

                  <Typography
                    onClick={() => setExpanded(!expanded)}
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: '#888',
                      textDecoration: 'underline',
                      zIndex: 2,
                    }}
                  >
                    {expanded ? 'Retract' : 'Espandi'}
                  </Typography>

                </Box>

              </Box>

              {/* Segunda Fileira*/}
              <Box sx={{ display: 'flex', flex: 1, flexDirection:'column', gap: '3vh' }}>

                {/* Notizie dei competitors */}
                <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="h4" fontWeight="bold" color="#ED6008">
                    Notizie dei competitors
                  </Typography>
                  <Box sx={{ my: 2, mb: 4 }}>
                    {paginateCompetitors().map((article, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', py: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            width: '400px',  
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Link
                          href={article.url}
                          target="_blank"
                          color="secondary"
                          sx={{
                            cursor: 'pointer',
                            fontSize: 14,
                            ':hover': { color: 'secondary.dark' }
                          }}
                        >
                          Vai all’articolo
                        </Link>
                      </Box>
                    ))}
                  </Box>
                  <Typography
                    onClick={handleCompetitorsNewsExpand}
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: "#888",
                      textDecoration: 'underline',
                      ':hover': { color: 'primary.dark' }
                    }}
                  >
                    {competitorsPerPage === 10 ? "Espandi" : "Retract"}
                  </Typography>
                </Box>

                
                {/* Aziende competitors */}
                <Box sx={{ 
                  position: 'relative', 
                  // flex: 1, 
                  maxHeight: '760px',
                  border: '1px solid #ddd', 
                  borderRadius: 3, 
                  padding: 3, 
                  boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' 
                }}>
                  <Typography variant="body2" fontWeight="bold" color="#10AF2A">
                    Aziende competitors
                  </Typography>

                  <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 12fr)',
                      gap: 1,
                      my: 3,
                      alignItems: 'center',
                      justifyItems: 'center',
                      width: '100%',
                    }}>
                    {competitors.slice(0, visibleCompetitorsCount).map((company: Competitor, index: number) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          width: '120px', 
                          height:'120px',
                          position: 'relative',
                          cursor: 'pointer',
                          ':hover': {
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                            borderRadius: 2,
                          }
                        }}
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                        onClick={() => window.open(company.website, '_blank')}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', height:'100%', mb:2 }}>
                          <Box component="img" src={company.logo} 
                              sx={{ 
                                  width: '50px', 
                                  height: '50px',
                                  objectFit: 'contain',
                                  marginBottom: '10px', 
                              }} 
                          />
                          <Typography variant="caption" sx={{fontSize:'0.8rem', lineHeight:1.2}}>{company.competitor}</Typography>
                        </Box>

                        <Grow in={hoverIndex === index} timeout={'auto'} unmountOnExit >
                          <Box sx={{
                            position: 'absolute',
                            top: '100%',
                            left: '-35%',
                            width: '200px',
                            bgcolor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: 2,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            p: 1,
                            zIndex: 10,
                          }}>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {company.description}
                            </Typography>
                          </Box>
                        </Grow>

                      </Box>
                    ))}
                  </Box>

                  <Typography
                    onClick={handleCompetitorsExpand}
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: "#888",
                      textDecoration: 'underline',
                    }}
                  >
                    {visibleCompetitorsCount === 12 ? "Espandi" : "Retract"}
                  </Typography>
                </Box>

              </Box>
            </Box>

            {/* Terceiro Área - Grafico Andamento */}
            {/* <Box sx={{ border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="body2" fontWeight="bold" color='#A700FF'>Andamento rispetto ai competitors</Typography>
              <Box sx={{height:'460px', borderRadius:2, mt:3, pl:1, pb:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <img 
                  src="/image/mock_graph_2.png"
                  alt="Mock Graph 2"
                  style={{ width: '100%', height:'100%' }}
                />
              </Box>
            </Box> */}

            {/* Quarta Fileira */}
            <Box sx={{display:'flex', gap: 3}}>

              


              <Box sx={{ flex:1, display:'flex', flexDirection:'column', gap:3, width:'100%'}}>
                {/* Notizie rilevanti del settore */}
                <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="h4" fontWeight="bold" color='#5072CC'>
                    Notizie rilevanti del settore
                  </Typography>
                  <Box sx={{ my: 2, mb: 3 }}>
                    {paginatedSectorNews().map((article, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', py: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            width: '90%',  
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Link
                          href={article.url}
                          target="_blank"
                          color="secondary"
                          sx={{
                            cursor: 'pointer',
                            fontSize: 14,
                            ':hover': { color: 'secondary.dark' }
                          }}
                        >
                          Vai all’articolo
                        </Link>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
                    <Pagination
                      count={Math.ceil(sectorNews.length / sectorNewsPerPage)}
                      page={sectorPage}
                      onChange={(_, newPage) => setSectorPage(newPage)}
                      color="primary"
                      siblingCount={1}
                      boundaryCount={2} 
                    />
                  </Box>
                </Box>

                {/* Market Overview Report */}
                <Box sx={{ flex: 1, position: 'relative', border: '1px solid #ddd', borderRadius: 3, px: 3, py: 2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" color='#A700FF'>
                      Overview Report
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<OpenInNewIcon />}
                      sx={{
                        width: '110px',
                        borderRadius: 3,
                        py: 1,
                        px: 1,
                        borderColor: '#ccc',
                        color: 'grey',
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '400',
                        '&:hover': {
                          borderColor: '#bbb',
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      Esporta
                    </Button>
                  </Box>
                  <Box sx={{ mt: 1, overflow: 'auto' }}>
                  <div className="markdown-body">
                    <ReactMarkdown>{overviewReport}</ReactMarkdown>
                  </div>
                  </Box>

                </Box>

              </Box>
            </Box>

          </Box>

        </Box>
      </Box>
    </Layout>
  )
}

export default Market
