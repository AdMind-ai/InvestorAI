import React, { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Link,
    Typography,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
    open: boolean;
    initialText: string;
    initialImage?: string | null;
    date: string;
    time: string;
    onClose: () => void;
    onSave: (payload: { id: number; text: string; image_base64?: string | null }) => Promise<void>;
    id: number;
}

const PostEditModal: React.FC<Props> = ({
    open,
    initialText,
    initialImage,
    date,
    time,
    onClose,
    onSave,
    id,
}) => {
    const [text, setText] = useState(initialText || "");
    const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);
    const [imageBase64, setImageBase64] = useState<string | null>(initialImage || null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setText(initialText || "");
        setImagePreview(initialImage || null);
        setImageBase64(initialImage || null);
    }, [initialText, initialImage, open]);

    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setImagePreview(url);

        const toBase64 = (f: File) =>
            new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(f);
            });
        try {
            const b64 = await toBase64(file);
            setImageBase64(b64);
        } catch (err) {
            console.error("error converting file", err);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ id, text, image_base64: imageBase64 });
            onClose();
        } catch (err) {
            console.error("save error", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: {
                    backgroundColor: "white",
                    overflow: "hidden", // sem scroll no dialog
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h4" sx={{ mt: 2, ml: 1 }}>
                    Modifica
                </Typography>

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
                    <Typography variant="caption" sx={{ color: "#555", fontSize: "11px" }}>
                        Post programmato il:{" "}
                        <strong>
                            {date} - {time}
                        </strong>
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent
                sx={{
                    overflow: "hidden", // sem scroll no dialog content
                    p: 2,               // adiciona espaço interno (evita corte do conteúdo)
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        height: "100%",
                    }}
                >
                    {/* TextArea com scroll interno e padding seguro */}
                    <TextField
                        multiline
                        minRows={10}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        sx={{
                            flex: 1,
                            maxHeight: "50vh",       
                            overflowY: "auto",
                            borderRadius: 1,
                            backgroundColor: "#fff",
                            p: 1,
                        }}
                    />

                    {/* Área da imagem */}
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
                                <Typography sx={{ fontSize: "17px", mb: 1, color: "#000" }}>
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
                                />
                            </>
                        ) : (
                            <>
                                <Box
                                    component="img"
                                    src={imagePreview}
                                    alt="preview"
                                    sx={{
                                        maxWidth: "100%",
                                        maxHeight: 240,
                                        borderRadius: 1,
                                    }}
                                />
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
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving} sx={{ color: "#f57c00" }}>
                    Annulla
                </Button>
                <Button onClick={handleSave} variant="contained" disabled={saving}>
                    Salva modifiche
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PostEditModal;
