import { useState } from "react";
import { useMarket } from "../../context/MarketContext";
import { Box, Typography } from "@mui/material";
import ReactMarkdown from 'react-markdown';

const MarketInsightReport = () => {
  const { insightReport, selectedQuarter, setSelectedQuarter, insightOptions } = useMarket();
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, px: 3, pt: 2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)', maxHeight: expanded ? 'none' : '395px', overflow: 'hidden'}}>
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
          {insightOptions.length === 0 ? (
            <option disabled value="">Trimestri non disponibili</option>
          ) : (
            insightOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 8, overflow: 'auto' }}>
        <div className="markdown-body">
          <ReactMarkdown>{insightReport.replace(/\[\d+\]/g, '')}</ReactMarkdown>
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
  );
};

export default MarketInsightReport;

