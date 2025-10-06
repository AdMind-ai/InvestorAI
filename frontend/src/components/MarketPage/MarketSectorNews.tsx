import { useState } from "react";
import { useMarket } from "../../context/MarketContext";
import { Box, Typography, Link, Pagination } from "@mui/material";


const MarketSectorNews = () => {
  const { sectorNews } = useMarket();
  const [sectorPage, setSectorPage] = useState(1);
  const sectorNewsPerPage = 10;
  
  const paginatedSectorNews = () => {
    const start = (sectorPage - 1) * sectorNewsPerPage;
    return sectorNews.slice(start, start + sectorNewsPerPage);
  };

  return (
    <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h4" fontWeight="bold" color='#5072CC'>
        Notizie rilevanti del settore
      </Typography>
      <Box sx={{ my: 2, mb: 3 }}>
        {paginatedSectorNews().map((article, idx) => (
          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', py: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                width: '90%',  
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {article.title}
            </Typography>
            <Link
              href={article.url}
              target="_blank"
              color="secondary"
              sx={{
                cursor: 'pointer',
                fontSize: 14,
                ':hover': { color: 'secondary.dark' }
              }}
            >
              Vai all’articolo
            </Link>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
        <Pagination
          count={Math.ceil(sectorNews.length / sectorNewsPerPage)}
          page={sectorPage}
          onChange={(_, newPage) => setSectorPage(newPage)}
          color="primary"
          siblingCount={1}
          boundaryCount={2} 
        />
      </Box>
    </Box>
  );
};

export default MarketSectorNews;

