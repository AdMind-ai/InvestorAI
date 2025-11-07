import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

type Props = { open: boolean; onComplete: () => void; auto?: boolean };

export default function MarketIntelligenceLoading({ open, onComplete, auto = true }: Props) {
    useEffect(() => {
        if (!open || !auto) return;
        const t = setTimeout(() => onComplete(), 2400);
        return () => clearTimeout(t);
    }, [open, auto, onComplete]);

    if (!open) return null;

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center', maxWidth: 680, width: '90%', p: 4 }}>
                <CircularProgress size={64} color="warning" sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom fontWeight={600}>Stiamo elaborando tutte le informazioni per te...</Typography>
                <Typography variant="body2" color="text.secondary">Stiamo preparando la tua Market Intelligence: news e sintesi su competitor, clienti, fornitori e settore.  Potrebbe richiedere alcuni minuti. Puoi lasciare questa pagina senza problemi.</Typography>
            </Box>
        </Box>
    );
}
