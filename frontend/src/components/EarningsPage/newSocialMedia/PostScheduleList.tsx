import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Pagination,
  Typography,
  // Link,
  PaginationItem,
  Link,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import PostEditModal from "./PostEditModal";
import { useLinkedinPost } from "../../../context/LinkedinPostContext";
import { toast } from "react-toastify";

// Icons
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageIcon from "@mui/icons-material/Image";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from '@mui/icons-material/Close';

interface ScheduledPost {
  id: number;
  image?: string;
  title: string;
  description: string;
  date: string;
  time: string;
}

interface BackendScheduledPost {
  id: number;
  image?: string | null;
  image_base64?: string | null;
  text: string;
  scheduled_at?: string | null;
}

const PostScheduleList = () => {
  const { resetFlow } = useLinkedinPost();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const postsPerPage = 3;
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingTime, setEditingTime] = useState<string>("");
  const [editingText, setEditingText] = useState<string>("");
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { api } = await import("../../../api/api");

        // 🔹 Tipamos explicitamente a resposta da API
        const res = await api.get<BackendScheduledPost[]>("/openai/linkedin-scheduled/");

        // 🔹 Fazemos o mapeamento para ScheduledPost
        const data: ScheduledPost[] = res.data.map((p) => ({
          id: p.id,
          image: p.image_base64 || p.image || "",
          title: "",
          description: p.text,
          date: p.scheduled_at
            ? new Date(p.scheduled_at).toLocaleDateString()
            : "",
          time: p.scheduled_at
            ? new Date(p.scheduled_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "",
        }));

        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);


  const currentPosts = posts.slice((page - 1) * postsPerPage, page * postsPerPage);

  const handleDelete = async (id: number) => {
    try {
      const { api } = await import("../../../api/api");
      await api.delete(`/openai/linkedin-scheduled/`, { data: { id } });
      toast.success("Post eliminato con successo")
      // Atualiza a lista localmente e ajusta a paginação se necessário.
      setPosts((prev) => {
        const newPosts = prev.filter((p) => p.id !== id);
        const totalPages = Math.ceil(newPosts.length / postsPerPage) || 1;
        // Se a página atual ficar vazia (ex.: estávamos na pagina 2 e removemos o último item dessa pagina),
        // navegar para a primeira página conforme comportamento desejado.
        if (page > totalPages || (page > 1 && (newPosts.slice((page - 1) * postsPerPage, page * postsPerPage).length === 0))) {
          setPage(1);
        }
        return newPosts;
      });
    } catch (err) {
      console.error("delete error", err);
    }
  };

  // Update scheduled post via API and update local state
  const updateScheduledPost = async (id: number, text: string, image_base64?: string | null) => {
    try {
      const { api } = await import("../../../api/api");
      const form = new FormData();
      form.append("id", String(id));
      form.append("text", text || "");
      if (image_base64) form.append("image_base64", image_base64);
      const res = await api.put(`/openai/linkedin-scheduled/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // update local posts state
      toast.success("Post aggiornato con successo")
      setPosts((prev) => prev.map((p) => p.id === id ? {
        ...p,
        description: res.data.text,
        image: res.data.image_base64 || res.data.image,
      } : p));
    } catch (err) {
      console.error("update error", err);
      throw err;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        mt: 1
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
          Post programmati
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

      <PostEditModal
        open={editingPostId !== null}
        id={editingPostId ?? 0}
        initialText={editingText}
        initialImage={editingImage ?? undefined}
        date={editingDate}
        time={editingTime}
        onClose={() => setEditingPostId(null)}
        onSave={async ({ id, text, image_base64 }) => updateScheduledPost(id, text, image_base64)}
      />

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
        {loading ? (
          <Typography sx={{ color: '#666' }}>Caricamento...</Typography>
        ) : currentPosts.length === 0 ? (
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
                  gap: 2,
                  height: "100%",
                }}
              >
                <IconButton color="error" size="small" onClick={() => { setDeletingId(post.id); setOpenDeleteModal(true); }}>
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <Link
                  color="textDisabled"
                  component="button"
                  underline="always"
                  sx={{
                    fontSize: "15px",
                    ":hover": { color: "#ccc" },
                  }}
                  onClick={() => {
                    setEditingPostId(post.id);
                    setEditingText(post.description);
                    setEditingImage(post.image || null);
                    setEditingDate(post.date);
                    setEditingTime(post.time);
                  }}
                >
                  Modifica
                </Link>
              </Box>
            </Card>
          ))
        )}
      </Box>

      {currentPosts.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1, width: "100%" }}>
          <Pagination
            count={Math.ceil(posts.length / postsPerPage) || 1}
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
      )}

      <Dialog
        open={openDeleteModal}
        onClose={() => { if (!isDeleting) setOpenDeleteModal(false); }}
        fullWidth
        maxWidth='xs'
      >
        <DialogTitle variant="h5" sx={{ textAlign: 'center', position: 'relative' }}>
          Conferma richiesta
          <IconButton
            aria-label="close"
            onClick={() => setOpenDeleteModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            disabled={isDeleting} // desabilita enquanto deleta
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Vuoi davvero eliminare questo post?
            <br />Una volta eliminato, non sarà possibile recuperarlo.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1, mt: 1 }}>
          <Button
            onClick={async () => {
              if (!deletingId) return;
              try {
                setIsDeleting(true);
                await handleDelete(deletingId);
                setOpenDeleteModal(false);
                setDeletingId(null);
              } catch (err) {
                console.error('delete error', err);
              } finally {
                setIsDeleting(false);
              }
            }}
            variant="contained"
            sx={{
              backgroundColor: 'red',
              color: 'white',
              '&:hover': {
                backgroundColor: 'red',
              },
            }}
          >
            {isDeleting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Elimina post'}
          </Button>

        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostScheduleList;
