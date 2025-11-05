import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  links: string[];
};

export default function LinksModal({ open, onClose, title = "Fonti", links }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title}
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {links?.length ? (
          <List>
            {links.map((href, idx) => (
              <ListItem key={idx} disableGutters>
                <ListItemText
                  primaryTypographyProps={{ sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                  primary={<a href={href} target="_blank" rel="noreferrer">{href}</a>}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <div>Nessun link disponibile</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
