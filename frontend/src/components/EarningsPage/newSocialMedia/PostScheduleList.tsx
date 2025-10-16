import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    Pagination,
    Typography,
    Link,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { useState } from "react";
import { useLinkedinPost } from "../../../context/LinkedinPostContext";

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
        title:
            "La Sostenibilità Non È Più Un'opzione, Ma Una Responsabilità. Le Normative Esg (Environmental, Social, Governance)...",
        description:
            "Le Normative Esg Stanno Ridefinendo Il Modo In Cui Le Aziende Operano A Livello Globale...",
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
];

const PostScheduleList = () => {
    const { resetFlow } = useLinkedinPost();
    const [page, setPage] = useState(1);
    const postsPerPage = 3;

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const currentPosts = mockPosts.slice(
        (page - 1) * postsPerPage,
        page * postsPerPage
    );

    return (
        <Box
            sx={{
                width: "100%v",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h6" fontWeight={600}>
                    I tuoi post programmati
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => resetFlow()}
                    sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                    }}
                >
                    Nuovo post
                </Button>
            </Box>

            {/* Lista de posts */}
            <Box sx={{ width: "100%", height: '30vw', display: "flex", flexDirection: "column", gap: 2 }}>
                {currentPosts.map((post) => (
                    <Card
                        key={post.id}
                        sx={{
                            display: "flex",
                            width: "100%",
                            borderRadius: 2,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                    >
                        {/* Imagem à esquerda */}
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                backgroundColor: "#f3f3f3",
                                borderTopLeftRadius: 8,
                                borderBottomLeftRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
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
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                p: 2,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 500,
                                    color: "#333",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                }}
                            >
                                {post.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#555",
                                    mt: 0.5,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                }}
                            >
                                {post.description}
                            </Typography>

                            <Typography variant="caption" sx={{ color: "#777", mt: 1 }}>
                                Post programmato il:{" "}
                                <strong>
                                    {post.date} - {post.time}
                                </strong>
                            </Typography>
                        </CardContent>

                        {/* Ações à direita */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                p: 1.5,
                            }}
                        >
                            <Link
                                component="button"
                                underline="none"
                                sx={{
                                    color: "#1976d2",
                                    fontSize: "0.9rem",
                                    textDecoration: "none",
                                    ":hover": { textDecoration: "underline" },
                                }}
                            >
                                Modifica post
                            </Link>

                            <IconButton color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Card>
                ))}
            </Box>

            {/* Paginação */}
            <Divider sx={{ my: 3, width: "100%" }} />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    gap: 2,
                }}
            >
                <Pagination
                    count={3}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                />
            </Box>
        </Box>
    );
};

export default PostScheduleList;
