import { Box, Typography } from "@mui/material";
import { useMarket } from "../../../context/MarketContext";
import CardEuroIcon from '../../../assets/dashboard_icons/card_euro_icon.svg'
import CardArrowsIcon from '../../../assets/dashboard_icons/card_arrows_icon.svg'
import CardCurveArrowIcon from '../../../assets/dashboard_icons/card_curvearrow_icon.svg'

const MarketCards = () => {
  const { varPercent, setVarPercent, historyData, historyInfo, companyInfo } = useMarket();
  const currencySymbol = historyInfo?.currency === 'EUR' ? '€' : '$';
  const prezzoAttuale = historyInfo?.previousClose;

  function getVarValue(isPercent = true) {
    if (!historyData || historyData.length < 2) return {value: '--', positive: false};
    const last = historyData[0].Close;
    const first = historyData[historyData.length - 1].Close;
    const diff = first - last;
    const positive = diff >= 0;
    if (isPercent) {
      const percent = (diff / last) * 100;
      return {
        value: `${diff >= 0 ? '▲' : '▼'} ${Math.abs(percent).toFixed(2)}%`,
        positive,
      };
    } else {
      const str = (diff >= 0 ? '+ ' : '- ') + Math.abs(diff).toFixed(4);
      return {
        value: str,
        positive,
      };
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection:'column', gap: 1, mt: 2, mb:2, width: '150px'}}>
      <Box sx={{  display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center', height:'70px' }}>
        <Box
          component="img"
          src={CardEuroIcon}
          alt="Euro Icon"
          sx={{
            width: "35px",
            height: "35px",
            marginRight: '6px',
          }}
        />
        <Box sx={{ display: 'flex', flexDirection:'column'}}>
          <Typography variant="subtitle2"><b>{prezzoAttuale} {currencySymbol}</b></Typography>
          <Typography variant="caption" sx={{lineHeight:1, mt:0.5}}>Prezzo attuale</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center', height:'70px' }}>
        <Box
          component="img"
          src={CardArrowsIcon}
          alt="Euro Icon"
          sx={{
            width: "35px",
            height: "35px",
            marginRight: '6px',
          }}
        />
        <Box sx={{ display: 'flex', flexDirection:'column'}}>
          <Typography 
            variant="subtitle2"
            onClick={() => setVarPercent(v => !v)}
            sx={{cursor:'pointer', color: getVarValue(varPercent)?.positive === false ? 'red' : '#10AF2A'}}
          >
            <b>{getVarValue(varPercent)?.value}</b>
          </Typography>
          <Typography variant="caption" sx={{lineHeight:1, mt:0.5}}>Variazione del periodo</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center', height:'70px' }}>
        <Box
          component="img"
          src={CardCurveArrowIcon}
          alt="Euro Icon"
          sx={{
            width: "35px",
            height: "35px",
            marginRight: '6px',
          }}
        />
        <Box sx={{ display: 'flex', flexDirection:'column'}}>
          <Typography variant="subtitle2"><b>{companyInfo?.debtToEquity != null ? `${companyInfo.debtToEquity.toFixed(1)}%` : '--'}</b></Typography>
          <Typography variant="caption" sx={{lineHeight:1, mt:0.5}}>Debt / Equity</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MarketCards;