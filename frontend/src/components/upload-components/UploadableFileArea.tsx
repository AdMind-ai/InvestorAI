import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import DocumentList from './DocumentListUploaded';
import { toast } from 'react-toastify'

interface UploadableFileAreaProps {
  onFileUpload: (file: File | File[]) => void;
  onDeleteFile: (filename: string) => void;
  files: File[];
  documentPlaceHolder?: string;
  width?: number | string;
  height?: number | string;
}


const ACCEPTED_FILE_EXTENSIONS = [
  '.docx', '.doc', '.pptx', '.xlsx', '.pdf', '.txt', '.html', '.htm', '.xlf', '.xliff', '.srt'
];

const UploadableFileArea: React.FC<UploadableFileAreaProps> = ({ onFileUpload, onDeleteFile, files, documentPlaceHolder='Carica un file o trascinalo qui', width, height }) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const getDocuments = () => files.map((file, i) => ({
    id: i,
    name: file.name,
    type: file.name.split('.').pop() || 'unknown',
  }));
  const documents = getDocuments();

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const fileContent = e.target?.result as string;
      console.log('Conteúdo do arquivo:', fileContent);

      onFileUpload(file);
    };
    reader.readAsText(file);
  };
  
  const handleMultipleFilesUpload = (files: FileList) => {
    const filesArr = Array.from(files);
    // const file = filesArr[0];

    // if (!file) return;
    // const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    // if (ACCEPTED_FILE_EXTENSIONS.includes(fileExtension)) {
    //   handleFileUpload(file);
    // } else {
    //   toast.warning(`Tipo di file non supportato (${fileExtension}): ${file.name}`);
    // }
  
    filesArr.forEach((file) => {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        
      if (ACCEPTED_FILE_EXTENSIONS.includes(fileExtension)) {
        handleFileUpload(file);
      } else {
        toast.warning(`Tipo di file non supportato (${fileExtension}): ${file.name}`);
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

  const handleDeleteDocument = (name: string) => {
    if (onDeleteFile) onDeleteFile(name);
  };

  const openFileSelector = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = ACCEPTED_FILE_EXTENSIONS.join(',');
    fileInput.multiple = true;
    // fileInput.multiple = false;
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
        width: width? width:300,
        height: height? height:'auto',
        padding: '4px',
        textAlign: 'center',
        border: dragOver ? '2px dashed #0072E5' : '2px dashed #ccc',
        borderRadius: '6px',
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
              <Box onClick={openFileSelector} sx={{width:'100%', height:'97%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    marginTop: '8px',
                    marginBottom: '4px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  {documentPlaceHolder}
                </Typography>
              </Box>
            </>
          )}

          {documents.length > 0 && (
            <Box sx={{ height:'98%', marginTop: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}}>
              <DocumentList
                documents={documents}
                onDelete={handleDeleteDocument}
              />
            </Box>
          )}
        </>

      )}

    </Box>

  );
};

export default UploadableFileArea;