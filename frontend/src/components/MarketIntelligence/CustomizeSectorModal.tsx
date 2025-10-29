import { useState } from "react";
import { Modal, Box, Typography, Button, Stack, TextField, Chip } from "@mui/material";
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

export default function CustomizeSectorModal({ open, onClose, onNext, onBack }: Props) {
  const { sectorDescription, setSectorDescription, keywords, setKeywords, links, setLinks } = useMarketIntelligence();
  const [keywordInput, setKeywordInput] = useState("");
  const [linkInputs, setLinkInputs] = useState<string[]>(links.length ? links : ["", "", ""]);

  const addKeyword = () => {
    const t = keywordInput.trim();
    if (!t) return;
    setKeywords([...keywords, t]);
    setKeywordInput("");
  };

  const updateLink = (idx: number, v: string) => {
    const arr = [...linkInputs];
    arr[idx] = v;
    setLinkInputs(arr);
    setLinks(arr.filter((x) => x.trim()));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" align="center" gutterBottom>
          Personalizza il tuo settore
        </Typography>

        <TextField
          label="Descrivi qui di cosa si occupa nel dettaglio la tua azienda..."
          multiline
          minRows={3}
          fullWidth
          value={sectorDescription}
          onChange={(e) => setSectorDescription(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Definisci delle parole chiave</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField size="small" placeholder="Inserisci qui" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} />
          <Button variant="outlined" onClick={addKeyword}>Aggiungi</Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {keywords.map((k, i) => (
            <Chip key={i} label={k} onDelete={() => setKeywords(keywords.filter((_, idx) => idx !== i))} />
          ))}
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Ci sono dei siti web specifici da cui vorresti pescare le notizie? Inseriscili qui</Typography>
        <Stack spacing={1} sx={{ mb: 3 }}>
          {linkInputs.map((l, i) => (
            <TextField key={i} placeholder="Incolla qui il link" value={l} onChange={(e) => updateLink(i, e.target.value)} />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => (onBack ? onBack() : onClose())}>Annulla</Button>
          <Button variant="contained" onClick={onNext}>Fatto</Button>
        </Stack>
      </Box>
    </Modal>
  );
}
