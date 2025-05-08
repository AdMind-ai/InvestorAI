import { useState } from "react";
import { useMarket } from "../../context/MarketContext";
import { Box, Typography, Grow } from "@mui/material";
import type { Competitor } from "../../interfaces/market";


const MarketCompetitors = () => {
  const { competitors } = useMarket();
  const [visibleCompetitorsCount, setVisibleCompetitorsCount] = useState(12);
  const [hoverIndex, setHoverIndex] = useState<null | number>(null);
  const handleCompetitorsExpand = () => {
    setVisibleCompetitorsCount(visibleCompetitorsCount === 12 ? competitors.length : 12);
  };
  

  return (
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
  );
};

export default MarketCompetitors;

