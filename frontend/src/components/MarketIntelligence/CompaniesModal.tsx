import { FormEvent, useState } from "react";
import { Modal, Box, Typography, Button, Stack, TextField, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Chip, InputAdornment, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMarketIntelligence } from "../../context/MarketIntelligenceContext";
import { toast } from "react-toastify";

type Props = { open: boolean; onClose: () => void; onNext: () => void; onBack?: () => void };

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 920,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export default function CompaniesModal({ open, onClose, onNext, onBack }: Props) {
    const { companies, addCompany, removeCompany, totalCompanies } = useMarketIntelligence();

    // legacy tryAdd removed: we open a dialog to add detailed company info instead

    // Dialog state for adding detailed company
    const [openAdd, setOpenAdd] = useState(false);
    const [addCategory, setAddCategory] = useState<"competitors" | "clients" | "fornitori" | null>(null);
    const [companyName, setCompanyName] = useState("");
    const [stockSymbol, setStockSymbol] = useState("");
    const [website, setWebsite] = useState("");
    const [sectors, setSectors] = useState<string[]>([]);
    const [sectorInput, setSectorInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const numbersOfCompanies = totalCompanies();


    const handleOpenAdd = (category: "competitors" | "clients" | "fornitori") => {
        setAddCategory(category);
        setOpenAdd(true);
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
        setAddCategory(null);
        setCompanyName("");
        setStockSymbol("");
        setWebsite("");
        setSectors([]);
        setSectorInput("");
        setIsLoading(false);
    };

    const handleAddCompany = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!addCategory) return;
        const name = companyName.trim();
        if (!name) return;
        setIsLoading(true);
        // add full company object (name, stock, website, sectors)
        const companyObj = { name, stock: stockSymbol || undefined, website: website || undefined, sectors: sectors && sectors.length ? sectors : undefined };
        const ok = addCompany(addCategory, companyObj as any);
        setIsLoading(false);
        if (!ok) {
            // reached limit or failed
            toast.info('Limite de 20 empresas atingido ou erro ao adicionar.');
            return;
        }
        handleCloseAdd();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" align="center" gutterBottom>
                    Inserisci competitors, clienti e fornitori
                </Typography>
                <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                    Inserisci fino a 20 aziende totali tra competitors, clienti e fornitori di cui vorresti tenere monitorate le notizie e rimanere sempre aggiornato
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
                    {(['competitors', 'clients', 'fornitori'] as const).map((cat) => (
                        <Box key={cat}>
                            <Typography variant="subtitle1" sx={{ mb: 1, textTransform: 'capitalize' }}>{cat}</Typography>
                            <Paper variant="outlined" sx={{ p: 2, minHeight: 180 }}>
                                <Stack spacing={1} sx={{
                                    maxHeight: '40vh',
                                    overflowY: 'auto'
                                }}>
                                    {companies[cat].map((c, i) => (
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" key={i}>
                                            <Stack>
                                                <Typography variant="body2">{c.name}</Typography>
                                                {c.stock && <Typography variant="caption" color="text.secondary">{c.stock}</Typography>}
                                            </Stack>
                                            <IconButton size="small" onClick={() => removeCompany(cat as any, i)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    ))}

                                    {numbersOfCompanies < 20 && (
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <IconButton onClick={() => handleOpenAdd(cat as any)} sx={{
                                                backgroundColor: '#ccc',
                                                ":hover": {
                                                    backgroundColor: '#ccccccd2'
                                                }
                                            }}>
                                                <AddIcon />
                                            </IconButton>
                                        </Stack>
                                    )}
                                </Stack>
                            </Paper>
                        </Box>
                    ))}
                </Box>

                {/* Dialog para adicionar empresa (competitor/client/supplier) */}
                <Dialog open={openAdd} onClose={handleCloseAdd} maxWidth="lg">
                    <DialogTitle>{`Aggiungi ${addCategory ? addCategory.slice(0, -1) : ''}`}</DialogTitle>
                    <DialogContent sx={{ paddingBottom: 0 }}>
                        <Typography variant="subtitle2" color="textDisabled">
                            Compila le informazioni qui sotto per aggiungere un nuovo {addCategory ? addCategory.slice(0, -1) : 'azienda'}.
                        </Typography>

                        <form onSubmit={handleAddCompany}>
                            <Box sx={{ mt: 1.5, width: 'calc(40vw)' }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
                                    <TextField
                                        required
                                        margin="dense"
                                        id="company_name"
                                        name="company_name"
                                        label="Company Name"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                    />
                                    <TextField
                                        margin="dense"
                                        id="stock"
                                        name="stock"
                                        label="Stock Symbol"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        value={stockSymbol}
                                        onChange={(e) => setStockSymbol(e.target.value)}
                                    />
                                </Box>

                                <TextField
                                    margin="dense"
                                    id="website"
                                    name="website"
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
                                            <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
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
                                                        <IconButton onClick={() => { if (sectorInput.trim()) { setSectors((s) => [...s, sectorInput.trim()]); setSectorInput(''); } }} size="small" color="primary">
                                                            <AddIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />

                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: "center", mt: 2, mb: 2 }}>
                                <DialogActions>
                                    <Button onClick={handleCloseAdd} variant="text" disabled={isLoading}>Anulla</Button>
                                    <Button type="submit" variant="contained" color="secondary">
                                        {isLoading ? <CircularProgress size={24} color="primary" /> : 'Conferma'}
                                    </Button>
                                </DialogActions>
                            </Box>
                        </form>
                    </DialogContent>
                </Dialog>

                <Typography variant="body2" sx={{ mb: 2 }}>Totale inseriti: <strong style={{ color: numbersOfCompanies == 20 ? 'yellowgreen' : '' }}>{totalCompanies()}/20</strong></Typography>

                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="outlined" onClick={() => (onBack ? onBack() : onClose())}>Annulla</Button>
                    <Button variant="contained" onClick={onNext}>Fatto</Button>
                </Stack>
            </Box>
        </Modal>
    );
}
