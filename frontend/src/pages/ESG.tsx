import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Pagination,
  PaginationItem,
  Link,
  IconButton
} from '@mui/material';
import Layout from '../layouts/Layout';
import { useTheme } from '@mui/material/styles';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from 'dayjs';


interface NewsItem {
  title: string;
  preview: string;
  link: string;
  sentiment: number;
  date?: string;
}

const mockData: Record<string, NewsItem[]> = {
  'Evoluzione del contesto normativo': [
    { title: 'Evoluzione Del Contesto Normativo ESG: Globali', preview: 'Evoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese Globali', link: '#' , sentiment:80},
    { title: "Nuove Normative ESG: Un Futuro Sostenibile Che Diventa Obbligo", preview: 'Nel panorama globale dell\'evoluzione regolamentare...', link: '#' , sentiment:90},
    { title: "ESG E Regolamentazione: Come Le Aziende Si Adattano All'evoluzione Normativa", preview: '...', link: '#' , sentiment:60},
    { title: "Lo Strumento Della Normativa Per L'ESG: Una Spinta Al Cambiamento Sostenibile", preview: '...', link: '#' , sentiment:75},
    { title: 'Evoluzaione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese Globali', preview: '...', link: '#' , sentiment:80},
    { title: "Nuovae Normative ESG: Un Futuro Sostenibile Che Diventa Obbligo", preview: 'Nel panorama globale dell\'evoluzione regolamentare...', link: '#' , sentiment:90},
    { title: "ESG E Regolaamentazione: Come Le Aziende Si Adattano All'evoluzione Normativa", preview: '...', link: '#' , sentiment:60},
    { title: "Lo Strumento Dellaa Normativa Per L'ESG: Una Spinta Al Cambiamento Sostenibile", preview: '...', link: '#' , sentiment:75},
    { title: 'Evoluzione Del Contesto Noarmativo ESG: Opportunità E Sfide Per Le Imprese Globali', preview: '...', link: '#' , sentiment:80},
    { title: "Nuove Normative ESG: Un aFuturo Sostenibile Che Diventa Obbligo", preview: 'Nel panorama globale dell\'evoluzione regolamentare...', link: '#' , sentiment:90},
    { title: "ESG E Regolamentazioane: Come Le Aziende Si Adattano All'evoluzione Normativa", preview: '...', link: '#' , sentiment:60},
    { title: "Lo Strumento Delala Normativa Per L'ESG: Una Spinta Al Cambiamento Sostenibile", preview: '...', link: '#' , sentiment:75},
    { title: 'Evoluzione sel Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese Globali', preview: '...', link: '#' , sentiment:80},
    { title: "Nuove Normatives ESG: Un Futuro Sostenibile Che Diventa Obbligo", preview: 'Nel panorama globale dell\'evoluzione regolamentare...', link: '#' , sentiment:90},
    { title: "ESG E Regolamenstazione: Come Le Aziende Si Adattano All'evoluzione Normativa", preview: '...', link: '#' , sentiment:60},
    { title: "Lo Strumento Delsla Normativa Per L'ESG: Una Spinta Al Cambiamento Sostenibile", preview: '...', link: '#' , sentiment:75},
    { title: 'Evoluzioned Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese Globali', preview: '...', link: '#' , sentiment:80},
    { title: "Nuove Norfmative ESG: Un Futuro Sostenibile Che Diventa Obbligo", preview: 'Nel panorama globale dell\'evoluzione regolamentare...', link: '#' , sentiment:90},
    { title: "ESG E Regolamgentazione: Come Le Aziende Si Adattano All'evoluzione Normativa", preview: '...', link: '#' , sentiment:60},
    { title: "Lo Strumento Delhla Normativa Per L'ESG: Una Spinta Al Cambiamento Sostenibile", preview: '...', link: '#' , sentiment:75},
  ],
  'News reati informativi':[
    { title: 'Evoluzione Del Contesto Normativo ESG: Globali', preview: 'Evoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese GlobaliEvoluzione Del Contesto Normativo ESG: Opportunità E Sfide Per Le Imprese Globali', link: '#' , sentiment:80},
    { title: "Nuove Normative ESG: Un Futuro Sostenibile Che Diventa Obbligo", preview: 'Nel panorama globale dell\'evoluzione regolamentare...', link: '#' , sentiment:90},
  ],
  'Responsabilità amministratori':[],
  'Rischi reputazionali':[]
};

const categories = [
  'Evoluzione del contesto normativo',
  'News reati informativi',
  'Responsabilità amministratori',
  'Rischi reputazionali'
];

const ESGPage: React.FC = () => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(mockData[categories[0]][0]);
  const [data, setData] = useState(mockData);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(6);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentData = data[selectedCategory] || [];
  const isLastPage = page === Math.ceil(currentData.length / rowsPerPage);
  const displayedNews = currentData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  const previewDate = selectedArticle?.date ? dayjs(selectedArticle.date) : dayjs(); 
  const formattedDate = previewDate.format('DD MMMM YYYY - HH:mm');
  
  
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const container = containerRef.current;
      if (container) {
        const totalHeight = container.clientHeight;
        console.log(totalHeight)
        
        const itemHeight = 45; 
        const minSpacingRem = 0.8; 
        const remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const minSpacingPx = minSpacingRem * remToPx;
  
        let maxItems = Math.floor((totalHeight) / (itemHeight + minSpacingPx));
        console.log(maxItems)
  
        if (maxItems >= currentData.length) {
          setRowsPerPage(currentData.length);
        } else {
          setRowsPerPage(maxItems);
        }
      }
    });

    if (containerRef.current){
      observer.observe(containerRef.current);
    }
  
    return () => observer.disconnect();
  }, [currentData.length]);

  const handleArticleClick = (article: NewsItem) => {
    setSelectedArticle(article);
  };

  const handleRemoveNews = (removeIdx: number) => {
    setData(prevData => {
      const newDataCategory = prevData[selectedCategory].filter((_, idx) => idx !== removeIdx);
  
      return ({
        ...prevData,
        [selectedCategory]: newDataCategory,
      });
    });
  
    if (selectedArticle && removeIdx === displayedNews.findIndex(n => n.title === selectedArticle.title)) {
      setSelectedArticle(null);
    }
  };


  return (
    <Layout>
      <Box sx={{ padding: '3vh', overflow: 'auto', height: '100%', width: '100%' }}>
        <Typography variant="h2" sx={{ marginBottom: '0.2vw' }}>ESG News</Typography>
        <Divider sx={{ marginBottom: 2.5 }} />
        
        {/* Toggle buttons */}
        <ToggleButtonGroup
          value={selectedCategory}
          exclusive
          onChange={(_, value) => { if(value){ setSelectedCategory(value); setSelectedArticle(mockData[value][0] || null); setPage(1); } }}
          sx={{ display: 'flex', gap:2, borderRadius: '12px', overflow: 'visible', width: '100%', mb: 2 }}
        >
          {categories.map(name => (
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

        {/* Titles and News */}
        <Box ref={containerRef} sx={{ display: 'flex', gap: '1rem', height: '57.1vh', width:'100%' }}>

          {/* News List */}
          <Box sx={{ flex: '1.2', overflowY: 'hidden', 
            // border: `1px solid #E4E4E4`, 
            borderRadius: '12px' }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: (rowsPerPage < currentData.length && !isLastPage) ? 'space-between' : 'flex-start',
              height: '100%',
            }}>
              {displayedNews.map((news, idx) => {
                const isLastItem = idx === displayedNews.length - 1;
                const marginBottom = (rowsPerPage < currentData.length && !isLastPage) ? 0 : (isLastItem ? 0 : '0.9rem');
          
                return(
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '6.5px 14px',
                      mb: marginBottom,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      bgcolor: '#fff',
                      border: selectedArticle?.title === news.title ? '1px solid #2097df' : `1px solid #E4E4E4`,
                      boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
                      '&:hover': {
                        bgcolor: selectedArticle?.title === news.title ? '#fff' : '#f1f1f1'
                      },
                    }}
                    onClick={() => handleArticleClick(news)}
                  >
                    <Typography sx={{ fontSize: '15px', mr: 1 }}>
                      {news.title}
                    </Typography>

                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveNews((page-1) * rowsPerPage + idx);
                      }}
                    >
                      <DeleteOutlineIcon sx={{ color: '#e53935' }} />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          </Box>
          {/* News Details */}
          <Box sx={{
            flex: 1,
            padding: '16px',
            border: '1px solid #E4E4E4',
            borderRadius: '12px',
            overflow: 'auto',
            bgcolor: '#FAFAFA',
            boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
          }}>
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              padding: '14px 16px 10px 16px',
              border: '1px solid #E4E4E4',
              borderRadius: '12px',
              overflow: 'auto',
              bgcolor: 'white',
              boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
            }}>
              {selectedArticle ? (
                <>
                  {/* Title */}
                  <Typography variant='h4' sx={{ fontWeight: '600' }}>
                    {selectedArticle.title}
                  </Typography>

                  {/* Date Wrapper */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '30px',
                      px: 1.8,
                      py: 0.9,
                      my: 1.2
                    }}>
                      <CalendarTodayOutlinedIcon sx={{ color: '#9a9a9a', fontSize: '12px', mr: 1 }} />
                      <Typography variant='body2' sx={{ color: '#9a9a9a', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formattedDate}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant='body2' sx={{ height: '100%', lineHeight: '1.4', fontSize: '15px', whiteSpace: 'pre-line', overflow: 'auto', pr: 1 }}>
                    {selectedArticle.preview}
                  </Typography>

                  <Typography variant='subtitle2' sx={{ color: '#9a9a9a', fontSize: '15px', fontStyle: 'italic', mt: 1 }}>
                    Source: <Link href={selectedArticle.link} target="_blank" sx={{ color: '#2097df', textDecoration: 'none' }}>
                      {selectedArticle.link}
                    </Link>
                  </Typography>

                </>
              ) : (
                <Typography variant='h6'>Seleziona un articolo</Typography>
              )}
            </Box>
          </Box>

        </Box>

        {/* Pagination igual ao que tinha */}
        <Box sx={{display:'flex', justifyContent:'center', mt:2.5}}>
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
                  previous: () => (<Typography sx={{ textTransform: 'none', fontSize: '16px' }}>← Precedente</Typography>),
                  next: () => (<Typography sx={{ textTransform: 'none', fontSize: '16px' }}>Successivo →</Typography>),
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

      </Box>
    </Layout>
  );
};

export default ESGPage;