import { Box, TextField, MenuItem } from "@mui/material";
import { useMarket } from "../../../context/MarketContext";


const MarketChartSelectors = () => {
  const { period, setPeriod, interval, setInterval } = useMarket();

  const periodi = {
    '1d': '1 giorno',
    '5d': '5 giorni',
    '1mo': '1 mese',
    '3mo': '3 mesi',
    '6mo': '6 mesi',
    '1y': '1 anno',
    '2y': '2 anni',
    'ytd': 'Da inizio anno',
    'max': 'Massimo'
  };
  
  const intervalli = {
    '1m': '1 minuto',
    '2m': '2 minuti',
    '5m': '5 minuti',
    '15m': '15 minuti',
    '30m': '30 minuti',
    '1h': '1 ora',
    '1d': '1 giorno',
    '1wk': '1 settimana',
    '1mo': '1 mese'
  };

  return (
    <Box>
      <TextField
        select
        label="Periodo"
        value={period}
        onChange={e => setPeriod(e.target.value)}
        size='small'
        sx={{
          minWidth: 110,
          mr: 2,
          fontSize: '0.85rem',
          '& .MuiInputBase-root': { fontSize: '0.85rem' },
          '& .MuiInputLabel-root': { fontSize: '0.85rem' },
        }}
      >
        {Object.entries(periodi).map(([key, label]) => (
          <MenuItem value={key} key={key} sx={{ fontSize: '0.85rem', minHeight: '1.5em' }}>{label}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Intervallo"
        value={interval}
        onChange={e => setInterval(e.target.value)}
        size="small"
        sx={{
          minWidth: 110,
          fontSize: '0.85rem',
          '& .MuiInputBase-root': { fontSize: '0.85rem' },
          '& .MuiInputLabel-root': { fontSize: '0.85rem' },
        }}
      >
        {Object.entries(intervalli).map(([key, label]) => (
          <MenuItem value={key} key={key} sx={{ fontSize: '0.85rem', minHeight: '1.5em' }}>{label}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default MarketChartSelectors;