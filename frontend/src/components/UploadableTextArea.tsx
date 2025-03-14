import React, { useState } from 'react';
import { Box, TextField, Typography, Button } from '@mui/material';
import DocumentList from './DocumentList';

interface UploadableTextAreaProps {
  text: string;
  setText: (value: string) => void;
  onFileUpload: (file: File) => void;
}

interface Document {
  id: number;
  name: string;
  type: string;
}

const ACCEPTED_FILE_EXTENSIONS = [
  '.txt', '.pdf', '.doc', '.docx', '.odt', '.rtf', '.html', '.md', '.xls', '.xlsx'
];

const UploadableTextArea: React.FC<UploadableTextAreaProps> = ({ text, setText, onFileUpload }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const fileContent = e.target?.result as string;
      console.log('Conteúdo do arquivo:', fileContent);
  
      const newDocument: Document = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
      };
      setDocuments((prevDocs) => [...prevDocs, newDocument]);
      onFileUpload(file);
    };
    reader.readAsText(file);
  };
  
  const handleMultipleFilesUpload = (files: FileList) => {
    const filesArr = Array.from(files);
  
    filesArr.forEach((file) => {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        
      if (ACCEPTED_FILE_EXTENSIONS.includes(fileExtension)) {
        handleFileUpload(file);
      } else {
        alert(`Tipo di file non supportato (${fileExtension}): ${file.name}`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleMultipleFilesUpload(files);
    }
  };

  const handleDeleteDocument = (id: number) => {
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
  };

  const openFileSelector = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = ACCEPTED_FILE_EXTENSIONS.join(',');
    fileInput.multiple = true;
    fileInput.style.display = 'none';
  
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        handleMultipleFilesUpload(files);
      }
    };
  
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        marginTop: '12px',
        padding: '14px',
        textAlign: 'center',
        border: dragOver ? '2px dashed #0072E5' : '2px dashed #ccc',
        borderRadius: '2vh',
        backgroundColor: dragOver ? '#f0faff' : 'inherit',
        cursor: documents.length === 0 ? 'pointer' : 'default',
        transition: 'background-color 0.3s, border 0.3s',
        overflow: 'auto',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={handleDrop}
    >
      {dragOver ? (
        <Box sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: '#0072E5' }}>
            Rilascia qui i file per caricarli
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            Tipi di file supportati: {ACCEPTED_FILE_EXTENSIONS.join(', ')}
          </Typography>
        </Box>
      ) : (
        <>
          {documents.length === 0 && (
            <>
              <Box onClick={openFileSelector}>
                <Typography sx={{ fontSize: '16px', color: '#666' }}>
                  Scrivi qui il tuo testo oppure
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    marginTop: '8px',
                    marginBottom: '4px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Carica un file o trascinalo qui
                </Typography>
              </Box>
              <TextField
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Inserisci il testo qui."
                sx={{
                  fontSize: '10px',
                  marginTop: '12px',
                  backgroundColor: '#fff',
                  borderRadius: '2vh',
                  '& .MuiOutlinedInput-root': {
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '14px',
                    minHeight: '30vh',
                    maxHeight: '30vh',
                    overflow: 'auto',
                    borderRadius: '2vh',
                  },
                  '& .MuiOutlinedInput-input': {
                    overflowY: 'auto',
                  },
                }}
              />
            </>
          )}

          {documents.length > 0 && (
            <Box sx={{ height:'98%', marginTop: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}}>
              <DocumentList documents={documents} onDelete={handleDeleteDocument}/>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                sx={{ marginTop: '12px', fontSize: '14px' }}
                onClick={openFileSelector}
              >
                Aggiungi Documento
              </Button>
            </Box>
          )}
        </>

      )}

    </Box>

  );
};

export default UploadableTextArea;