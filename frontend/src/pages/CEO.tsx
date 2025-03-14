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
} from '@mui/material';
import Layout from '../layouts/Layout';
import { useTheme } from '@mui/material/styles';

import SadFace from '../assets/icons/sad-face.svg';
import HappyFace from '../assets/icons/happy-face.svg';
import NeutralFace from '../assets/icons/neutral-face.svg';

interface NewsItem {
  preview: string;
  link: string;
  sentiment: number;
}

const mockData: Record<string, NewsItem[]> = {
  'Mario Rossi': [
    { preview: 'La rivoluzione digitale di Mario Rossi sta cambiando...', link: '#', sentiment: 92 },
    { preview: 'Innovazione e sostenibilità: Mario Rossi svela il futuro...', link: '#', sentiment: 65 },
    { preview: 'Crisi aziendale criticata da Mario Rossi...', link: '#', sentiment: 90 },
  ],
  'Elvira Giacomelli': [
    { preview: 'Un trionfo assoluto: Elvira Giacomelli annuncia investimenti...', link: '#', sentiment: 28 },
    { preview: 'Elvira Giacomelli affronta polemiche...', link: '#', sentiment: 24 },
  ],
  'Luigi Farris': [
    { preview: 'Luigi Farris Rivoluziona il Settore Tecnologico...', link: '#', sentiment: 73 },
    { preview: 'Luigi Farris CEO dell’Anno...', link: '#', sentiment: 45 },
    { preview: 'Investimenti Record per Luigi Farris...', link: '#', sentiment: 23 },
    { preview: 'Green Revolution: Luigi Farris annuncia importante novità', link: '#', sentiment: 73 },
    { preview: 'Luigi Farris: “Pensavo Fosse Impossibile…”', link: '#', sentiment: 43 },
    { preview: 'Critiche Pioggia su Luigi Farris...', link: '#', sentiment: 23 },
    { preview: 'Luigi Farris annuncia il futuro...', link: '#', sentiment: 73 },
    { preview: 'Nuova Era Digitale con Luigi Farris...', link: '#', sentiment: 45 },
    { preview: 'Luigi Farris Svela il segreto del successo...', link: '#', sentiment: 23 },
    { preview: 'Luigi Farris Rivoluziona il Settore Tecnologico...', link: '#', sentiment: 73 },
    { preview: 'Luigi Farris CEO dell’Anno...', link: '#', sentiment: 45 },
    { preview: 'Investimenti Record per Luigi Farris...', link: '#', sentiment: 23 },
    { preview: 'Green Revolution: Luigi Farris annuncia importante novità', link: '#', sentiment: 73 },
    { preview: 'Luigi Farris: “Pensavo Fosse Impossibile…”', link: '#', sentiment: 43 },
    { preview: 'Critiche Farris...', link: '#', sentiment: 23 },
    { preview: 'Luigi Farris annuncia il futuro...', link: '#', sentiment: 73 },
    { preview: 'Nuova Era Digitale con Luigi Farris...', link: '#', sentiment: 45 },
    { preview: 'Luigi Farris Svela il segreto del successo...', link: '#', sentiment: 23 },
  ],
};

const CEOPage: React.FC = () => {
  const theme = useTheme();
  const [selectedPerson, setSelectedPerson] = useState<string>('Mario Rossi');
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(6);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentData = mockData[selectedPerson] || [];

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateRows = () => {
      const containerHeight = containerRef.current!.clientHeight;
      console.log(containerHeight);
      const firstNewsItem = containerRef.current!.querySelector('[data-news-item]');
      const itemHeight = firstNewsItem?.clientHeight || 55; 
      const paginationHeight = 40;
      const headerHeight = 50;
      const availableHeight = containerHeight - paginationHeight - headerHeight - 20;

      const calculatedRows = Math.max(1, Math.floor(availableHeight / itemHeight));
      setRowsPerPage(calculatedRows);
    };

    calculateRows(); 
    const observer = new ResizeObserver(calculateRows);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [selectedPerson]);

  useEffect(() => {
    const totalPages = Math.ceil(currentData.length / rowsPerPage);
    if (page > totalPages && totalPages !== 0) setPage(totalPages);
  }, [rowsPerPage, currentData.length, page]);

  const displayedNews = currentData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Sentiment
  const averageSentiment = Math.round(
    currentData.reduce((acc, cur) => acc + cur.sentiment, 0) / currentData.length || 0
  );
  const sentimentText =
    averageSentiment >= 60 ? 'Alto' : averageSentiment >= 40 ? 'Medio' : 'Basso';
  const colorSentiment =
    averageSentiment >= 60 ? 'success.main' : averageSentiment >= 40 ? 'warning.main' : 'error.main';

  return (
    <Layout>
      <Box sx={{ padding: '3vh', overflow: 'auto', height: '100%', width: '100%' }}>
        <Typography variant="h2" sx={{ marginBottom: '0.2vw' }}>CEO Perception</Typography>
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
                {['Mario Rossi', 'Elvira Giacomelli', 'Luigi Farris'].map(name => (
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
                <img src={averageSentiment >= 60 ? HappyFace : averageSentiment >= 40 ? NeutralFace : SadFace} alt="Sentiment" style={{ width: '40px', height: '40px' }} />
              </Avatar>
              <Box sx={{ padding: 1 }}>
                <Typography variant="subtitle2">Sentiment medio</Typography>
                <Typography variant="h4" sx={{ color: colorSentiment, mt:0.5 }}>
                  {averageSentiment}% • {sentimentText}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* News table */}
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
              <Typography variant='h4' sx={{ width: '60%', paddingX: '10px' }}>
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
            {displayedNews.map((news, idx) => (
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
                <Typography
                  variant='subtitle2'
                  sx={{
                    width: '60%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    padding: '0px 10px',
                  }}
                >
                  {news.preview}
                </Typography>
                <Link 
                  href={news.link}
                  sx={{
                    fontSize: '16px',
                    color: (theme) => theme.palette.secondary.main, 
                    textDecorationColor: (theme) => theme.palette.secondary.main, 
                    '&:hover': {
                      color: (theme) => theme.palette.secondary.dark,
                      textDecorationColor: (theme) => theme.palette.secondary.dark,
                    },
                  }}
                >
                  Vai all'articolo
                </Link>
                <Typography
                  variant='h6'
                  sx={{
                    color: news.sentiment > 60 ? 'green' : news.sentiment > 40 ? 'orange' : 'red',
                    fontWeight: 'bold', paddingRight:'30px'
                  }}
                >
                  {news.sentiment}%
                </Typography>
              </Box>
            ))}
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
        </Box>
      </Box>
    </Layout>
  );
};

export default CEOPage;