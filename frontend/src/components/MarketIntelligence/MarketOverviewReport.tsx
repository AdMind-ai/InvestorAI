import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import '../../styles/markdown.css';

type Props = {
  overviewReport?: string;
  onExport?: () => Promise<string | void> | void; // optional handler that returns a url or performs export
};

const MarketOverviewReport = ({ overviewReport = "", onExport }: Props) => {
  const [isLoadingExport, setIsLoadingExport] = useState(false);

  const handleExportReport = async () => {
    if (!onExport) return;
    try {
      setIsLoadingExport(true);
      await onExport();
    } finally {
      setIsLoadingExport(false);
    }
  }

  return (
    <Box sx={{ flex: 1, position: 'relative', border: '1px solid #E6E7EB', borderRadius: 3, px: 3, py: 2, boxShadow: '0px 6px 14px rgba(11,95,255,0.06)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" fontWeight="bold" color='#6B7280'>
          Overview Report
        </Typography>
        <Button
          variant="outlined"
          disabled={!onExport || isLoadingExport}
          startIcon={isLoadingExport ? null : <OpenInNewIcon />}
          onClick={handleExportReport}
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
        >
          {isLoadingExport ? <CircularProgress size={18} /> : 'Esporta'}
        </Button>
      </Box>

      <Box sx={{ mt: 1, overflow: 'auto' }}>
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {overviewReport || "- Nessun rapporto disponibile."}
          </ReactMarkdown>
        </div>
      </Box>
    </Box>
  );
};

export default MarketOverviewReport;
