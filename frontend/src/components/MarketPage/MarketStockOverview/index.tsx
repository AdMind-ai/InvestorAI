import { Box, Typography, Divider } from "@mui/material";
import MarketCards from './Cards'
import MarketChart from './Chart'
import MarketChartSelectors from './ChartSelectors'
import TextOverview from './TextOverview';

const MarketStockOverview = () => {

    return (
        <Box sx={{ border: '1px solid #ddd', borderRadius: 3, px: 3, py:2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
            {/* Title and select */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="#A700FF">
                Overview del titolo
                </Typography>
                <MarketChartSelectors />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <MarketChart />
                <MarketCards />
            </Box>

            <Divider sx={{ mt: 2, mb:1.5 }}/>

            <TextOverview />
        
        </Box>
    );
};

export default MarketStockOverview;