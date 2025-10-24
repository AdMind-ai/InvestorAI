import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { useState } from "react";

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ open, onClose, onConfirm }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleConfirm = () => {
    if (!date || !time) return; // Evita confirmar se estiver faltando algo
    onConfirm(date, time);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Seleziona data e ora</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          required
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 1 }}
        />
        <TextField
          required
          label="Ora"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!date || !time}
        >
          Conferma
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleModal;
