import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import CustomTextArea from '../CustomTextArea';
import AudioUploadArea from '../AudioUploadArea';
import jsPDF from 'jspdf';
import downloadIcon from '../../assets/icons/download-icon.svg';
import { api } from '../../api/api'
import { fetchWithAuth } from '../../api/fetchWithAuth'
import UsageLimitModal from './UsageLimitModal'

const Trascrizione = () => {
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [showTextArea, setShowTextArea] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openLimitModal, setOpenLimitModal] = useState<boolean>(false);
  const [limitCount, setLimitCount] = useState<number | null>(null);
  const [limitMax, setLimitMax] = useState<number | null>(null);

  const isButtonEnabled = selectedAudioFile !== null;

  const handleFileUpload = async () => {
    if (!selectedAudioFile) return;

    const formData = new FormData();
    formData.append('file', selectedAudioFile);

    try {
      const response = await api.post('/openai/audio-transcription/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setText(response.data.text);

      // register usage after successful transcription
      try {
        await fetchWithAuth('/usage/feature/', {
          method: 'POST',
          body: JSON.stringify({ feature: 'trascrizione_audio' }),
        });
      } catch (err) {
        console.warn('Errore registrazione uso trascrizione', err);
      }
    } catch (error) {
      console.error('Erro ao transcrever o áudio:', error);
      // Adicione tratamento de erro se necessário
    }
  };

  const handleClickTrascrivi = () => {
    // check limit before performing transcription
    (async () => {
      try {
        const checkRes = await fetchWithAuth('/usage/feature/', {
          method: 'POST',
          body: JSON.stringify({ feature: 'trascrizione_audio', check_only: true }),
        });
        if (!checkRes.ok) {
          console.error('Errore controllo limite trascrizione');
          setLimitCount(null);
          setLimitMax(null);
          setOpenLimitModal(true);
          return;
        }
        const checkJson = await checkRes.json();
        if (checkJson.allowed === false) {
          setLimitCount(typeof checkJson.count === 'number' ? checkJson.count : null);
          setLimitMax(typeof checkJson.max_limit === 'number' ? checkJson.max_limit : 2);
          setOpenLimitModal(true);
          return;
        }
      } catch (err) {
        console.error('Errore controllo limite trascrizione', err);
        setLimitCount(null);
        setLimitMax(null);
        setOpenLimitModal(true);
        return;
      }

      setShowTextArea(true);
      handleFileUpload();
    })();
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDownloadPDF = (formatName: string) => {
    handleCloseMenu();
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 10;
    const marginY = 20;
    const maxWidth = pageWidth - marginX * 2;

    doc.text(text, marginX, marginY, { maxWidth, align: "left" });
    doc.save(`${formatName}.pdf`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '2vw', alignItems: 'center' }}>
      {/* Upload Area */}
      <Box sx={{ width: '98%' }}>
        <AudioUploadArea
          selectedFile={selectedAudioFile}
          setSelectedFile={(f) => {
            setSelectedAudioFile(f);
            setShowTextArea(false);
            setText('');
          }}
        />
      </Box>

      {/* TextArea */}
      {showTextArea && (
        <Box sx={{ marginTop: '1vw', width: '98%', position: 'relative' }}>
          <IconButton
            sx={{
              zIndex: 1,
              position: 'absolute',
              bottom: '8px',
              right: '10px',
              bgcolor: 'transparent',
              '&:hover': { backgroundColor: '#efefef' },
            }}
            onClick={handleDownloadClick}
            size="small"
          >
            <img src={downloadIcon} alt="Download" style={{height:'20px', width:'20px'}} />
          </IconButton>

          <CustomTextArea
            value={text}
            onChange={setText}
            placeholder=""
            height='35vh'
            isDisabled={false}
            showTyping={showTextArea}
          />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'top',  
              horizontal: 'center', 
            }}
            transformOrigin={{
              vertical: 'bottom',     
              horizontal: 'right', 
            }}
            sx={{
              '& .MuiPaper-root': { borderRadius: 5, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'white', padding: '0px 10px', border: '2px solid #ddd' },
            }}
          >
            <Box sx={{ p: '0px 16px', fontWeight: 'bold', fontSize:'20px' }}>
              Scarica:
            </Box>
            <MenuItem onClick={() => handleDownloadPDF('Carta_Intestata')} sx={{ fontSize:'16px', borderRadius: '7px', padding: '2px 10px' }}>
              Carta Intestata
            </MenuItem>
            <MenuItem onClick={() => handleDownloadPDF('Comunicato_Stampa_ita')} sx={{ fontSize:'16px', borderRadius: '7px', padding: '2px 10px' }}>
              Comunicato Stampa ita
            </MenuItem>
            <MenuItem onClick={() => handleDownloadPDF('Comunicato_Stampa_eng')} sx={{ fontSize:'16px', borderRadius: '7px', padding: '2px 10px' }}>
              Comunicato Stampa eng
            </MenuItem>
            <MenuItem onClick={() => handleDownloadPDF('Documento_PDF')} sx={{ fontSize:'16px', borderRadius: '7px', padding: '2px 10px' }}>
              PDF
            </MenuItem>
          </Menu>
        </Box>
      )}

      {/* Generate Button */}
      <Button
        variant="contained"
        color="secondary"
        disabled={!isButtonEnabled || showTextArea} 
        onClick={handleClickTrascrivi}
        sx={{
          borderRadius: '6px',
          padding: '6px 16px',
          textTransform: 'none',
          width: 'calc(9.5vw)',
          fontSize: '17px', 
          marginTop: '2vw'
        }}
      >
        Trascrivi
      </Button>
        <UsageLimitModal
          open={openLimitModal}
          onClose={() => setOpenLimitModal(false)}
          count={limitCount}
          max={limitMax}
          featureLabel="Trascrizione audio"
        />
    </Box>
  );
}

export default Trascrizione;