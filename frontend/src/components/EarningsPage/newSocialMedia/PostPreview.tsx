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
import { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useLinkedinPost } from "../../../context/LinkedinPostContext";
import ScheduleModal from "./ScheduleModal";

interface PostPreviewProps {
    post: string;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
    const { setFlowToPublish, setFlowToPlan } = useLinkedinPost();
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Texto padrão se nenhum post for passado
    if (!post)
        post = `🚀 Ecco un esempio di post LinkedIn:
Oggi abbiamo fatto un passo importante verso l’innovazione! 💡
Il nostro team ha lavorato duramente per creare una soluzione che aiuta le aziende a connettersi meglio con i propri clienti.
👉 Scopri di più sul nostro sito: www.azienda.it
#Innovazione #TeamWork #Crescita`;

    const [postContent, setPostContent] = useState<string>(post);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(selectedFile)
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

    const handleScheduleConfirm = (date: string, time: string) => {
        // Aqui você pode salvar a data/hora no contexto se quiser
        console.log("Agendado para:", date, time);
        setFlowToPlan(); // redireciona para PostScheduleList
    };

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
                        Anteprima del tuo post LinkedIn
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
                            minRows={11}
                            variant="outlined"
                            placeholder="Scrivi qui il tuo testo..."
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            sx={{
                                width: "70%",
                                backgroundColor: "#f9f9f9",
                                borderRadius: 2,
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#5072CC" },
                                    "&:hover fieldset": { borderColor: "#5072CC" },
                                    "&.Mui-focused fieldset": { borderColor: "#5072CC" },
                                },
                            }}
                        />

                        {/* Box da imagem / upload à direita */}
                        <Box
                            sx={{
                                backgroundColor: "#F2F2F2",
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
                                <>
                                    <Typography
                                        sx={{
                                            fontSize: "17px",
                                            mb: 1,
                                            color: "#000",
                                        }}
                                    >
                                        Vuoi aggiungere un’immagine?
                                    </Typography>

                                    <Link
                                        component="button"
                                        underline="always"
                                        onClick={handleFileClick}
                                        sx={{
                                            color: "#000",
                                            fontSize: "17px",
                                            textDecorationColor: "#000",
                                            ":hover": {
                                                color: "#00000090",
                                                textDecorationColor: "#00000090",
                                            },
                                        }}
                                    >
                                        Caricala o trascinala direttamente qui
                                    </Link>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                        multiple={false}
                                    />
                                </>
                            ) : (
                                <>
                                    {/* Preview da imagem */}
                                    <Box
                                        component="img"
                                        src={imagePreview}
                                        alt="Anteprima immagine"
                                        sx={{
                                            width: "auto",
                                            height: "auto",
                                            objectFit: "cover",
                                            borderRadius: 2,
                                        }}
                                    />

                                    {/* Botão para remover a imagem */}
                                    <IconButton
                                        onClick={handleRemoveImage}
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            backgroundColor: "#fff",
                                            color: "#d32f2f",
                                            "&:hover": {
                                                backgroundColor: "#fdecea",
                                            },
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ mt: 2 }} />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
                        <Button
                            variant="contained"
                            onClick={setFlowToPublish}
                        >
                            Pubblica subito
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => setShowScheduleModal(true)}>
                            Pianifica post
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
