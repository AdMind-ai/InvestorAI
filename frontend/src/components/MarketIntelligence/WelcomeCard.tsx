import { Box, Button, Stack, Typography } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

type Props = { onStart: () => void };

export default function WelcomeCard({ onStart }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Stack spacing={1.5} sx={{ textAlign: 'center' }}>
        <Box>
          <SettingsOutlinedIcon sx={{ fontSize: 56, color: 'text.secondary' }} />
        </Box>
        <Typography variant="h6" fontWeight={600}>
          Benvenuto in Market Intelligence
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Inizia configurando il settore, i competitors, i clienti e i fornitori da monitorare.
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={onStart}
            sx={{ width: { xs: 'auto', sm: '14vw' }, mt: 1 }}
          >
            Inizia configurazione
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
