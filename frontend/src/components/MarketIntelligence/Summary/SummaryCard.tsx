import { Box, Chip, Typography, Button, Stack } from "@mui/material";

type Props = {
  title: string;
  description: string;
  relevance?: 'high'|'medium'|'low';
  onRead?: () => void;
  onViewLinks?: () => void;
};

const relevanceMap: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'Alta', color: '#fff', bg: '#EF4444' },
  medium: { label: 'Media', color: '#fff', bg: '#F59E0B' },
  low: { label: 'Bassa', color: '#111827', bg: '#E5E7EB' },
};

export default function SummaryCard({ title, description, relevance, onRead, onViewLinks }: Props) {
  const rel = relevance ? relevanceMap[relevance] : undefined;
  return (
    <Box sx={{
      border: '1px solid #E5E7EB',
      borderRadius: 2,
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      backgroundColor: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
    }}>
      <Typography variant="overline" sx={{ color: '#6B7280', fontWeight: 600 }}>NOVITÀ</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#374151' }}>
        {description}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 'auto' }}>
        <Button size="small" variant="outlined" onClick={onRead}>LEGGI</Button>
        <Button size="small" variant="text" onClick={onViewLinks} sx={{ textTransform: 'none' }}>Vedi notizie</Button>
        {rel && (
          <Chip label={rel.label} size="small" sx={{ ml: 'auto', color: rel.color, backgroundColor: rel.bg }} />
        )}
      </Stack>
    </Box>
  );
}
