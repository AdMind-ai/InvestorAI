import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

interface Document {
  id: number;
  name: string;
  type: string; // pdf, txt, doc, docx, odt, rtf, xls, xlsx
  translatedUrl?: string; // URL do documento traduzido (opcional)
}

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: number) => void;
  isTranslated?: boolean; // Determina o modo de exibição
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, isTranslated = false }) => {
  const theme = useTheme()
  if (!documents || documents.length === 0) {
    return null; // Não renderiza nada se não houver documentos
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdfOutlinedIcon fontSize="small" />;
      case 'txt':
        return <InsertDriveFileOutlinedIcon fontSize="small" />;
      case 'doc':
      case 'docx':
      case 'odt':
      case 'rtf':
        return <ArticleOutlinedIcon fontSize="small" />;
      case 'xls':
      case 'xlsx':
        return <ArchiveOutlinedIcon fontSize="small" />;
      default:
        return <InsertDriveFileOutlinedIcon fontSize="small" />;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '40vw',
        maxHeight: '32vh',
        overflow: 'auto',
        padding: '0px 10px',
        backgroundColor: 'inherit',
      }}
    >
      <List>
        {documents.map((document) => (
          <ListItem
            key={document.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
              marginBottom: '8px',
              padding: '8px 12px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Ícone do Documento */}
              <ListItemIcon sx={{ color: '#666', minWidth: '32px' }}>{getIconForType(document.type)}</ListItemIcon>
              {/* Nome do Documento */}
              <ListItemText
                primary={document.name}
                primaryTypographyProps={{
                  sx: { fontSize: '14px', color: '#333', fontWeight: 500 },
                }}
              />
            </Box>
            {/* Alternar entre exclusão e link de documento traduzido */}
            {isTranslated ? (
              <Typography
                component="a"
                href={document.translatedUrl || '#'} // URL do documento traduzido
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: '12px',
                  color: theme.palette.primary.main,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  '&:hover': { color: theme.palette.primary.light },
                }}
              >
                Vai al documento tradotto
              </Typography>
            ) : (
              <CloseIcon
                fontSize="small"
                sx={{
                  color: '#666',
                  cursor: 'pointer',
                  '&:hover': { color: '#333' },
                }}
                onClick={() => onDelete(document.id)} 
              />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DocumentList;