import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton, Typography, Chip, Stack, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type SummaryDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    category: string;
    links: string[];
};

// Normalize incoming links to ensure only clean URLs are displayed,
// even if a single string contains a list representation with quotes/brackets/newlines.
function normalizeLinks(rawLinks: string[] = []): string[] {
    const URL_REGEX = /(https?:\/\/[^\s'"\][]+)/g;

    const out: string[] = [];
    for (const raw of rawLinks) {
        if (!raw) continue;
        const matches = raw.match(URL_REGEX);
        if (matches && matches.length) {
            out.push(...matches);
            continue;
        }
        // Fallback: strip wrapping quotes/brackets/spaces/commas
        const cleaned = raw
            .trim()
            .replace(/^\s*["[]+/, "")
            .replace(/[\]"']+\s*$/, "")
            .replace(/,$/, "");
        if (cleaned) out.push(cleaned);
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
