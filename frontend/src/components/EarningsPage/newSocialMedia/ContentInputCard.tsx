import { useLinkedinPost } from "../../../context/LinkedinPostContext";
import { Box, Card, CardContent, Typography, Link, TextField, IconButton, Button } from "@mui/material";
import { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const ContentInputCard = () => {
    const { setContentPost, selectedFile, setSelectedFile, nextStep } = useLinkedinPost();
    const [enableTextField, setEnableTextField] = useState(false);
    const [localPost, setLocalPost] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleSubmit = () => {
        setContentPost(localPost);
        nextStep(); // vai para PostPreview
    };

    return (
        <Card elevation={2} sx={{ width: "100%", height: "28vw", borderRadius: "calc(2vh)" }}>
            <CardContent sx={{ p: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                    Definisci il contenuto del post che vuoi generare
                </Typography>

                {/* Text input */}
                <Box
                    sx={{
                        width: '76vw',
                        minHeight: "17vw",
                        border: "2px solid #5071cc59",
                        borderRadius: 1.5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 2,
                        py: 2,
                    }}
                >
                    {!enableTextField ? (
                        <Link
                            component="button"
                            underline="none"
                            color="textDisabled"
                            sx={{ fontSize: "17px", ":hover": { color: "#000" } }}
                            onClick={() => setEnableTextField(true)}
                        >
                            Scrivi qui il tuo testo
                        </Link>
                    ) : (
                        <Box sx={{ position: "relative", width: "100%" }}>
                            <IconButton
                                onClick={() => {
                                    setLocalPost("");
                                    setEnableTextField(false);
                                }}
                                sx={{ position: "absolute", top: 14, right: 6 }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <TextField
                                multiline
                                fullWidth
                                rows={8}
                                value={localPost}
                                onChange={(e) => setLocalPost(e.target.value)}
                                placeholder="Scrivi qui il tuo testo..."
                                sx={{
                                    backgroundColor: "#f9f9f9",
                                    borderRadius: 2,
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "#ccc" },
                                        "&:hover fieldset": { borderColor: "#ccc" },
                                        "&.Mui-focused fieldset": { borderColor: "#ccc" },
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Upload */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                    />
                    {!selectedFile ? (
                        <Link
                            component="button"
                            underline="always"
                            color="textDisabled"
                            sx={{ fontSize: "17px", ":hover": { color: "#000" }, mt: 2 }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Carica un comunicato stampa o trascinalo qui
                        </Link>
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                            {selectedFile.type.startsWith("image/") ? <ImageIcon /> : <PictureAsPdfIcon />}
                            <Typography variant="subtitle2">{selectedFile.name}</Typography>
                            <IconButton onClick={() => setSelectedFile(null)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                    <Button variant="contained" color="secondary" onClick={handleSubmit}>
                        Salva e Procedi
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ContentInputCard;
