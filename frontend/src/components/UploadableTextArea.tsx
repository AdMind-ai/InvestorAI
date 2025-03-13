import React, { useState } from 'react';
import { Box, TextField, Typography, Button } from '@mui/material';
import DocumentList from './DocumentList';
// import { useDropzone } from 'react-dropzone';

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

const UploadableTextArea: React.FC<UploadableTextAreaProps> = ({ text, setText, onFileUpload }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const fileContent = e.target?.result as string;
      console.log('Conteúdo do arquivo:', fileContent);

      const newDocument: Document = {
        id: Date.now(),
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
      };
      setDocuments((prevDocs) => [...prevDocs, newDocument]);
      onFileUpload(file);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDeleteDocument = (id: number) => {
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
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
      {/* Mostrar área de upload quando não há documentos */}
      {documents.length === 0 && (
        <>
          <Box
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = '.txt, .pdf, .doc, .docx, .odt, .rtf, .html, .md, .xls, .xlsx';
              fileInput.style.display = 'none';
      
              // Definir evento "onchange" para processar o arquivo selecionado
              fileInput.onchange = (event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              };
      
              document.body.appendChild(fileInput); // Adicionar dinamicamente ao DOM
              fileInput.click(); // Simular clique para abrir o seletor de arquivos
              document.body.removeChild(fileInput); // Remover do DOM após abrir
            }}
          >
            <Typography sx={{ fontSize: '16px', color: dragOver ? '#0072E5' : '#666' }}>
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

      {/* Mostrar lista de documentos quando existir ao menos um */}
      {documents.length > 0 && (
        <Box sx={{ height:'98%', marginTop: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}}>
          <DocumentList documents={documents} onDelete={handleDeleteDocument}/>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            sx={{ marginTop: '12px', fontSize: '14px' }}
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = '.txt, .pdf, .doc, .docx, .odt, .rtf, .html, .md, .xls, .xlsx';
              fileInput.style.display = 'none';

              fileInput.onchange = (event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              };

              document.body.appendChild(fileInput);
              fileInput.click();
              document.body.removeChild(fileInput);
            }}
          >
            Aggiungi Documento
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UploadableTextArea;