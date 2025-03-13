// import { useTheme } from '@mui/material/styles'
// import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useState } from 'react'
import CustomTextArea from '../CustomTextArea'
import UploadableTextArea from '../UploadableTextArea'

const Traduttore = () => {
  // const theme = useTheme()
  // const navigate = useNavigate()
  const [selectedLanguage, setSelectedLanguage] = useState<null | string>(null);
  const [selectedVoice, setSelectedVoice] = useState<null | string>(null);
  const [text, setText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');

  const isButtonEnabled =
    selectedLanguage !== null && selectedVoice !== null && text.trim().length > 0;

  // const handleNavigation = (path: string) => {
  //   navigate(path)
  // }

  const handleFileUpload = (file: File) => {
    console.log('Arquivo carregado:', file);
    // Aqui você pode enviar o arquivo para um backend ou processar o conteúdo
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '2vw', alignItems: 'center' }}>

      {/* Text Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '2vw',
          width: '98%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Dropdown Lingua originale */}
          <SimpleDropdown title="Lingua originale" options={['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco']} onSelect={setSelectedLanguage} />
          {/* Upload Area */}
          <UploadableTextArea text={text} setText={setText} onFileUpload={handleFileUpload} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Dropdown Lingua target */}
          <SimpleDropdown title="Lingua target" options={['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco']} onSelect={setSelectedVoice} />
          {/* TextArea */}
          <CustomTextArea value={translatedText} onChange={setTranslatedText} placeholder="" height='45vh' />
        </Box>
      </Box>


      {/* Generate Button */}
      <Button
        variant="contained"
        disabled={!isButtonEnabled}
        sx={{ borderRadius: '6px', padding: '6px 16px', textTransform: 'none', width: 'calc(9.5vw)', fontSize: '17px', marginTop: '2vw' }}
      >
        Traduci
      </Button>
    </Box>
    
  )
}

export default Traduttore
