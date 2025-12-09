import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Avatar, Typography } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'

interface Props {
  open: boolean
  onClose: () => void
  count?: number | null
  max?: number | null
  featureLabel?: string
  supportUrl?: string
}

const UsageLimitModal: React.FC<Props> = ({ open, onClose, count = null, max = null, featureLabel = 'questa funzione', supportUrl = '/support' }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, pt: 2, mb: 1 }}>
        <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}>
          <BlockIcon sx={{ color: '#fff' }} />
        </Avatar>
        <Box>
          <DialogTitle sx={{ p: 0, lineHeight: 1 }}>Limite raggiunto</DialogTitle>
          <Typography variant="body2" color="text.secondary">Non puoi usare {featureLabel} al momento</Typography>
        </Box>
      </Box>
      <DialogContent dividers>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {count !== null && max !== null
            ? `Hai usato ${count} di ${max} utilizzi disponibili.`
            : `Hai raggiunto il limite di utilizzo per ${featureLabel}.`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Puoi attendere il ripristino del tuo piano o contattare il supporto se pensi che ci sia un errore.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ pb: 2 }}>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UsageLimitModal
