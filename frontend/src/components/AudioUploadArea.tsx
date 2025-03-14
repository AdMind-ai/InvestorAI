import React, { useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AudioFileOutlinedIcon from '@mui/icons-material/AudioFileOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddRounded';;
import AudiotrackIcon from '@mui/icons-material/AudiotrackOutlined';
import CancelIcon from '@mui/icons-material/CancelOutlined';

interface AudioUploadAreaProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const AudioUploadArea: React.FC<AudioUploadAreaProps> = ({ selectedFile, setSelectedFile }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.[0]) {
        setSelectedFile(event.target.files[0]);
      }
    };

    const removeFile = () => {
      setSelectedFile(null);
    };

    const fileNameWithoutExtension = (name: string) => 
      name.slice(0, name.lastIndexOf('.')) || name;

    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #ddd',
        borderRadius: '12px',
        width: '100%',
        height: '45px',
        padding: '8px 8px 8px 12px',
        cursor: 'pointer'
      }}
        onClick={() => fileInputRef.current?.click()}
      >
        {selectedFile ? (
          <>
            <Typography variant="subtitle2" sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AudiotrackIcon color="action" sx={{ fontSize: '1.2rem' }} />
              {fileNameWithoutExtension(selectedFile.name)}
            </Typography>
            <IconButton color="error" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
              <CancelIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          </>
        ) : (
          <>
            <Typography variant="subtitle2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', marginLeft:'5px', textDecoration: 'underline' }}>
              <AudioFileOutlinedIcon color="action" sx={{ fontSize: '1.2rem', marginRight:'5px' }} />
              Carica il tuo file audio oppure trascinalo direttamente qui
            </Typography>
            <AddCircleOutlineIcon color="error" sx={{ fontSize: '1.3rem', fontWeight: 700, marginRight:'5px' }} />
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          hidden
          onChange={handleFileChange}
        />
      </Box>
    )
};

export default AudioUploadArea;