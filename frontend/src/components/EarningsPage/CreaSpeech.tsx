// import { useTheme } from '@mui/material/styles'
// import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useState,useEffect } from 'react'
import CustomTextArea from '../CustomTextArea'

interface CreaSpeechProps {
  onChange: (isEnabled: boolean) => void
}

const CreaSpeech: React.FC<CreaSpeechProps> = ({ onChange }) => {
  // const theme = useTheme()
  // const navigate = useNavigate()
  const [selectedLanguage, setSelectedLanguage] = useState<null | string>(null);
  const [selectedVoice, setSelectedVoice] = useState<null | string>(null);
  const [text, setText] = useState<string>('');

  const isButtonEnabled =
    selectedLanguage !== null && selectedVoice !== null && text.trim().length > 0;
  
  useEffect(() => {
    onChange(isButtonEnabled);
  }, [isButtonEnabled, onChange]);

  // const handleNavigation = (path: string) => {
  //   navigate(path)
  // }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '2vw', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '98%' }}>
        {/* Dropdown Lingua */}
        <SimpleDropdown title="Lingua" options={['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco']} onSelect={setSelectedLanguage} />

        {/* Dropdown Voce */}
        <SimpleDropdown title="Voce speaker" options={['Voce sintetica 1_Christopher', 'Voce sintetica 2_Bill', 'Voce sintetica 3_Hanna']} onSelect={setSelectedVoice} />
      </Box>

      {/* Text Area */}
      <Box sx={{ width: '98%', maxHeight: '45vh' }}>
        <CustomTextArea value={text} onChange={setText} placeholder="Inserisci il testo qui." height='35vh' />
      </Box>

      {/* Generate Button */}
      <Button
        variant="contained"
        color='secondary'
        disabled={!isButtonEnabled}
        sx={{ borderRadius: '6px', padding: '6px 16px', textTransform: 'none', width: 'calc(9.5vw)', fontSize: '17px', marginTop: '2vw' }}
      >
        Genera
      </Button>
    </Box>
    
  )
}

export default CreaSpeech
