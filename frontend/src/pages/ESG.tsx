import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
 
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Link,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import Layout from '../layouts/Layout';
import { toast } from 'react-toastify';
import { api } from '../api/api';
// Icons
import WarningAmberIcon from '@mui/icons-material/WarningRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import ArrowIcon from '../assets/icons/arrow-down-arrow-up.svg'
import PaginationControls from '../components/common/PaginationControls';


interface NewsItem {
  id: number;
  title: string;
  description: string;
  url: string;
  date_published: string;
  topic: string;
  created_at: string;
}

const topics = [
  'Evoluzione del contesto normativo',
  'Reati informativi',
  'Responsabilità amministratori',
  'Rischi reputazionali'
];

const ESGPage: React.FC = () => {
  const theme = useTheme();
  // Garantir locale italiana para datas e meses
  dayjs.locale('it');
  const [loadingArticlesList, setLoadingArticlesList] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(topics[0]);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [data, setData] = useState<Record<string, NewsItem[]>>({
    'Evoluzione del contesto normativo': [],
    'Reati informativi': [],
    'Responsabilità amministratori': [],
    'Rischi reputazionali': [],
  });
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(6);
  // Filtro de mês/ano (YYYY-MM) ou 'all'
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [monthMenuAnchor, setMonthMenuAnchor] = useState<HTMLElement | null>(null);
  const monthMenuOpen = Boolean(monthMenuAnchor);
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleToDeleteIndex, setArticleToDeleteIndex] = useState<number | null>(null);

  // Export reports menu state
  const [exportAnchorEl, setExportAnchorEl] = useState<HTMLElement | null>(null);
  const exportMenuOpen = Boolean(exportAnchorEl);
  type ESGReportSummary = { id: number; report_name: string; report_period: string };
  const [reports, setReports] = useState<ESGReportSummary[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const headerRowRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const currentData = data[selectedCategory] || [];
  // Extrai lista de meses disponíveis daquele tópico
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    currentData.forEach(item => {
      if (item.date_published) {
        monthsSet.add(dayjs(item.date_published).format('YYYY-MM'));
      }
    });
    return Array.from(monthsSet).sort((a, b) => (a > b ? -1 : 1)); // mais recente primeiro
  }, [currentData]);

  const filteredByMonth = useMemo(() => {
    if (monthFilter === 'all') return currentData;
    return currentData.filter(item => dayjs(item.date_published).format('YYYY-MM') === monthFilter);
  }, [currentData, monthFilter]);

  const sortedData = useMemo(() => {
    return [...filteredByMonth].sort((a, b) => dayjs(b.date_published).diff(dayjs(a.date_published)));
  }, [filteredByMonth]);

  // Flags para estados de vazio
  const hasAnyForTopic = currentData.length > 0;
  const hasAnyAfterFilter = sortedData.length > 0;

  const isLastPage = page === Math.ceil(sortedData.length / rowsPerPage);
  const displayedNews = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Controls how many articles on page based on actual heights (avoid cut at end)
  useEffect(() => {
    const recompute = () => {
      const container = containerRef.current;
      const header = headerRowRef.current;
      const list = listRef.current;
      if (!container || !list) return;
      const headerH = header?.offsetHeight ?? 0;
      const totalH = container.clientHeight;
      const usable = Math.max(totalH - headerH - 8, 0);
      const sampleRow = list.querySelector('[data-esg-row]') as HTMLElement | null;
      const rowH = sampleRow ? (sampleRow.offsetHeight + parseFloat(getComputedStyle(sampleRow).marginBottom || '0')) : 60;
      const maxItems = Math.max(1, Math.floor(usable / rowH));
      setRowsPerPage(Math.min(maxItems, sortedData.length || 1));
    };

    const ro = new ResizeObserver(() => requestAnimationFrame(recompute));
    if (containerRef.current) ro.observe(containerRef.current);
    requestAnimationFrame(recompute);
    return () => ro.disconnect();
  }, [sortedData.length, monthFilter, selectedCategory]);

  // const handleExportReport = async () => {
  
  // }

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
    // Reset filtro de mês ao trocar categoria
    setMonthFilter('all');
    setPage(1);
  }, [selectedCategory]);

  // Load ESG monthly reports when opening export menu
  const openExportMenu = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(e.currentTarget);
    try {
      const res = await api.get<ESGReportSummary[]>(`/esg-news/monthly-reports/`);
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro carregando lista de reports ESG:', err);
      setReports([]);
    }
  };

  const closeExportMenu = () => setExportAnchorEl(null);

  // Generate and download PDF using report description
  const handleDownloadReport = async (report: ESGReportSummary) => {
    try {
      // 1. Fetch detailed report (includes report_description)
      const detailRes = await api.get(`/esg-news/monthly-reports/`, { params: { id: report.id } });
      const detail = detailRes.data;
      const description: string = detail?.report_description || '';
      if (!description) {
        toast.info('Report sem descrição para gerar PDF.');
        return;
      }

      // 2. Call PDF generation endpoint
      const pdfRes = await api.post(`/esg-news/monthly-reports/generate-pdf`, { report: description });
      const pdfUrl = pdfRes.data?.url;
      if (!pdfUrl) {
        toast.error('URL do PDF não retornada.');
        return;
      }

      // 3. Open new tab for download/view
      window.open(pdfUrl, '_blank');
      toast.success('PDF generado con successo.');
    } catch (err) {
      console.error('Erro ao gerar PDF do report ESG:', err);
      toast.error('Errore nella generazione del PDF.');
    } finally {
      closeExportMenu();
    }
  };

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
        <Box sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
          <ToggleButtonGroup
            value={selectedCategory}
            exclusive
            onChange={(_, value) => {
              if (value) {
                setSelectedCategory(value);
                setPage(1);
                setMonthFilter('all');
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
          <Button
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            sx={{
              borderRadius: 3,
              py: 0.5,
              px: 1.2,
              borderColor: '#E5E7EB',
              color: '#374151',
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 400,
              '&:hover': {
                backgroundColor: 'transparent',
                borderColor: '#D1D5DB'
              }
            }}
            onClick={openExportMenu}
          >
            {'Esporta report'}
          </Button>
          {/* Export reports menu */}
          <Menu
            anchorEl={exportAnchorEl}
            open={exportMenuOpen}
            onClose={closeExportMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 2,
              sx: { borderRadius: '12px', minWidth: 220, maxHeight: 320, mt: 1 }
            }}
          >
            {reports.length === 0 ? (
              <MenuItem disabled sx={{ fontSize: '14px' }}>Nessun report disponibile</MenuItem>
            ) : (
              reports.map((r) => {
                const labelRaw = dayjs((r.report_period || '').includes('-') ? r.report_period + '-01' : r.report_period).format('MMMM YYYY');
                const label = labelRaw ? labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1) : (r.report_name || 'Report');
                return (
                  <MenuItem key={r.id} onClick={() => handleDownloadReport(r)} sx={{ fontSize: '14px' }}>
                    {label}
                  </MenuItem>
                );
              })
            )}
          </Menu>
        </Box>

        <Box ref={containerRef} sx={{ display: 'flex', gap: '1rem', height: '55vh', width: '100%' }}>
          {loadingArticlesList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              <CircularProgress />
            </Box>
          ) : !hasAnyForTopic ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              border: '1px dashed #D0D0D0',
              borderRadius: '12px',
              bgcolor: '#FAFAFA'
            }}>
              <Typography sx={{ fontSize: '16px', color: '#666', textAlign: 'center', px: 2 }}>
                Non ci sono notizie su questo argomento.
              </Typography>
            </Box>
          ) : (
            <>
              <Box ref={containerRef} sx={{ flex: 1.2, overflowY: 'hidden', borderRadius: '12px' }}>
                {/* Header com filtros */}
                <Box ref={headerRowRef} sx={{ display: 'flex', alignItems: 'center', gap: 4.5, pl: 1, mt: 1 }}>
                  <Typography sx={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                    Data
                    <Tooltip title="Filtra per mese">
                      <IconButton
                        aria-label="Filtra per mese"
                        size="small"
                        onClick={(e) => setMonthMenuAnchor(e.currentTarget)}
                        disableRipple
                      >
                        <img src={ArrowIcon} alt="" />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={monthMenuAnchor}
                      open={monthMenuOpen}
                      onClose={() => setMonthMenuAnchor(null)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                      PaperProps={{
                        elevation: 1,
                        sx: {
                          borderRadius: '12px',
                          minWidth: 170,
                          maxHeight: 300,
                          mt: 1,
                        }
                      }}
                    >
                      <MenuItem
                        selected={monthFilter === 'all'}
                        onClick={() => { setMonthFilter('all'); setPage(1); setMonthMenuAnchor(null); }}
                        sx={{ borderRadius: '8px', mx: 0.5, fontSize: '14px' }}
                      >
                        Tutti i mesi
                      </MenuItem>
                      {availableMonths.map(m => {
                        const label = dayjs(m + '-01').format('MMMM YYYY');
                        const cap = label.charAt(0).toUpperCase() + label.slice(1);
                        return (
                          <MenuItem
                            key={m}
                            selected={monthFilter === m}
                            onClick={() => { setMonthFilter(m); setPage(1); setMonthMenuAnchor(null); }}
                            sx={{ borderRadius: '8px', mx: 0.5, fontSize: '14px' }}
                          >
                            {cap}
                          </MenuItem>
                        );
                      })}
                    </Menu>
                  </Typography>
                  <Typography sx={{ fontSize: '14px' }}>Notizia</Typography>
                </Box>
                {hasAnyAfterFilter ? (
                  <Box ref={listRef}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent:
                        rowsPerPage < sortedData.length && !isLastPage ? 'space-between' : 'flex-start',
                      height: '100%',
                      mt: 2
                    }}
                  >
                    {displayedNews.map((news, idx) => {
                      const isLastItem = idx === displayedNews.length - 1;
                      const marginBottom =
                        rowsPerPage < sortedData.length && !isLastPage
                          ? 0
                          : isLastItem
                            ? 0
                            : '0.9rem';
                      return (
                        <Box data-esg-row
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
                          onClick={() => setSelectedArticle(news)}
                          role="button"
                          aria-label={`Seleziona notizia ${news.title}`}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '90%', gap: 1 }}>
                            <Typography sx={{ fontSize: '13px', minWidth: '76px' }}>
                              {dayjs(news.date_published).format('DD/MM/YYYY')}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '17px',
                                mr: 1,
                                flex: 1,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {news.title}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                ) : (
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    border: '1px dashed #D0D0D0',
                    borderRadius: '12px',
                    mt: 2,
                    bgcolor: '#FAFAFA'
                  }}>
                    <Typography sx={{ fontSize: '15px', color: '#666', textAlign: 'center', px: 2 }}>
                      Nessuna notizia per il mese selezionato.
                    </Typography>
                    <Button size="small" onClick={() => setMonthFilter('all')} sx={{ mt: 1, textTransform: 'none' }}>
                      Rimuovi filtro mese
                    </Button>
                  </Box>
                )}
              </Box>
              {/* Detalhes da notícia */}
              {hasAnyAfterFilter && selectedArticle && (
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
                        fontSize: '17px',
                        whiteSpace: 'pre-line',
                        overflow: 'auto',
                        pr: 1,
                      }}
                    >
                      {selectedArticle.description}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#9a9a9a',
                        fontSize: '15px',
                        fontStyle: 'italic',
                        mt: 2,
                        pb: 2,
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
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Paginação (componente comum) */}
        <PaginationControls
          count={Math.max(1, Math.ceil(sortedData.length / rowsPerPage))}
          page={page}
          onChange={(newPage) => setPage(newPage)}
          containerSx={{ justifyContent: 'space-around', px: 5 }}
        />
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
    </Layout>
  );
};

export default ESGPage;