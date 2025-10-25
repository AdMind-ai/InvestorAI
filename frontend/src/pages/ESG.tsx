import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Pagination,
  PaginationItem,
  Link,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import dayjs from 'dayjs';
import Layout from '../layouts/Layout';
import { toast } from 'react-toastify';
import { api } from '../api/api';
// Icons
import WarningAmberIcon from '@mui/icons-material/WarningRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  author: string;
  date_published: string;
  topic: string;
  created_at: string;
  viewed: boolean;
}

const topics = [
  'Evoluzione del contesto normativo',
  'Reati informativi',
  'Responsabilità amministratori',
  'Rischi reputazionali'
];

const ESGPage: React.FC = () => {
  const theme = useTheme();
  const [loadingGenerateArticles, setLoadingGenerateArticles] = useState<boolean>(false);
  const [loadingArticlesList, setLoadingArticlesList] = useState<boolean>(false);
  const [selectedProvider] = useState<'perplexity' | 'openai'>('openai');
  const [selectedCategory, setSelectedCategory] = useState<string>(topics[0]);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [viewedArticles, setViewedArticles] = useState<Set<number>>(new Set());
  const [data, setData] = useState<Record<string, NewsItem[]>>({
    'Evoluzione del contesto normativo': [],
    'Reati informativi': [],
    'Responsabilità amministratori': [],
    'Rischi reputazionali': [],
  });
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(6);
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleToDeleteIndex, setArticleToDeleteIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentData = data[selectedCategory] || [];
  const sortedData = [...currentData].sort((a, b) =>
    dayjs(b.created_at).diff(dayjs(a.created_at))
  );
  const isLastPage = page === Math.ceil(currentData.length / rowsPerPage);
  const displayedNews = sortedData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Controls how many articles on page based on height
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const container = containerRef.current;
      if (container) {
        const totalHeight = container.clientHeight;
        // console.log(totalHeight)

        const itemHeight = 45;
        const minSpacingRem = 0.8;
        const remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const minSpacingPx = minSpacingRem * remToPx;

        const maxItems = Math.floor(totalHeight / (itemHeight + minSpacingPx));
        setRowsPerPage(maxItems >= currentData.length ? currentData.length : maxItems);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [currentData.length]);

  const handleArticleClick = async (article: NewsItem) => {
    setSelectedArticle(article);
    setViewedArticles((prev) => new Set([...prev, article.id]));

    try {
      await api.put(`/articles/esg/${article.id}/mark_viewed/`);
    } catch (error) {
      console.error('Erro ao marcar artigo como visualizado:', error);
    }
  };

  const handleRemoveNews = async (articleId: number) => {
    try {
      await api.delete(`/articles/esg/${articleId}/`);
      setData((prevData) => ({
        ...prevData,
        [selectedCategory]: prevData[selectedCategory].filter((article) => article.id !== articleId),
      }));

      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(null);
      }

      toast.info(`Articolo "${articleId}" eliminato con successo.`);
    } catch (error) {
      console.error('Erro ao deletar artigo:', error);
    }
  };

  const confirmDelete = () => {
    if (articleToDeleteIndex !== null) {
      handleRemoveNews(articleToDeleteIndex);
      setArticleToDeleteIndex(null);
    }
    setIsModalOpen(false);
  };

  const cancelDelete = () => {
    setArticleToDeleteIndex(null);
    setIsModalOpen(false);
  };

  // Geração de artigos
  const fetchESGArticles = async (topic: string) => {
    const endpoint =
      selectedProvider === 'openai' ? '/openai/esg-news/' : '/perplexity/esg-news/';
    const response = await api.post(endpoint, { topic });
    toast.success(`${response.data.num_created} new articles for: ${topic}`);
    await loadData(topic);
    return response.data;
  };

  const handleFetchArticles = async () => {
    setLoadingGenerateArticles(true);
    try {
      await Promise.all(topics.map(fetchESGArticles));
    } catch (error) {
      console.error('Error fetching ESG articles:', error);
    } finally {
      setLoadingGenerateArticles(false);
    }
  };

  // Carregar artigos do backend
  const loadData = async (category: string = selectedCategory) => {
    try {
      setLoadingArticlesList(true);
      const res = await api.get<NewsItem[]>(`/articles/esg/?topic=${category}`);

      setData((prev) => ({
        ...prev,
        [category]: res.data,
      }));

      setSelectedArticle(res.data[0] || null);
    } catch (error) {
      console.error('Erro carregando artigos ESG:', error);
    } finally {
      setLoadingArticlesList(false);
    }
  };

  // Refaz fetch quando muda categoria
  useEffect(() => {
    loadData(selectedCategory);
  }, [selectedCategory]);

  const messageOfDescription = "ESG Monitoring fornisce informazioni mirate e tempestive per guidare decisioni strategiche e dimostrare impegno concreto verso la sostenibilità e la trasparenza ESG."

  return (
    <Layout>
      <Box sx={{ padding: '3vh', overflow: 'auto', height: '100%', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography variant="h2" sx={{ marginBottom: '0.2vw', marginLeft: '1vw' }}>
            ESG News
          </Typography>
        </Box>

        <Typography variant='subtitle1' sx={{ px: 2, fontSize: '14px', width: '82vw' }}>
          {messageOfDescription}
        </Typography>

        {/* Toggle buttons */}
        <ToggleButtonGroup
          value={selectedCategory}
          exclusive
          onChange={(_, value) => {
            if (value) {
              setSelectedCategory(value);
              setPage(1);
            }
          }}
          sx={{ display: 'flex', gap: 2, borderRadius: '12px', width: '100%', mb: 2, mt: 2 }}
        >
          {topics.map((name) => (
            <ToggleButton
              key={name}
              value={name}
              sx={{
                borderRadius: '10px !important',
                padding: '8px 16px',
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

        <Box ref={containerRef} sx={{ display: 'flex', gap: '1rem', height: '57.1vh', width: '100%' }}>
          {/* Lista de notícias */}
          {loadingArticlesList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '50%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ flex: 1.2, overflowY: 'hidden', borderRadius: '12px' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent:
                    rowsPerPage < currentData.length && !isLastPage ? 'space-between' : 'flex-start',
                  height: '100%',
                }}
              >
                {displayedNews.map((news, idx) => {
                  const isLastItem = idx === displayedNews.length - 1;
                  const marginBottom =
                    rowsPerPage < currentData.length && !isLastPage
                      ? 0
                      : isLastItem
                        ? 0
                        : '0.9rem';
                  const isNew = !news.viewed && !viewedArticles.has(news.id);

                  return (
                    <Box
                      key={news.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '6.5px 8px 6.5px 14px',
                        mb: marginBottom,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        bgcolor: '#fff',
                        border:
                          selectedArticle?.id === news.id ? '1px solid #2097df' : `1px solid #E4E4E4`,
                        boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
                        '&:hover': {
                          bgcolor: selectedArticle?.id === news.id ? '#fff' : '#f1f1f1',
                        },
                      }}
                      onClick={() => handleArticleClick(news)}
                    >
                      <Typography
                        sx={{
                          fontSize: '15px',
                          mr: 1,
                          width: '85%',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {news.title}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                              textTransform: 'uppercase',
                            }}
                          >
                            New
                          </Box>
                        )}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setArticleToDeleteIndex(news.id);
                            setIsModalOpen(true);
                          }}
                          sx={{ '&:hover': { bgcolor: 'transparent' } }}
                        >
                          <DeleteOutlineIcon sx={{ color: '#e53935' }} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Detalhes da notícia */}
          <Box
            sx={{
              flex: 1,
              padding: '16px',
              border: '1px solid #E4E4E4',
              borderRadius: '12px',
              overflow: 'auto',
              bgcolor: '#FAFAFA',
              boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
            }}
          >
            {selectedArticle && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  padding: '14px 16px 10px 16px',
                  border: '1px solid #E4E4E4',
                  borderRadius: '12px',
                  bgcolor: 'white',
                  boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: '600' }}>
                  {selectedArticle.title}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '30px',
                      px: 1.8,
                      py: 0.9,
                      my: 1.2,
                    }}
                  >
                    <CalendarTodayOutlinedIcon sx={{ color: '#9a9a9a', fontSize: '12px', mr: 1 }} />
                    <Typography
                      variant="body2"
                      sx={{ color: '#9a9a9a', fontSize: '13px', whiteSpace: 'nowrap' }}
                    >
                      {dayjs(selectedArticle.date_published).format('DD MMMM YYYY')}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    lineHeight: '1.4',
                    fontSize: '15px',
                    whiteSpace: 'pre-line',
                    overflow: 'auto',
                    pr: 1,
                  }}
                >
                  {selectedArticle.summary}
                </Typography>

                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#9a9a9a',
                    fontSize: '15px',
                    fontStyle: 'italic',
                    mt: 1,
                    pb: 0.5,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Source:{' '}
                  <Link
                    href={selectedArticle.url}
                    target="_blank"
                    sx={{ color: '#2097df', textDecoration: 'none' }}
                  >
                    {selectedArticle.url}
                  </Link>
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Paginação */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2.5, px: 5 }}>
          <Pagination
            count={Math.ceil(currentData.length / rowsPerPage)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            shape="rounded"
            variant="outlined"
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
          />
          <Box sx={{ height: 'calc(4.5vh)', ml: 40, position: 'relative' }}>
            <Button
              hidden
              variant="contained"
              onClick={handleFetchArticles}
              sx={{ display: 'none', height: '30px', position: 'absolute', right: 30 }}
            >
              {loadingGenerateArticles ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Generate articles'
              )}
            </Button>
          </Box>
        </Box>

        {/* Modal de confirmação */}
        <Dialog open={isModalOpen} onClose={cancelDelete}>
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
      </Box>
    </Layout>
  );
};

export default ESGPage;