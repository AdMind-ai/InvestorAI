import { Box, Chip, Typography, Button, Stack } from "@mui/material";

type Props = {
    title: string;
    description: string;
    relevance?: 'high' | 'medium' | 'low';
    category: string;
    onRead?: () => void;
    onViewLinks?: () => void;
};

const relevanceMap: Record<string, { label: string; color: string; bg: string }> = {
    high: { label: 'Alta', color: '#fff', bg: '#EF4444' },
    medium: { label: 'Media', color: '#fff', bg: '#F59E0B' },
    low: { label: 'Bassa', color: '#111827', bg: '#E5E7EB' },
};

export default function SummaryCard({ title, description, relevance, category, onViewLinks }: Props) {
    const rel = relevance ? relevanceMap[relevance] : undefined;
    return (
        <Box sx={{
            height: '17vw',
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            backgroundColor: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                {title}
            </Typography>
            <Typography sx={{
                fontSize: '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
            }}>
                {description}
            </Typography>
            <Box sx={{
                display: "flex",
                alignItems: "center",
                mt: 'auto'
            }}>
                <Stack direction="row" spacing={2.5} alignItems="center">
                    <Chip
                        variant="outlined"
                        label={category?.toUpperCase()}
                        sx={{
                            minWidth: '9vw',
                            borderRadius: 2,
                            color: '#7E7E7E',
                            borderColor: '#7E7E7E',
                            '&:hover': { borderColor: '#7E7E7E', backgroundColor: 'transparent' },
                            '& .MuiChip-label': {
                                width: '100%',
                                textTransform: 'none',
                                fontSize: category?.length < 16 ? '13px' : '12px',
                                display: 'inline-block',
                                textAlign: 'center',
                                px: 1,
                            },
                        }}
                    />
                    {rel && (
                        <Chip label={rel.label} size="small" sx={{ color: rel.color, backgroundColor: rel.bg }} />
                    )}
                </Stack>
                <Button
                    size="small"
                    variant="text"
                    onClick={onViewLinks}
                    sx={{
                        ml: 'auto',
                        px: 0,
                        color: '#7E7E7E',
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px',
                        '&:hover': {
                            backgroundColor: 'transparent',
                            color: '#7E7E7E',
                            textDecoration: 'underline',
                        },
                    }}
                >
                    Vedi notizie
                </Button>
            </Box>
        </Box>
    );
}
