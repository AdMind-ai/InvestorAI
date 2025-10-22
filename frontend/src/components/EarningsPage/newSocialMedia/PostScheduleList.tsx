import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Pagination,
  Typography,
  Link,
  PaginationItem,
} from "@mui/material";
import { useState } from "react";
import { useLinkedinPost } from "../../../context/LinkedinPostContext";

// Ícones
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageIcon from "@mui/icons-material/Image";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface ScheduledPost {
  id: number;
  image?: string;
  title: string;
  description: string;
  date: string;
  time: string;
}

const mockPosts: ScheduledPost[] = [
  {
    id: 1,
    title: "",
    description:
      "La Sostenibilità Non È Più Un'opzione, Ma Una Responsabilità. Le Normative Esg (Environmental, Social, Governance)...",
    date: "23 Settembre 2024",
    time: "11:30",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1601933471668-0e7e1a2b6a49?auto=format&fit=crop&w=800&q=80",
    title:
      "La Sostenibilità Non È Più Un'opzione, Ma Una Responsabilità. Le Normative Esg (Environmental, Social, Governance)...",
    description:
      "Le Normative Esg Stanno Ridefinendo Il Modo In Cui Le Aziende Operano A Livello Globale...",
    date: "23 Settembre 2024",
    time: "11:30",
  },
  {
    id: 3,
    title:
      "La Sostenibilità Non È Più Un'opzione, Ma Una Responsabilità. Le Normative Esg (Environmental, Social, Governance)...",
    description:
      "Le Normative Esg Stanno Ridefinendo Il Modo In Cui Le Aziende Operano A Livello Globale...",
    date: "23 Settembre 2024",
    time: "11:30",
  },
  {
    id: 4,
    title:
      "La Sostenibilità Non È Più Un'opzione, Ma Una Responsabilità. Le Normative Esg (Environmental, Social, Governance)...",
    description:
      "Le Normative Esg Stanno Ridefinendo Il Modo In Cui Le Aziende Operano A Livello Globale...",
    date: "23 Settembre 2024",
    time: "11:30",
  },
];

const PostScheduleList = () => {
  const { resetFlow } = useLinkedinPost();
  const [page, setPage] = useState(1);
  const postsPerPage = 3;

  const currentPosts = mockPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          width: "100%",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          I tuoi post programmati
        </Typography>
        <Button
          onClick={() => resetFlow()}
          sx={{
            width: "9vw",
            height: "2.5vw",
            textTransform: "none",
            borderRadius: "10px",
            fontSize: "14px",
            backgroundColor: "#CED7EC",
            color: '#5072CC'
          }}
        >
          Nuovo post
        </Button>
      </Box>

      {/* Lista de posts */}
      <Box
        sx={{
          width: "100%",
          height: "24vw",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {currentPosts.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              color: "#999",
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 50, color: "#c2c2c2", mb: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: "#999",
                fontStyle: "italic",
              }}
            >
              Nessun post programmato
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#aaa",
                mt: 0.5,
              }}
            >
              Crea un nuovo post per iniziare a pianificare.
            </Typography>
          </Box>
        ) : (
          currentPosts.map((post) => (
            <Card
              key={post.id}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: '33%',
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e0e0e0",
                overflow: "hidden",
              }}
            >
              {/* Imagem à esquerda */}
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  backgroundColor: "#f3f3f3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {post.image ? (
                  <Box
                    component="img"
                    src={post.image}
                    alt={post.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 40, color: "#c2c2c2" }} />
                )}
              </Box>

              {/* Conteúdo central */}
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  px: 2,
                  py: 1,
                  overflow: "hidden",
                }}
              >
                {/* Descrição */}
                <Typography
                  sx={{
                    fontSize: "15px",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {post.description}
                </Typography>

                {/* Data e hora */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#f8f8f8",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "4px 8px",
                    mt: 2,
                    width: "fit-content",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#555", fontSize: "11px" }}
                  >
                    Post programmato il:{" "}
                    <strong>
                      {post.date} - {post.time}
                    </strong>
                  </Typography>
                </Box>
              </CardContent>

              {/* Ações à direita */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  p: 1.5,
                  height: "100%",
                }}
              >
                <IconButton color="error" size="small">
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <Link
                  color="textDisabled"
                  component="button"
                  underline="always"
                  sx={{
                    fontSize: "0.8rem",
                    ":hover": { color: "#ccc" },
                  }}
                >
                  Modifica post
                </Link>
              </Box>
            </Card>
          ))
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", py: 1, width: "100%", mt: 2 }}>
        <Pagination
          count={Math.ceil(mockPosts.length / postsPerPage)}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          shape="rounded"
          variant="outlined"
          renderItem={(item) => (
            <PaginationItem
              components={{ previous: Typography, next: Typography }}
              slots={{
                previous: () => (
                  <Typography sx={{ textTransform: "none", fontSize: "16px" }}>
                    ← Precedente
                  </Typography>
                ),
                next: () => (
                  <Typography sx={{ textTransform: "none", fontSize: "16px" }}>
                    Successivo →
                  </Typography>
                ),
              }}
              {...item}
            />
          )}
          sx={{
            "& .MuiPaginationItem-root": {
              color: "text.primary",
              borderRadius: "12px",
              border: "1px solid #ddd",
              margin: "0 4px",
              height: "40px",
              minWidth: "40px",
              "&.Mui-selected": {
                backgroundColor: "#f1f1f1",
                borderColor: "#bbb",
              },
              "&:hover": {
                backgroundColor: "#f1f1f1",
              },
              "&.MuiPaginationItem-previousNext": {
                padding: "0px 12px",
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default PostScheduleList;
