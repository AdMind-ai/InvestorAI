import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    Link,
    TextField,
    Typography,
} from "@mui/material";
import React, { useRef, useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useLinkedinPost } from "../../../context/LinkedinPostContext";
import ScheduleModal from "./ScheduleModal";
import { toast } from "react-toastify";

const PostPreview: React.FC = () => {
    const { setFlowToPublish, setFlowToPlan, contentPost, setContentPost, selectedFile, setSelectedFile } = useLinkedinPost();
    const [showScheduleModal, setShowScheduleModal] = useState(false);


    const [postContent, setPostContent] = useState<string>(contentPost);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file); // cria o preview da imagem
            setImagePreview(previewUrl);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // const handlePost = () => {
    //     // Verifica se o usuario está logado para fazer o post (no momento mockado)
    //     const user = {
    //         auth: false
    //     }
    //     if (!user.auth) {
    //         // manda usuario para tela de login
    //         setIsLoginRequired(true)
    //         return
    //     }

    //     if (selectedFile || postContent) {
    //         // Faz o post
    //     }
    // }

    const handleScheduleConfirm = async (date: string, time: string) => {
        // validate
        if (!date || !time) {
            return;
        }

        try {
            // build ISO datetime (local) - backend should handle timezone as needed
            const scheduledAt = new Date(`${date}T${time}`);
            const scheduledIso = scheduledAt.toISOString();

            const form = new FormData();
            // prefer context contentPost when available
            form.append("text", contentPost || postContent || "");
            if (selectedFile) {
                // convert file to base64 string and send as image_base64
                const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                const b64 = await toBase64(selectedFile as File);
                form.append("image_base64", b64);
            }
            form.append("scheduled_at", scheduledIso);

            const { api } = await import("../../../api/api");
            await api.post("/openai/linkedin-scheduled/", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // after success, switch to plan flow (lista)
            toast.success("Post programmato con successo")
            setFlowToPlan();
        } catch (err) {
            console.error("scheduling error", err);
            toast.error("Errore nella pianificazione del post")
        }
    };

    // keep context content in sync when user edits
    const onPostContentChange = (v: string) => {
        setPostContent(v);
        setContentPost(v);
    };

    // when contentPost in context changes (e.g. after generatePost), update the local textarea
    useEffect(() => {
        if (contentPost && contentPost.trim() !== "") {
            setPostContent(contentPost);
        }
    }, [contentPost]);

    return (
        <>
            <Card
                elevation={2}
                sx={{
                    width: "82vw",
                    height: "28vw",
                    borderRadius: "calc(2vh)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <CardContent sx={{ p: 1, width: "100%" }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                        Anteprima LinkedIn
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        {/* Campo de texto à esquerda */}
                        <TextField
                            multiline
                            fullWidth
                            rows={11}
                            variant="outlined"
                            placeholder="Scrivi qui il tuo testo..."
                            value={postContent}
                            onChange={(e) => onPostContentChange(e.target.value)}
                            sx={{
                                width: '71%',
                                backgroundColor: "#f9f9f9",
                                borderRadius: 2,
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#ccc" },
                                    "&:hover fieldset": { borderColor: "#ccc" },
                                    "&.Mui-focused fieldset": { borderColor: "#ccc" },
                                },
                            }}
                        />

                        {/* Box da imagem / upload à direita */}
                        <Box
                            sx={{
                                backgroundColor: "#f5f5f5",
                                width: "30%",
                                borderRadius: 2,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {!imagePreview ? (
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: '100%',
                                        height: 200,
                                        borderRadius: 2,
                                        backgroundColor: '#f5f5f5',
                                        border: 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        textAlign: 'center',
                                        p: 2,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Typography sx={{ fontSize: 17, mb: 1, color: '#000' }}>
                                        Aggiungi un’immagine: caricala o trascinala qui
                                    </Typography>

                                    <Link
                                        component="button"
                                        underline="always"
                                        onClick={handleFileClick}
                                        sx={{
                                            color: '#000',
                                            fontSize: 17,
                                            textDecorationColor: '#000',
                                            ':hover': {
                                                color: '#00000090',
                                                textDecorationColor: '#00000090',
                                            },
                                        }}
                                    >
                                        Caricala o trascinala direttamente qui
                                    </Link>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                        multiple={false}
                                    />
                                </Box>
                            ) : (
                                <>
                                    <IconButton
                                        onClick={handleRemoveImage}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: '#fff',
                                            color: '#d32f2f',
                                            zIndex: 2,
                                            '&:hover': {
                                                backgroundColor: '#fdecea',
                                            },
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            height: 'auto', // se ajusta ao tamanho da imagem
                                            maxHeight: 400,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={imagePreview}
                                            alt="Anteprima immagine"
                                            sx={{
                                                maxWidth: '100%',
                                                maxHeight: 400,
                                                objectFit: 'contain',
                                                display: 'block',
                                            }}
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ mt: 2 }} />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, gap: 1 }}>
                        <Button
                            variant="contained"
                            onClick={setFlowToPublish}
                            sx={{ height: '3vw' }}
                        >
                            Pubblica ora
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setShowScheduleModal(true)}
                            sx={{ height: '3vw', fontSize: '15px' }}
                        >
                            Programma il post
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <ScheduleModal
                open={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onConfirm={handleScheduleConfirm}
            />
        </>
    );
};

export default PostPreview;
