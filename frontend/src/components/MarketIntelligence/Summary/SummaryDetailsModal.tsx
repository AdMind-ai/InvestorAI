import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton, Typography, Chip, Stack, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type SummaryDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    category: string;
    // Accept either an array (preferred) or a single string (JSON, CSV, newline, or plain URL)
    links?: string | string[];
};

// Normalize incoming links to a clean array of URLs.
function normalizeLinks(rawLinks?: string | string[]): string[] {
    const URL_REGEX = /(https?:\/\/[^\s'"\]\[]+)/g;

    // Prepare a list of raw string segments to scan
    let segments: string[] = [];
    if (!rawLinks) {
        segments = [];
    } else if (Array.isArray(rawLinks)) {
        segments = rawLinks.filter(Boolean);
    } else if (typeof rawLinks === 'string') {
        const s = rawLinks.trim();
        // Try to parse JSON arrays like ["url1","url2"]
        if (s.startsWith('[') && s.endsWith(']')) {
            try {
                const arr = JSON.parse(s);
                if (Array.isArray(arr)) segments = arr.map(String);
                else segments = [s];
            } catch {
                segments = [s];
            }
        } else {
            // Split by newlines or commas as a best-effort
            segments = s.split(/\r?\n|,\s*/g).filter(Boolean);
        }
    }

    const out: string[] = [];
    for (const raw of segments) {
        const matches = String(raw).match(URL_REGEX);
        if (matches && matches.length) {
            out.push(...matches);
        }
    }

    // Dedupe while preserving order
    return Array.from(new Set(out));
}

export default function SummaryDetailsModal({ open, onClose, title, description, category, links }: SummaryDetailsModalProps) {
    const normalized = normalizeLinks(links);
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '22px',
                fontWeight: '600'
            }}>
                {title}
                <IconButton onClick={onClose} size="small" aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {/* Category */}

                    {/* Description */}
                    {description && (
                        <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '20px' }}>
                            {description}
                        </Typography>
                    )}

                    {category && (
                        <Chip
                            variant="outlined"
                            label={category}
                            sx={{ alignSelf: 'flex-start', color: '#0B5FFF', borderColor: '#0B5FFF', borderRadius: 1.5, fontSize: '16px', backgroundColor: '#E6F0FF' }}
                            size="medium"
                        />
                    )}

                    {/* Links */}
                    <Divider />
                    <div>
                        <Typography variant="body2" sx={{ mb: 1.5, fontSize: '17px' }}>
                            Notizie utilizzate per generare questo riepilogo:
                        </Typography>
                        {normalized?.length ? (
                            <List dense disablePadding>
                                {normalized.map((href, idx) => (
                                    <ListItem key={idx} disableGutters sx={{ py: 0.4 }}>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="body2"
                                                    component="a"
                                                    href={href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    sx={{
                                                        display: 'block',
                                                        fontSize: '0.85rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        textDecoration: 'underline',
                                                        py: 0
                                                    }}
                                                >
                                                    {href}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2">Nessun link disponibile</Typography>
                        )}
                    </div>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
