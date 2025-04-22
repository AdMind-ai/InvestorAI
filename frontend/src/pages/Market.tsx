import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, Link, Button, Pagination, Grow } from '@mui/material'
import ReactMarkdown from 'react-markdown';
// import { useTheme } from '@mui/material/styles'
import '../styles/markdown.css';
import Layout from '../layouts/Layout'
import { api } from '../api/api'

// Icon Imports
import CardEuroIcon from '../assets/dashboard_icons/card_euro_icon.svg'
import CardArrowsIcon from '../assets/dashboard_icons/card_arrows_icon.svg'
import CardCurveArrowIcon from '../assets/dashboard_icons/card_curvearrow_icon.svg'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, 
  LinearScale,   
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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


  const chartData = {
    labels: stockData ? stockData.created_at.map(date => new Date(date).toLocaleDateString()) : [],
    datasets: [
      {
        label: 'Prezzo del titolo (€)',
        data: stockData ? stockData.stock_price_today_eur : [],
        borderColor: 'orange',
        backgroundColor: 'rgba(255,165,0,0.4)', // preenchimento abaixo da linha colorido com transparência
        fill: true, // preenche a área abaixo da linha
        tension: 0.3, // curva suave (0 é reto, 0.5 mais suavizado)
        pointBackgroundColor: 'orange',
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: 'Prezzo del titolo (USD)',
        data: stockData ? stockData.stock_price_today_usd : [],
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.3)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: 'blue',
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true, 
    maintainAspectRatio: false, 
    animation: {
      duration: 1500,
      easing: 'easeOutQuart', 
    },
    layout: {
      padding: {
        left: 20,   // padding esquerdo (em pixels)
        right: 50,  // padding direito (em pixels)
        top: 30,    // padding superior (em pixels)
        bottom: 10  // padding inferior (em pixels)
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // posição da legenda: top, bottom, left, right
        labels: {
          color: '#333', // cor da legenda
          padding: 15,
          font: {
            family: 'Roboto',
            size: 12,
            weight: 'bold',
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: '#eee', 
        },
        ticks: {
          color: '#555',
          font: {
            size: 12,
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
        },
      },
    },
  } as const;

  const calculateDailyVariation = (prices: number[] | undefined): string => {
    if (!prices || prices.length < 2) return "--";
  
    const today = prices[0];
    const yesterday = prices[1];
  
    const variation = ((today - yesterday) / yesterday) * 100;
    const roundedVariation = variation.toFixed(2);
  
    const symbol = variation > 0 ? "+" : variation < 0 ? "-" : "";
    return `${symbol}${roundedVariation}%`;
  };
  
//   useEffect(() => {
//     const measureHeight = () => {
//         if(riskFactorsRef.current) {
//             const height = riskFactorsRef.current.offsetTop + riskFactorsRef.current.offsetHeight;
//             setLinePosition(height+3);
//         }
//     };

//     measureHeight();

//     window.addEventListener('resize', measureHeight); 

//     return () => window.removeEventListener('resize', measureHeight);
// }, [stockData?.possible_risk_factors]);


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
                    <Box component="select" sx={{ borderRadius: 3, py: 1, px:3, borderColor: '#ccc', color:'grey', cursor:'pointer' }}>
                      <option>Ultimi 12 mesi</option>
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
                    <Box sx={{ flex: 1, height: 250, bgcolor: '#f7f7f7', borderRadius: 3, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Line data={chartData} options={chartOptions} />
                    </Box>

                    {/* Cards */}
                    <Box sx={{ display: 'flex', flexDirection:'column', gap: 1, mt: 2, mb:2 }}>
                      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center' }}>
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
                          <Typography variant="subtitle2"><b>{stockData? stockData.stock_price_today_eur[0]: ''} €</b></Typography>
                          <Typography variant="caption">Prezzo attuale</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center' }}>
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
                          <Typography variant="subtitle2">
                            <b>{calculateDailyVariation(stockData?.stock_price_today_eur)}</b>
                          </Typography>
                          <Typography variant="caption">Var. giornaliera</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center' }}>
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
                          <Typography variant="subtitle2"><b>{stockData? stockData.stock_volatility_level: ''}</b></Typography>
                          <Typography variant="caption">Volatilità</Typography>
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
                      <Typography variant="subtitle1">Settore: <b>{stockData? stockData.sector: ''}</b></Typography>
                      <Typography variant="subtitle1">Capitalizzazione mercato: <b>U$ {stockData? stockData.market_cap_usd: ''}</b></Typography>
                      <Typography variant="subtitle1">Indice PE: <b>{stockData? stockData.pe_ratio: ''}</b></Typography>
                      <Typography variant="subtitle1">Raccomandazione: <b>{stockData? stockData.analyst_recommendation: ''}</b></Typography>
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
