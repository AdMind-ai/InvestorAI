import { FormEvent, useState, useRef } from "react";
import {
    Modal,
    Box,
    Typography,
    Button,
    Stack,
    TextField,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Chip,
    InputAdornment,
    CircularProgress,
    Popper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { useMarketIntelligence } from "../../context/MarketIntelligenceContext";
import { toast } from "react-toastify";

interface CompetitorPayload {
    name: string;
    stock_symbol: string;
    website: string;
    sectors: string[];
}

type Props = { open: boolean; onClose: () => void; onNext: () => void; onBack?: () => void };

export default function CompaniesModal({ open, onClose, onNext, onBack }: Props) {
    const { companies, addCompany, removeCompany, totalCompanies } = useMarketIntelligence();

    const [openAdd, setOpenAdd] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);
    const [competitorToDelete, setCompetitorToDelete] = useState<string | null>(null);

    const [category, setCategory] = useState<"competitors" | "clients" | "fornitori" | null>(
        null
    );
    const [companyName, setCompanyName] = useState("");
    const [stockSymbol, setStockSymbol] = useState("");
    const [website, setWebsite] = useState("");
    const [sectors, setSectors] = useState<string[]>([]);
    const [sectorInput, setSectorInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Hover states for Popper
    const [hoverId, setHoverId] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const hideTimeoutRef = useRef<number | null>(null);

    const numbersOfCompanies = totalCompanies();

    const handleOpenAdd = (category: "competitors" | "clients" | "fornitori") => {
        setCategory(category);
        setOpenAdd(true);
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
        setCategory(null);
        setCompanyName("");
        setStockSymbol("");
        setWebsite("");
        setSectors([]);
        setSectorInput("");
        setIsLoading(false);
    };

    const handleAddCompany = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!category) return;
        const name = companyName.trim();
        if (!name) return;
        setIsLoading(true);

        const companyObj: CompetitorPayload = {
            name,
            stock_symbol: stockSymbol,
            website,
            sectors,
        };

        const ok = addCompany(category, companyObj);
        setIsLoading(false);

        if (!ok) {
            toast.info("Limite de 20 empresas atingido ou erro ao adicionar.");
            return;
        }
        handleCloseAdd();
    };

    const handleOpenModalDeleteCompetitor = (competitor: string, cat: "competitors" | "clients" | "fornitori") => {
        setOpenModalDelete(true);
        setCompetitorToDelete(competitor);
        setCategory(cat);
    };


    // --- Hover control functions ---
    const handleItemEnter = (e: React.MouseEvent<HTMLElement>, id: string) => {
        if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setHoverId(id);
        setAnchorEl(e.currentTarget as HTMLElement);
    };

    const handleItemLeave = () => {
        hideTimeoutRef.current = window.setTimeout(() => {
            setHoverId(null);
            setAnchorEl(null);
            hideTimeoutRef.current = null;
        }, 100);
    };

    const handlePopperEnter = () => {
        if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    const handlePopperLeave = () => {
        setHoverId(null);
        setAnchorEl(null);
    };

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{
                        position: "absolute" as const,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "calc(86vw)",
                        height: "70vh",
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" align="center" gutterBottom>
                        Inserisci competitors, clienti e fornitori
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                        Inserisci fino a 20 aziende totali tra competitors, clienti e fornitori di cui vorresti
                        tenere monitorate le notizie e rimanere sempre aggiornato
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {(["competitors", "clients", "fornitori"] as const).map((cat) => (
                            <Box key={cat}>
                                <Typography variant="subtitle1" sx={{ mb: 1, textTransform: "capitalize" }}>
                                    {cat}
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, minHeight: 180, zindex: 1500 }}>
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3, 1fr)",
                                            gap: 2,
                                            height: "30vh",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {companies[cat].map((company, index) => {
                                            const id = `${cat}-${index}`;
                                            return (
                                                <Box
                                                    key={id}
                                                    sx={{
                                                        width: "90px",
                                                        height: "90px",
                                                        position: "relative",
                                                        cursor: "pointer",
                                                        border: "1px solid #ccc",
                                                        backgroundColor: "#fff",
                                                        borderRadius: 2,
                                                        ":hover": {
                                                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                                                        },
                                                    }}
                                                    onMouseEnter={(e) => handleItemEnter(e, id)}
                                                    onMouseLeave={handleItemLeave}
                                                    onClick={() => window.open(company.website, "_blank")}
                                                >
                                                    <Box
                                                        sx={{
                                                            position: "relative",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            textAlign: "center",
                                                            width: "100%",
                                                            height: "100%",
                                                            mb: 2,
                                                            "&:hover .remove-icon": {
                                                                opacity: 1,
                                                            },
                                                        }}
                                                    >
                                                        <IconButton
                                                            className="remove-icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenModalDeleteCompetitor(company.name, cat);
                                                            }}
                                                            sx={{
                                                                position: "absolute",
                                                                top: 0,
                                                                right: 0,
                                                                opacity: 0,
                                                                transition: "opacity 0.3s ease-in-out",
                                                                zIndex: 2500,
                                                            }}
                                                        >
                                                            <RemoveCircleIcon
                                                                fontSize="small"
                                                                color="error"
                                                                sx={{
                                                                    ":hover": {
                                                                        color: "#ff0000ff",
                                                                    },
                                                                }}
                                                            />
                                                        </IconButton>

                                                        <Box
                                                            component="img"
                                                            src={company.logo}
                                                            sx={{
                                                                width: "80%",
                                                                height: "70%",
                                                                objectFit: "contain"
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ fontSize: "13px", lineHeight: 1.2 }}
                                                        >
                                                            {company.name}
                                                        </Typography>
                                                    </Box>

                                                    {/* --- Popper (tooltip) --- */}
                                                    <Popper
                                                        open={hoverId === id && Boolean(anchorEl)}
                                                        anchorEl={anchorEl}
                                                        placement="right-start"
                                                        modifiers={[
                                                            { name: "offset", options: { offset: [8, 0] } },
                                                            { name: "preventOverflow", options: { boundary: "viewport" } },
                                                        ]}
                                                        sx={{
                                                            zIndex: 2000,
                                                            pointerEvents: "auto",
                                                        }}
                                                    >
                                                        <Box
                                                            onMouseEnter={handlePopperEnter}
                                                            onMouseLeave={handlePopperLeave}
                                                            sx={{
                                                                bgcolor: "white",
                                                                border: "1px solid #ccc",
                                                                borderRadius: 2,
                                                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                                                p: 1,
                                                                width: 220,
                                                                maxWidth: 260,
                                                            }}
                                                        >
                                                            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                                                                {company.description}
                                                            </Typography>
                                                        </Box>
                                                    </Popper>

                                                </Box>
                                            );
                                        })}

                                        {numbersOfCompanies < 20 && (
                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                <IconButton
                                                    onClick={() => handleOpenAdd(cat)}
                                                    sx={{
                                                        backgroundColor: "#ccc",
                                                        borderRadius: 2,
                                                        width: '60px',
                                                        height: '60px',
                                                        ":hover": {
                                                            backgroundColor: "#ccccccd2",
                                                        },
                                                    }}
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </Stack>
                                        )}
                                    </Box>
                                </Paper>
                            </Box>
                        ))}
                    </Box>

                    {/* --- Dialog para adicionar nova empresa --- */}
                    <Dialog open={openAdd} onClose={handleCloseAdd} maxWidth="lg">
                        <DialogTitle>{`Aggiungi ${category ? category.slice(0, -1) : ""}`}</DialogTitle>
                        <DialogContent sx={{ paddingBottom: 0 }}>
                            <Typography variant="subtitle2" color="textDisabled">
                                Compila le informazioni qui sotto per aggiungere un nuovo{" "}
                                {category ? category.slice(0, -1) : "azienda"}.
                            </Typography>

                            <form onSubmit={handleAddCompany}>
                                <Box sx={{ mt: 1.5, width: "calc(40vw)" }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
                                        <TextField
                                            required
                                            margin="dense"
                                            label="Company Name"
                                            fullWidth
                                            variant="outlined"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                        />
                                        <TextField
                                            margin="dense"
                                            label="Stock Symbol"
                                            fullWidth
                                            variant="outlined"
                                            value={stockSymbol}
                                            onChange={(e) => setStockSymbol(e.target.value)}
                                        />
                                    </Box>

                                    <TextField
                                        margin="dense"
                                        label="Website"
                                        type="url"
                                        fullWidth
                                        variant="outlined"
                                        sx={{ mt: 2 }}
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                    />

                                    <Autocomplete
                                        sx={{ mt: 2 }}
                                        multiple
                                        freeSolo
                                        disableClearable
                                        value={sectors}
                                        inputValue={sectorInput}
                                        onInputChange={(_, newInputValue) => setSectorInput(newInputValue)}
                                        onChange={(_, newValue) => setSectors(newValue)}
                                        options={[]}
                                        renderTags={(value: string[], getTagProps) =>
                                            value.map((option: string, index: number) => (
                                                <Chip
                                                    variant="outlined"
                                                    label={option}
                                                    {...getTagProps({ index })}
                                                    key={index}
                                                />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Sectors"
                                                variant="outlined"
                                                size="small"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => {
                                                                    if (sectorInput.trim()) {
                                                                        setSectors((s) => [...s, sectorInput.trim()]);
                                                                        setSectorInput("");
                                                                    }
                                                                }}
                                                                size="small"
                                                                color="primary"
                                                            >
                                                                <AddIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
                                    <DialogActions>
                                        <Button onClick={handleCloseAdd} variant="text" disabled={isLoading}>
                                            Anulla
                                        </Button>
                                        <Button type="submit" variant="contained" color="secondary">
                                            {isLoading ? <CircularProgress size={24} color="primary" /> : "Conferma"}
                                        </Button>
                                    </DialogActions>
                                </Box>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Totale inseriti:{" "}
                        <strong style={{ color: numbersOfCompanies === 20 ? "yellowgreen" : "" }}>
                            {totalCompanies()}/20
                        </strong>
                    </Typography>

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button variant="outlined" onClick={() => (onBack ? onBack() : onClose())}>
                            Annulla
                        </Button>
                        <Button variant="contained" onClick={onNext}>
                            Fatto
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            {/* Modal para deletar competidor */}
            <Dialog open={openModalDelete} onClose={() => setOpenModalDelete(false)} fullWidth={true} maxWidth='xs'>
                <DialogTitle variant="h4">Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2">
                        Sei sicuro di voler eliminare il concorrente?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mb: 1,
                    mt: 1
                }}>
                    <Button onClick={() => setOpenModalDelete(false)} variant="outlined" disabled={isLoading}>Cancellare</Button>
                    <Button
                        onClick={() => {
                            if (competitorToDelete && category) {
                                removeCompany(competitorToDelete, category);
                                setOpenModalDelete(false);
                            }
                        }}
                        variant="outlined"
                    >
                        {isLoading ? <CircularProgress size={24} color="primary" /> : 'Confermare'}
                    </Button>


                </DialogActions>
            </Dialog>
        </>
    );
}
