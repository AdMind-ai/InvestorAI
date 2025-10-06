import { useState } from "react";
import { useMarket } from "../../context/MarketContext";
import { Box, Typography, Link, Pagination } from "@mui/material";

const MarketCompetitorsNews = () => {
  const { competitorNews } = useMarket();

  // paginação
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(competitorNews.length / itemsPerPage);

  const paginatedNews = competitorNews.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box
      sx={{
        position: "relative",
        border: "1px solid #ddd",
        borderRadius: 3,
        padding: 3,
        boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
        minHeight: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="#ED6008">
        Notizie dei competitors
      </Typography>

      <Box sx={{ my: 2, flex: 1 }}>
        {paginatedNews.map((article, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #ddd",
              py: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                maxWidth: "400px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {article.title}
            </Typography>
            <Link
              href={article.url}
              target="_blank"
              color="secondary"
              sx={{
                cursor: "pointer",
                fontSize: 14,
                ":hover": { color: "secondary.dark" },
              }}
            >
              Vai all’articolo
            </Link>
          </Box>
        ))}
      </Box>

      {/* Paginação */}
      <Box
        sx={{
          mt: "auto",
          display: "flex",
          justifyContent: "center",
          pt: 2,
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          shape="rounded"
          variant="outlined"
          sx={{
            "& .MuiPaginationItem-root": {
              color: "text.primary",
              borderRadius: "12px",
              border: "1px solid #ddd",
              margin: "0 4px",
              height: "33px",
              minWidth: "30px",
              "&.Mui-selected": {
                backgroundColor: "#f1f1f1",
                borderColor: "#bbb",
              },
              "&:hover": {
                backgroundColor: "#f1f1f1",
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default MarketCompetitorsNews;
