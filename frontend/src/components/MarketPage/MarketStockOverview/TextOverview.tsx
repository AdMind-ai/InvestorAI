import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Typography, Grow } from "@mui/material";
import { useMarket } from "../../../context/MarketContext";

const TextOverview = () => {
  const { companyInfo, stockData } = useMarket();

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

    return (
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
              <div className="markdown-body">
                <ReactMarkdown>{stockData?.short_term_forecast || ''}</ReactMarkdown>
              </div>
            </Box>
          </Grow>
        </Box>

      </Box>
    );
};

export default TextOverview;