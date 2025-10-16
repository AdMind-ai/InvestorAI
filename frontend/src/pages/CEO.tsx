import React, { useState, useEffect, useRef } from 'react';
import { useGlobal } from "../context/GlobalContext";
import type { CompanyInfoAdm } from "../interfaces/companyInfoInterface";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from '@mui/material';
import Layout from '../layouts/Layout';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { toast } from 'react-toastify'
import { api } from '../api/api';

// Icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningRounded';
import SadFace from '../assets/icons/sad-face.svg';
import HappyFace from '../assets/icons/happy-face.svg';
import NeutralFace from '../assets/icons/neutral-face.svg';
import CloseIcon from '@mui/icons-material/Close';
import InfoTooltipIcon from '../components/InfoTooltipIcon';

// import NewsModal from '../components/NewsModal';


interface NewsItem {
  id: number;
  title: string;
  content: string;
  url: string;
  source: string;
  author: string;
  date_published: string;
  personality_name: string;
  personality: number;
  language: string;
  created_at: string;
  sentiment: string;
  viewed: boolean;
}

function createPersonalities(companyInfoAdm: CompanyInfoAdm | null): string[] {
  return companyInfoAdm?.ceos?.map(ceo => ceo.name) ?? [];
}

function createInitialData(personalities: string[]): Record<string, NewsItem[]> {
  const data: Record<string, NewsItem[]> = {};
  personalities.forEach(name => { data[name] = []; });
  return data;
}


const CEOPage: React.FC = () => {
  const theme = useTheme();
  const { companyInfoAdm } = useGlobal();
  const personalities = createPersonalities(companyInfoAdm);
  const [data, setData] = useState<Record<string, NewsItem[]>>(createInitialData(personalities));
  const [selectedPerson, setSelectedPerson] = useState(() => personalities[0] ?? '');

  const [loadingGenerateArticles, setLoadingGenerateArticles] = useState<boolean>(false);
  const [loadingArticlesList, setLoadingArticlesList] = useState<boolean>(false);
  const [selectedProvider] = useState<'perplexity' | 'openai'>('openai');
  const [viewedArticles, setViewedArticles] = useState<Set<number>>(new Set());

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [articleToDeleteIndex, setArticleToDeleteIndex] = useState<number | null>(null);

  const MAX_LENGTH = 220;
  const getPreviewText = (text: string) => {
    if (text.length > MAX_LENGTH) {
      return text.slice(0, MAX_LENGTH) + '...';
    }
    return text;
  };

  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

  useEffect(() => {
    const dynamicPersonalities = createPersonalities(companyInfoAdm);
    setData(createInitialData(dynamicPersonalities));
    if (!dynamicPersonalities.includes(selectedPerson)) {
      setSelectedPerson(dynamicPersonalities[0] ?? '');
    }
    // eslint-disable-next-line
  }, [companyInfoAdm]);

  // Load Articles on page initialization and when personalities change
  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [selectedPerson, JSON.stringify(personalities)]);


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
    setLoadingArticlesList(true);
    try {
      const url = selectedPerson
        ? `/articles/ceo/?name=${encodeURIComponent(selectedPerson)}`
        : '/articles/ceo/';

      const res = await api.get<NewsItem[]>(url);

      const dynamicPersonalities = createPersonalities(companyInfoAdm);
      const groupedData: Record<string, NewsItem[]> = createInitialData(dynamicPersonalities);

      res.data.forEach(article => {
        if (groupedData[article.personality_name]) {
          groupedData[article.personality_name].push(article);
        }
      });

      setData(groupedData);
      setLoadingArticlesList(false);
    } catch (error) {
      console.error("Error loading CEO articles:", error);
      setLoadingArticlesList(false);
    }
  };


  const handleNewsOpen = async (article: NewsItem) => {
    // setModalContent(article);
    // setModalOpen(true);
    setViewedArticles(prev => new Set([...prev, article.id]));

    // Open link in new tab
    window.open(article.url, '_blank', 'noopener,noreferrer');

    try {
      await api.put(`/articles/ceo/${article.id}/mark_viewed/`);
    } catch (error) {
      console.error("Erro ao marcar artigo como visualizado:", error);
    }
  };

  const confirmDelete = async () => {
    if (articleToDeleteIndex !== null) {
      try {
        await api.delete(`/articles/ceo/${articleToDeleteIndex}/`);
        toast.success('Article deleted successfully');
        setData(prevData => ({
          ...prevData,
          [selectedPerson]: prevData[selectedPerson].filter(a => a.id !== articleToDeleteIndex),
        }));
      } catch (error) {
        console.error('Error deleting article:', error);
        toast.error('Failed to delete article');
      }
      setArticleToDeleteIndex(null);
    }
    setIsModalDeleteOpen(false);
  };

  const cancelDelete = () => {
    setArticleToDeleteIndex(null);
    setIsModalDeleteOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };


  return (
    <Layout>
      <Box sx={{ padding: '3vh', overflow: 'auto', height: '100%', width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mr: 2 }}>
          {/*  Title + Tooltip */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="h2" sx={{ marginBottom: '0.2vw', marginLeft: '1vw' }}>
              CEO Perception
            </Typography>
            <InfoTooltipIcon message="Informação importante" size={18} color="gray" />
          </Box>
          {/* Test Component */}
          <Box sx={{ height: 'calc(4.5vh)', ml: 40, position: 'relative' }}>
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
            <Button variant='contained' onClick={handleFetchArticles} sx={{ display: 'none', height: 'calc(4vh)', position: 'absolute', right: 0, bottom: 10 }}>
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
                <Typography variant="subtitle2">
                  Sentiment medio
                </Typography>
                <Typography variant="h4" sx={{ color: colorSentiment, mt: 0.5 }}>
                  {averageSentiment !== null ? `${averageSentiment}%` : '-- %'} • {sentimentText}
                </Typography>
              </Box>
              <InfoTooltipIcon message="Informação importante" size={18} color="gray" bottom={18} />
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
                minHeight: '54vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant='h4'>Data</Typography>
                      </TableCell>
                      <TableCell >
                        <Typography variant='h4'>Anteprima</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='h4'>Sentiment</Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {displayedNews.map((news, idx) => {
                      const isNew = !news.viewed && !viewedArticles.has(news.id);
                      const sentimentColor =
                        news.sentiment !== null && news.sentiment !== undefined
                          ? parseInt(news.sentiment) > 60 ? 'green' : parseInt(news.sentiment) > 40 ? 'orange' : 'red'
                          : 'grey';

                      return (
                        <TableRow key={idx} hover>
                          {/* Date */}
                          <TableCell>
                            <Typography variant='body2' sx={{ fontSize: '17px'}}>
                              {news.date_published ? formatDate(news.date_published) : '--'}
                            </Typography>
                          </TableCell>

                          {/* Title + New */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '100%' }}>
                              <Link
                                fontSize='16px'
                                component="button"
                                onClick={() => handleNewsOpen(news)}
                                sx={{
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: theme.palette.secondary.main,
                                  textDecoration: 'underline',
                                  flexShrink: 1,
                                  maxWidth: isNew ? 'calc(100% - 60px)' : '100%',
                                }}
                              >
                                {news.title}
                              </Link>

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
                                    flexShrink: 0,
                                  }}
                                >
                                  New
                                </Box>
                              )}
                            </Box>
                          </TableCell>

                          {/* Sentiment */}
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Typography
                              variant='h6'
                              sx={{
                                color: sentimentColor,
                                fontWeight: 'bold',
                                display: 'inline-block', 
                              }}
                            >
                              {news.sentiment !== null && news.sentiment !== undefined ? `${news.sentiment}%` : '-- %'}
                            </Typography>
                          </TableCell>


                          {/* Delete */}
                          <TableCell>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setArticleToDeleteIndex(news.id);
                                setIsModalDeleteOpen(true);
                              }}
                              sx={{ '&:hover': { bgcolor: 'transparent' } }}
                            >
                              <DeleteOutlineIcon sx={{ color: '#e53935', cursor: 'pointer' }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
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
      {/* {modalContent && (
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
      )} */}

      <Dialog open={isModalDeleteOpen} onClose={cancelDelete}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            justifyContent: 'center',
            mt: 2,
            fontSize: '26px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningAmberIcon sx={{ color: '#000', mr: 1 }} />
            Conferma richiesta
            <WarningAmberIcon sx={{ color: '#000', ml: 1 }} />
          </Box>
          <IconButton onClick={cancelDelete} sx={{ position: 'absolute', top: 10, right: 10 }}>
            <CloseIcon sx={{ color: '#000' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: 'black', textAlign: 'center', fontSize: '20px', my: 0.5, mx: 1 }}
          >
            Vuoi davvero eliminare questo articolo?
            <br />
            Una volta eliminato, non sarà possibile recuperarlo.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2.5, mb: 2 }}>
          <Button
            variant="contained"
            onClick={confirmDelete}
            sx={{
              bgcolor: '#d32f2f',
              color: '#fff',
              py: 2.6,
              '&:hover': { bgcolor: '#c62828' },
            }}
          >
            Elimina post
          </Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default CEOPage;