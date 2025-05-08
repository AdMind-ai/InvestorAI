import ReactMarkdown from 'react-markdown';
import { useMarket } from "../../context/MarketContext";
import { Box, Typography, Button } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const MarketOverviewReport = () => {
  const { overviewReport } = useMarket();

  return (
    <Box sx={{ flex: 1, position: 'relative', border: '1px solid #ddd', borderRadius: 3, px: 3, py: 2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" fontWeight="bold" color='#A700FF'>
          Overview Report
        </Typography>
        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          sx={{
            width: '110px',
            borderRadius: 3,
            py: 1,
            px: 1,
            borderColor: '#ccc',
            color: 'grey',
            textTransform: 'none',
            fontSize: '0.9rem',
            fontWeight: '400',
            '&:hover': {
              borderColor: '#bbb',
              backgroundColor: 'transparent'
            }
          }}
        >
          Esporta
        </Button>
      </Box>
      <Box sx={{ mt: 1, overflow: 'auto' }}>
      <div className="markdown-body">
        <ReactMarkdown>{overviewReport}</ReactMarkdown>
      </div>
      </Box>

    </Box>
  );
};

export default MarketOverviewReport;

