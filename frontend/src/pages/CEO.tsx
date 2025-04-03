import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  Link,
  Pagination,
  PaginationItem,
  Avatar,
  CircularProgress,
  Button,
} from '@mui/material';
import Layout from '../layouts/Layout';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { toast } from 'react-toastify'
import { api } from '../api/api';

import SadFace from '../assets/icons/sad-face.svg';
import HappyFace from '../assets/icons/happy-face.svg';
import NeutralFace from '../assets/icons/neutral-face.svg';

import NewsModal from '../components/NewsModal';


interface NewsItem {
  id: number;
  title: string;
  content: string;
  url: string;
  source: string;
  author: string;
  date_published: string;
  personality: string;
  created_at: string;
  sentiment: string;
  viewed: boolean;
}

const personalities = ['Mario Rossi', 'Elvira Giacomelli', 'Luigi Farris']



const CEOPage: React.FC = () => {
  const theme = useTheme();
  const [selectedPerson, setSelectedPerson] = useState<string>('Mario Rossi');
  const [loadingGenerateArticles, setLoadingGenerateArticles] = useState<boolean>(false);
  const [loadingArticlesList, setLoadingArticlesList] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<'perplexity' | 'openai'>('openai');
  const [viewedArticles, setViewedArticles] = useState<Set<number>>(new Set());
  const [data, setData] = useState<Record<string, NewsItem[]>>({
      'Mario Rossi': [],
      'News reati informativi': [],
      'Luigi Farris': [],
  });

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<NewsItem | null>(null);

  const MAX_LENGTH = 220; 
  const getPreviewText = (text:string) => {
    if (text.length > MAX_LENGTH) {
      return text.slice(0, MAX_LENGTH) + '...'; 
    }
    return text;
  };

  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(6);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentData = data[selectedPerson] || [];

  
  // Articles Data
  const sortedData = [...currentData].sort((a, b) =>
    dayjs(b.created_at).diff(dayjs(a.created_at))
  );
  const displayedNews = sortedData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Load Articles on page initialization
  useEffect(() => {
    loadData();
  }, []);


  // Controls how many articles on page based on height
  useEffect(() => {
    const calculateRows = () => {
      if (!containerRef.current) return;
  
      const containerHeight = containerRef.current.clientHeight;
      const firstNewsItem = containerRef.current.querySelector('[data-news-item]');
  
      if (!firstNewsItem) return;
  
      const itemHeight = firstNewsItem.clientHeight || 55; 
      const paginationHeight = 50;
      const headerHeight = 50;
      const availableHeight = containerHeight - paginationHeight - headerHeight - 20;
  
      const calculatedRows = Math.max(1, Math.floor(availableHeight / itemHeight));
      setRowsPerPage(calculatedRows);
    };
  
    calculateRows(); 
    window.addEventListener('resize', calculateRows);
  
    return () => {
      window.removeEventListener('resize', calculateRows);
    };
  }, [containerRef.current]);


  // Calculate the total number of pages 
  useEffect(() => {
    const totalPages = Math.ceil(currentData.length / rowsPerPage);
    if (page > totalPages && totalPages !== 0) setPage(totalPages);
  }, [rowsPerPage, currentData.length, page]);


  // Sentiment
  const validSentiments = currentData.filter(item => item.sentiment !== null && item.sentiment !== undefined);

  const averageSentiment = validSentiments.length
  ? Math.round(validSentiments.reduce((acc, cur) => acc + parseFloat(cur.sentiment), 0) / validSentiments.length)
  : null; 

  const sentimentText = 
    averageSentiment === null ? '--' : 
    averageSentiment >= 60 ? 'Alto' : 
    averageSentiment >= 40 ? 'Medio' : 'Basso';

  const colorSentiment =
    averageSentiment === null ? 'grey.500' :
    averageSentiment >= 60 ? 'success.main' : 
    averageSentiment >= 40 ? 'warning.main' : 'error.main';



  // Generate Articles
  const fetchCEOArticles = async (personality: string) => {
    const endpoint = selectedProvider === 'openai' ? '/openai/ceo-news/' : '/perplexity/ceo-news/';
    const response = await api.post(endpoint, { personality });
    console.log(response)
    const numCreated = response.data.num_created;
    toast.success(`${numCreated} new articles for: ${personality}`);
    loadData();
    return response.data;
  };

  const handleFetchArticles = async () => {
    setLoadingGenerateArticles(true);
    try {
      // parallel requests 
      await Promise.all(personalities.map(fetchCEOArticles));
      setLoadingGenerateArticles(false);

    } catch (error) {
      setLoadingGenerateArticles(false);
      console.error("Error fetching CEO articles:", error);
      toast.error(`Error fetching CEO articles`);
    }
  };


  // Load Articles 
  const loadData = async () => {
    setSelectedProvider('openai');
    try {
      setLoadingArticlesList(true)
      const res = await api.get<NewsItem[]>("/ceo-articles/");

      const groupedData: Record<string, NewsItem[]> = {
        'Mario Rossi': [],
        'Elvira Giacomelli': [],
        'Luigi Farris': [],
      };
  

      res.data.forEach(article => {
        if(groupedData[article.personality]) {
          groupedData[article.personality].push(article);
        }
      });

      setData(groupedData);
      setSelectedPerson(personalities[0]);
      setLoadingArticlesList(false)
    } catch (error) {
      console.error("Error updating ESG articles:", error);
    }
  };

  const handleNewsOpen = async (article: NewsItem) => {
      setModalContent(article);
      setModalOpen(true);
      setViewedArticles(prev => new Set([...prev, article.id]));
  
      try {
        await api.put(`/ceo-articles/${article.id}/mark_viewed/`);
      } catch (error) {
        console.error("Erro ao marcar artigo como visualizado:", error);
      }
    };


  return (
    <Layout>
      <Box sx={{ padding: '3vh', overflow: 'auto', height: '100%', width: '100%' }}>
        <Box sx={{display:'flex', justifyContent: 'space-between', mr:2}}>
          <Typography variant="h2" sx={{ marginBottom: '0.2vw', marginLeft: '1vw'}}>CEO Perception</Typography>
          {/* Test Component */}
          <Box sx={{height: 'calc(4.5vh)', ml:40, position: 'relative'}}>
            {/* <ToggleButtonGroup
              value={selectedProvider}
              exclusive
              onChange={(_, newProvider) => {
                if (newProvider) setSelectedProvider(newProvider);
              }}
              sx={{height: 'calc(4vh)', mr:1.5 }}
            >
              <ToggleButton value="perplexity">Perplexity</ToggleButton>
              <ToggleButton value="openai">OpenAI</ToggleButton>
            </ToggleButtonGroup> */}
            <Button variant='contained' onClick={handleFetchArticles} sx={{height: 'calc(4vh)', position:'absolute', right:0, bottom:10}}>
              {loadingGenerateArticles ? <CircularProgress size={24} color="inherit" /> : 'Generate articles'}
            </Button>
          </Box>
        </Box>  
        <Divider sx={{ marginBottom: 3 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0 2vh',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 1,
            }}
          >
            <Box >
              {/* Toggle buttons */}
              <ToggleButtonGroup
                value={selectedPerson}
                exclusive
                onChange={(_, value) => { if (value) { setSelectedPerson(value); setPage(1); } }}
                sx={{ display: 'flex', gap: 2, borderRadius: '12px', overflow: 'visible', width: '100%', mb: 3.6 }}
              >
                {personalities.map(name => (
                  <ToggleButton
                    key={name}
                    value={name}
                    sx={{
                      borderRadius: '10px !important',
                      padding: '8px 16px',
                      // fontWeight: selectedPerson === option.title ? 'bold' : 'regular',
                      height: 'calc(5.3vh)',
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.grey[300]} !important`,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.light,
                        borderColor: `${theme.palette.primary.main} !important`,
                      },
                    }}
                  >
                    {name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {/* Description */}
              <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={0.8}>
                <Box sx={{}}>
                  <Typography variant="h4">
                    {selectedPerson} <small style={{ color: '#7E7E7E' }} >({currentData.length})</small>
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 0.8 }}>
                    Ecco una panoramica di ciò che il web comunica su di te e sulla tua reputazione professionale.
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Sentiment */}
            <Paper variant="outlined" sx={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 1, borderRadius: '12px', backgroundColor: 'transparent', border: '1px solid #E4E4E4' }}>
              <Avatar sx={{ bgcolor: 'transparent' }}>
                <img 
                  src={
                    averageSentiment === null ? NeutralFace : 
                    averageSentiment >= 60 ? HappyFace : 
                    averageSentiment >= 40 ? NeutralFace : 
                    SadFace
                  } 
                  alt="Sentiment" 
                  style={{ width: '40px', height: '40px' }} 
                />
              </Avatar>
              <Box sx={{ padding: 1 }}>
                <Typography variant="subtitle2">Sentiment medio</Typography>
                <Typography variant="h4" sx={{ color: colorSentiment, mt:0.5 }}>
                  {averageSentiment !== null ? `${averageSentiment}%` : '-- %'} • {sentimentText}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* News table */}
          {loadingArticlesList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '53vh' }}>
              <CircularProgress />
            </Box>
          ) : (     
            <Paper
              ref={containerRef}
              elevation={1}
              sx={{
                padding: 2,
                borderRadius: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #E4E4E4',
                boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
                height: '53vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative', 
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 1,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Typography variant='h4' sx={{ width: '70%', paddingX: '10px' }}>
                  Anteprima
                </Typography>
                <Typography variant='h4' sx={{ paddingLeft: '40px' }}>
                  Link
                </Typography>
                <Typography variant='h4' sx={{ paddingX: '10px' }}>
                  Sentiment
                </Typography>
              </Box>

              {/* News */}
              <Box sx={{ overflowY: 'auto', flex: 1, mb: 2 }}>
              {displayedNews.map((news, idx) => {
                const isNew = !news.viewed && !viewedArticles.has(news.id);
                
                return (
                  <Box
                    key={idx}
                    data-news-item
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingY: 0.5,
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    {/* News content */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '70%',
                        padding: '0px 0px 0px 10px',
                        // bgcolor:'red'
                      }}
                    >  
                      <Typography
                        variant="subtitle2"
                        sx={{
                          width: '88%',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          padding: '0px 10px',
                        }}
                      >
                        {getPreviewText(news.content)}
                      </Typography>

                      {isNew && (
                        <Box
                          sx={{
                            bgcolor: theme.palette.secondary.main,
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            lineHeight: '1',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                            textTransform: 'uppercase',
                          }}
                        >
                          New
                        </Box>
                      )}
                    </Box>

                    {/* News Link */}
                    <Link
                      fontSize='16px'
                      component="button"
                      onClick={() => handleNewsOpen(news)}
                      sx={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme.palette.secondary.main,
                        textDecoration: 'underline',
                      }}
                    >
                      Vai all'articolo
                    </Link>

                    {/* News Sentiment */}
                    <Typography
                      variant='h6'
                      sx={{
                        color: news.sentiment !== null && news.sentiment !== undefined
                          ? parseInt(news.sentiment) > 60 ? 'green' : parseInt(news.sentiment) > 40 ? 'orange' : 'red'
                          : 'grey',
                        fontWeight: 'bold', 
                        paddingRight: '30px'
                      }}
                    >
                      {news.sentiment !== null && news.sentiment !== undefined ? `${news.sentiment}%` : '-- %'}
                    </Typography>
                  </Box>
                )
              })}
              </Box>

              {/* Pagination */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 1,
                  position: 'absolute',        
                  bottom: '8px',              
                  left: 0,
                  right: 0,
                  backgroundColor: 'transparent',
                }}
              >
                <Pagination
                  count={Math.ceil(currentData.length / rowsPerPage)}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  shape='rounded'
                  variant='outlined'
                  renderItem={(item) => (
                    <PaginationItem
                      components={{ previous: Typography, next: Typography }}
                      slots={{
                        previous: () => (
                          <Typography sx={{ textTransform: 'none', fontSize: '16px' }}>
                            ← Precedente
                          </Typography>
                        ),
                        next: () => (
                          <Typography sx={{ textTransform: 'none', fontSize: '16px' }}>
                            Successivo →
                          </Typography>
                        ),
                      }}
                      {...item}
                    />
                  )}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'text.primary',
                      borderRadius: '12px',
                      border: '1px solid #ddd',
                      margin: '0 4px',
                      height: '40px',
                      minWidth: '40px',
                      '&.Mui-selected': {
                        backgroundColor: '#f1f1f1',
                        borderColor: '#bbb',
                      },
                      '&:hover': {
                        backgroundColor: '#f1f1f1',
                      },
                      '&.MuiPaginationItem-previousNext': {
                        padding: '0px 12px',
                      },
                    },
                  }}
                />
              </Box>

            </Paper>
          )}
        </Box>
      </Box>
      {modalContent && (
        <NewsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sentiment={
            modalContent.sentiment !== null && modalContent.sentiment !== 'none' 
              ? parseInt(modalContent.sentiment) 
              : null
          }
          title={modalContent.title}
          content={modalContent.content}
          originalLink={modalContent.url}
        />
      )}
    </Layout>
  );
};

export default CEOPage;