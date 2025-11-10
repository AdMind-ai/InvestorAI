import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { toast } from 'react-toastify';
import { api } from '../../api/api';
import '../../styles/markdown.css';

type Props = {
  overviewReport?: string;
  onExport?: () => Promise<string | void> | void; // optional handler that returns a url or performs export
};

const MarketOverviewReport = ({ overviewReport = "", onExport }: Props) => {
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleExportReport = async () => {
    try {
      setIsLoadingExport(true);

      const reportText = (overviewReport || '').trim();
      if (!reportText) {
        toast.info('Nessun rapporto disponibile per generare il PDF.');
        return;
      }

      // If a custom handler is provided and returns a URL, open it; otherwise fall back to internal generation
      if (onExport) {
        const maybeUrl = await onExport();
        if (typeof maybeUrl === 'string' && maybeUrl) {
          window.open(maybeUrl, '_blank');
          return;
        }
      }

      // Default: call backend endpoint to generate PDF from current overview text
      const res = await api.post('/esg-news/monthly-reports/generate-pdf', { report: reportText });
      const pdfUrl = res.data?.url;
      if (!pdfUrl) {
        toast.error('URL del PDF non restituita.');
        return;
      }

      window.open(pdfUrl, '_blank');
      toast.success('PDF generato con successo.');
    } catch (err) {
      console.error('Errore nella generazione del PDF del Market Overview:', err);
      toast.error('Errore nella generazione del PDF.');
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

      <Box sx={{ mt: 1, position: 'relative' }}>
        {/* Content container with collapsible height */}
        <Box
          sx={{
            maxHeight: expanded ? 'none' : '500px',
            overflow: expanded ? 'auto' : 'hidden',
            pr: expanded ? 0 : 0, // avoid layout shift
          }}
        >
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {overviewReport || "- Nessun rapporto disponibile."}
            </ReactMarkdown>
          </div>
        </Box>

        {/* Gradient + expand button when collapsed */}
        {!expanded && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 72,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 60%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              pb: 0.5,
            }}
          >
            <Button
              size="small"
              variant="text"
              onClick={() => setExpanded(true)}
              sx={{ textTransform: 'none', color: '#6B7280' }}
            >
              Espandi
            </Button>
          </Box>
        )}

        {/* Collapse control when expanded */}
        {expanded && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button
              size="small"
              variant="text"
              onClick={() => setExpanded(false)}
              sx={{ textTransform: 'none', color: '#6B7280' }}
            >
              Riduci
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MarketOverviewReport;
