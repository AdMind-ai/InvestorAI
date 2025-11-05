import { Modal, Box, Typography, Button, Stack } from "@mui/material";

type Props = { open: boolean; onClose: () => void; onNext: () => void };

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 520,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function WelcomeModal({ open, onClose, onNext }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" align="center" gutterBottom>
          Benvenuto in Market Intelligence
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3 }}>
          Inizia configurando il settore, i competitors, i clienti e i fornitori di cui vorresti tenere monitorate le notizie e rimanere sempre aggiornato
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" onClick={onNext}>Inizia</Button>
        </Stack>
      </Box>
    </Modal>
  );
}
