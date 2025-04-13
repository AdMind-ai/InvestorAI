import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, Link, Button, Pagination } from '@mui/material'
import ReactMarkdown from 'react-markdown';
// import { useTheme } from '@mui/material/styles'
import '../styles/markdown.css';
import Layout from '../layouts/Layout'
import { api } from '../api/api'

// Icon Imports
import CardEuroIcon from '../assets/dashboard_icons/card_euro_icon.svg'
import CardArrowsIcon from '../assets/dashboard_icons/card_arrows_icon.svg'
import CardCurveArrowIcon from '../assets/dashboard_icons/card_curvearrow_icon.svg'

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



const Market: React.FC = () => {
  // const theme = useTheme()
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

  useEffect(() => {
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

    fetchCompetitors();
    fetchArticles();
    fetchOverviewReport();
  }, []);

  // Pagination logic for competitors
  const paginateCompetitors = () => {
    const start = (currentPage - 1) * competitorsPerPage;
    const end = start + competitorsPerPage;
    return competitorNews.slice(start, end);
  };

  const handleCompetitorsNewsExpand = () => {
    if (competitorsPerPage === 10) {
      setCompetitorsPerPage(20);
    } else {
      setCompetitorsPerPage(10);
    }
  };

  const paginatedSectorNews = () => {
    const start = (sectorPage - 1) * sectorNewsPerPage;
    return sectorNews.slice(start, start + sectorNewsPerPage);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
                    <Box sx={{ flex:1, height: 250, bgcolor: '#f7f7f7', borderRadius: 3, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src="/image/mock_graph_1.png"
                        alt="Mock Graph 1"
                        style={{ width: '100%', height:'100%' }}
                      />
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
                          <Typography variant="subtitle2"><b>19.455€</b></Typography>
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
                          <Typography variant="subtitle2"><b>+1.5%</b></Typography>
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
                          <Typography variant="subtitle2"><b>Moderata</b></Typography>
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
                    <Box sx={{ 
                      position: 'absolute', 
                      width: '100%', 
                      left: 0, 
                      top: '53%', 
                      borderTop: '1px dotted #ccc', 
                    }}/>

                    <Box sx={{ flex: '1 1 50%', pb: 1, pl:2, mt:1 }}>
                      <Typography variant="subtitle1">Settore: <b>Tecnologia</b></Typography>
                      <Typography variant="subtitle1">Capitalizzazione mercato: <b>$150 miliardi</b></Typography>
                      <Typography variant="subtitle1">Indice PE: <b>25.5</b></Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 50%', pb: 1, pl:2, mt:1 }}>
                      <Typography variant="subtitle1">Eventuali Fattori di Rischio:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">Potenziale rallentamento delle vendite nel mercato europeo.</Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 50%', pt: 1, pl:2, mt:1 }}>
                      <Typography variant="subtitle1">Ultima Notizia Rilevante</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">TechCorp ha lanciato un nuovo smartphone che ha ricevuto recensioni positive.</Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 50%', pt: 1, pl:2, pr:2, mt:1 }}>
                      <Typography variant="subtitle1" sx={{ }}>Previsione a Breve Termine</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">Il titolo è previsto continuare una crescita moderata grazie al successo del nuovo prodotto.</Typography>
                    </Box>

                  </Box>
                  
                  {/* <Typography sx={{mt:3, cursor:'pointer', textDecoration:'underline', fontSize:'1rem', textAlign:'center', color:"#888"}}>Espandi</Typography> */}
                </Box>

                {/* Insight Report */}
                <Box sx={{ position:'relative', border: '1px solid #ddd', borderRadius: 3, px: 3, py: 2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" color="#5072CC">
                      Insight Report - Performance Aziendale
                    </Typography>
                    <Box component="select" sx={{ borderRadius: 3, py: 1, px:3, borderColor: '#ccc', color:'grey' }}>
                      <option>Q3 2024</option>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{mt:1.5, mb:0.5}}>
                      Highlights Finanziari
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Ricavi Totali: €2,1 miliardi (+12% YoY).
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Crescita del Margine Operativo: EBIT al 19,5% (+2,3 pp rispetto al trimestre precedente).
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Profitto Netto: €310 milioni (+18% YoY), grazie a un forte focus su efficienza operativa e nuova espansione geografica.
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Portafoglio Ordini: Raggiunto un livello record di €4,5 miliardi (+26% YoY).
                    </Typography>

                    <Typography variant="h4" fontWeight="bold" sx={{mt:1.5, mb:0.5}}>
                      Innovazione e Strategia
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Investimento in R&D: €120 milioni nel Q3 (+15% YoY), consolidando la leadership in soluzioni tecnologiche innovative.
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Lanciati 3 nuovi prodotti nel settore AI e IoT (Internet of Things), con particolare attenzione all’automazione industriale.
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:6, ml: 1, lineHeight:1.2}}>
                      • Espansione del team di ricerca con l’assunzione di 150 nuovi talenti specializzati in intelligenza artificiale e machine learning.
                    </Typography>

                  </Box>

                  <Typography
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
                    Espandi
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
                  flex: 1, 
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

                        {hoverIndex === index && (
                          <Box sx={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
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
                        )}
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
