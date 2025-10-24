import { useLinkedinPost } from "../../../context/LinkedinPostContext";
import { Box, Card, CardContent, Typography, Link, TextField, IconButton, Button, CircularProgress } from "@mui/material";
import { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";

const ContentInputCard = () => {
    const { selectedFile, setSelectedFile, nextStep, generatePost, loading } = useLinkedinPost();
    const [enableTextField, setEnableTextField] = useState(false);
    const [localPost, setLocalPost] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const isPdfFile = (file: File | undefined | null) => {
        if (!file) return false;
        const mimeOk = file.type === "application/pdf";
        const extOk = file.name?.toLowerCase().endsWith(".pdf");
        return mimeOk || extOk;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (isPdfFile(file)) {
                setSelectedFile(file);
            } else {
                // reset input so user can try again
                (e.target as HTMLInputElement).value = "";
                toast.info("Formato file non valido. Aggiungi un .pdf")
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            if (isPdfFile(file)) {
                setSelectedFile(file);
            } else {
                toast.info("Formato file non valido. Aggiungi un .pdf")
            }
        }
    };

    const handleSubmit = async () => {
        try {
            // call backend to generate post if needed; if user already wrote something
            // we still send it so the model can refine it. If no text but a file exists,
            // backend will use the file.
            await generatePost(localPost, selectedFile);
            nextStep(); // vai para PostPreview
        } catch (e) {
            // error is surfaced via context.error; nothing else to do here
            console.error("generatePost failed", e);
        }
    };

    return (
        <Card elevation={2} sx={{ width: "100%", height: "28vw", borderRadius: "calc(2vh)" }}>
            <CardContent sx={{ p: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                    Scrivi il contenuto del post
                </Typography>

                {/* Text input */}
                <Box
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                        width: '76vw',
                        minHeight: "17vw",
                        border: `2px solid ${isDragActive ? '#5071cc' : '#5071cc59'}`,
                        backgroundColor: isDragActive ? '#f0f6ff' : 'transparent',
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
                            Scrivi qui il testo del post
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
                        accept=".pdf"
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
                            Carica un documento di riferimento (o trascinalo qui)
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
                        {loading ? <CircularProgress sx={{ color: 'white', p: 1 }} /> : "Genera anteprima"}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ContentInputCard;
