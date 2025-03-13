// import { useTheme } from '@mui/material/styles'
// import { useNavigate } from 'react-router-dom'
import { Box, Button, TextField } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useState } from 'react'

const Trascrizione = () => {
  // const theme = useTheme()
  // const navigate = useNavigate()
  const [selectedLanguage, setSelectedLanguage] = useState<null | string>(null);
  const [selectedVoice, setSelectedVoice] = useState<null | string>(null);
  const [text, setText] = useState<string>('');

  const isButtonEnabled =
    selectedLanguage !== null && selectedVoice !== null && text.trim().length > 0;

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
      <Box sx={{ position: 'relative', width: '98%', marginTop: '12px' }}>
        <TextField
          variant="outlined"
          fullWidth
          multiline
          minRows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Text here."
          sx={{
            fontSize: '10px',
            backgroundColor: 'inherit',
            borderRadius: '2vh',
            '& .MuiOutlinedInput-root': {
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '2vh',
              fontSize: '17px',
              minHeight: '200px', 
              maxHeight: '250px',
              overflow: 'auto', 
            },
            '& .MuiOutlinedInput-input': {
              overflowY: 'auto', 
              maxHeight: '300px',
            },
          }}
        />
      </Box>


      {/* Generate Button */}
      <Button
        variant="contained"
        disabled={!isButtonEnabled}
        sx={{ borderRadius: '6px', padding: '6px 16px', textTransform: 'none', width: 'calc(9.5vw)', fontSize: '17px', marginTop: '2vw' }}
      >
        Genera
      </Button>
    </Box>
    
  )
}

export default Trascrizione
