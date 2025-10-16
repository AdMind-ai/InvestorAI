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

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Seleziona data e orario</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Orario"
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
          onClick={() => {
            onConfirm(date, time);
            onClose();
          }}
        >
          Conferma
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleModal;
