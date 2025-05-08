import { useState } from "react";
import { useMarket } from "../../context/MarketContext";
import { Box, Typography, Link } from "@mui/material";


const MarketCompetitorsNews = () => {
  const { competitorNewsCurrentPage, competitorNews } = useMarket();
  const [competitorsPerPage, setCompetitorsPerPage] = useState(10);

  const paginateCompetitors = () => {
    const start = (competitorNewsCurrentPage - 1) * competitorsPerPage;
    const end = start + competitorsPerPage;
    return competitorNews.slice(start, end);
  };

  const handleCompetitorsNewsExpand = () => {
    if (competitorsPerPage === 10) {
      setCompetitorsPerPage(30);
    } else {
      setCompetitorsPerPage(10);
    }
  };

  return (
    <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h4" fontWeight="bold" color="#ED6008">
        Notizie dei competitors
      </Typography>
      <Box sx={{ my: 2, mb: 4 }}>
        {paginateCompetitors().map((article, idx) => (
          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', py: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                width: '400px',  
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
      <Typography
        onClick={handleCompetitorsNewsExpand}
        sx={{
          position: 'absolute',
          bottom: 15,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          fontSize: '1rem',
          color: "#888",
          textDecoration: 'underline',
          ':hover': { color: 'primary.dark' }
        }}
      >
        {competitorsPerPage === 10 ? "Espandi" : "Retract"}
      </Typography>
    </Box>
  );
};

export default MarketCompetitorsNews;

