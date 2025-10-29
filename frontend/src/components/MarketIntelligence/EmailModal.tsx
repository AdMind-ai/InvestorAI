import { useState } from "react";
import { Modal, Box, Typography, Button, Stack, TextField, FormControlLabel, Checkbox, FormControl, FormLabel, Chip, Link } from "@mui/material";
import { useMarketIntelligence } from "../../context/MarketIntelligenceContext";

type Props = { open: boolean; onClose: () => void; onNext: () => void; onBack?: () => void };

const style = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 720,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export default function EmailModal({ open, onClose, onNext, onBack }: Props) {
    const { email, setEmail, preferences, setPreferences } = useMarketIntelligence();
    const [localEmail, setLocalEmail] = useState<string>(email || "");
    const [error, setError] = useState<string | null>(null);
    const [localPrefs, setLocalPrefs] = useState(preferences);

    const validateEmail = (e: string) => {
        // simple email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    };

    const handleSubmit = () => {
        if (!localEmail) {
            setError("Inserisci un'email valida");
            return;
        }
        if (!validateEmail(localEmail)) {
            setError("Formato email non valido");
            return;
        }
        setPreferences(localPrefs);
        setEmail(localEmail);
        onNext();
    };

    const onToggleCategory = (cat: keyof typeof localPrefs) => {
        setLocalPrefs((p) => ({ ...p, [cat]: { ...p[cat], enabled: !p[cat].enabled } }));
    };

    const onSetRelevance = (cat: keyof typeof localPrefs, relevance: "high" | "medium" | "low") => {
        setLocalPrefs((p) => ({ ...p, [cat]: { ...p[cat], relevance } }));
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" align="center" gutterBottom fontWeight={600}>
                    Vuoi ricevere le nuove notizie via mail?
                </Typography>
                <FormControl component="fieldset" sx={{ my: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <FormLabel component="legend" sx={{ fontSize: '18px' }}>Seleziona le categorie di cui vuoi ricevere alert e la rilevanza</FormLabel>
                        <Link component="button" variant="subtitle2" onClick={() => setLocalPrefs((p) => {
                            const allOn = Object.values(p).every((x) => x.enabled);
                            const next = Object.keys(p).reduce((acc, k) => ({ ...acc, [k]: { ...p[k as keyof typeof p], enabled: !allOn } }), {} as any);
                            return next as typeof p;
                        })}>
                            Seleziona tutto
                        </Link>
                    </Box>

                    <Stack spacing={1} sx={{ mt: 3 }}>
                        {(['sector', 'competitors', 'clients', 'fornitori'] as const).map((cat) => (
                            <Box key={cat}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={!!localPrefs[cat].enabled}
                                            onChange={() => onToggleCategory(cat)} />}
                                        label={cat === 'sector' ? 'Notizie relative al tuo settore:' : `Notizie relative ai tuoi ${cat}:`}
                                        sx={{ mr: 1, '& .MuiFormControlLabel-label': { fontSize: '16px' } }}
                                    />

                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            label="Rilevanza alta"
                                            size="small"
                                            clickable
                                            onClick={() => onSetRelevance(cat, 'high')}
                                            sx={{
                                                border: 'solid 0.5px',
                                                borderColor: 'error.main',
                                                bgcolor: localPrefs[cat].relevance === 'high' ? 'error.main' : 'transparent',
                                                color: localPrefs[cat].relevance === 'high' ? '#fff' : 'text.primary',
                                                ':hover': {
                                                    bgcolor: localPrefs[cat].relevance === 'high' ? 'error.main' : 'rgba(255, 0, 0, 0.1)',
                                                    color: localPrefs[cat].relevance === 'high' ? '#fff' : 'text.primary',
                                                }
                                            }}
                                        />
                                        <Chip
                                            label="Rilevanza media"
                                            size="small"
                                            clickable
                                            onClick={() => onSetRelevance(cat, 'medium')}
                                            sx={{
                                                border: 'solid 0.5px',
                                                borderColor: 'warning.main',
                                                bgcolor: localPrefs[cat].relevance === 'medium' ? 'warning.main' : 'transparent',
                                                color: localPrefs[cat].relevance === 'medium' ? '#fff' : 'text.primary',
                                                ":hover": {
                                                    bgcolor: localPrefs[cat].relevance === 'medium' ? 'warning.main' : 'rgba(255, 165, 0, 0.1)',
                                                    color: localPrefs[cat].relevance === 'medium' ? '#fff' : 'text.primary',
                                                }
                                            }}
                                        />
                                        <Chip
                                            label="Rilevanza bassa"
                                            size="small"
                                            clickable
                                            onClick={() => onSetRelevance(cat, 'low')}
                                            sx={{
                                                border: 'solid 0.5px',
                                                borderColor: 'info.main',
                                                bgcolor: localPrefs[cat].relevance === 'low' ? 'info.main' : 'transparent',
                                                color: localPrefs[cat].relevance === 'low' ? '#fff' : 'text.primary',
                                                ":hover": {
                                                    bgcolor: localPrefs[cat].relevance === 'low' ? 'info.main' : 'rgba(0, 123, 255, 0.1)',
                                                    color: localPrefs[cat].relevance === 'low' ? '#fff' : 'text.primary',
                                                }
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </FormControl>

                <TextField
                    fullWidth
                    placeholder="Inserisci una e-mail valida"
                    value={localEmail}
                    onChange={(e) => { setLocalEmail(e.target.value); setError(null); }}
                    error={!!error}
                    helperText={error || ''}
                    sx={{ mb: 3 }}
                />

                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="outlined" onClick={() => (onBack ? onBack() : onClose())}>Annulla</Button>
                    <Button variant="contained" onClick={handleSubmit}>Inizia</Button>
                </Stack>
            </Box>
        </Modal>
    );
}
