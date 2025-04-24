// import { useTheme } from '@mui/material/styles'
// import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useState,useEffect } from 'react'
import CustomTextArea from '../CustomTextArea'
import AudioPlayer from '../AudioPlayer';
import { api } from '../../api/api';
import CircularProgress from '@mui/material/CircularProgress';

interface CreaSpeechProps {
  onChange: (isEnabled: boolean) => void
}

const languageMap: Record<string, string> = {
  'Italiano': 'it',
  'Inglese': 'en',
  'Francese': 'fr',
  'Spagnolo': 'es',
  'Greco': 'el',
  'Portoghese': 'pt',
  'Tedesco': 'de',
};

const voiceMap: Record<string, string> = {
  'Aria': '9BWtsMINqrJLrRacOk9x',
  'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
  'Sarah': 'EXAVITQu4vr4xnSDxMaL',
  'Laura': 'FGY2WhTYpPnrIDTdsKH5',
  'Charlie': 'IKne3meq5aSn9XLyUdCD',
  'George': 'JBFqnCBsd6RMkjVDRZzb',
};

const CreaSpeech: React.FC<CreaSpeechProps> = ({ onChange }) => {
  // const theme = useTheme()
  // const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Italiano');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string>('');
  const voiceOptions = Object.keys(voiceMap);

  const isButtonEnabled =
    selectedLanguage !== null && selectedVoice !== null && text.trim().length > 0;
  
  useEffect(() => {
    onChange(isButtonEnabled);
    // Take this off - testing
    setSelectedLanguage('Italiano')
  }, [isButtonEnabled, onChange]);

  const handleGenerateAudio = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/elevenlabs/text-to-speech/', {
        send: text,
        language: languageMap[selectedLanguage!],
        id_voice: voiceMap[selectedVoice!],
        stability: 0.8,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
      });
      console.log(response)

      setIsLoading(false);
      const base64Audio = response.data.audio;
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      setAudioSrc(audioUrl);
      setIsGenerated(true);
    } catch (error) {
      console.error('Errore nella generazione audio', error);
      alert('Errore durante la generazione dell\'audio. Riprova.');
      setIsLoading(false);
    }
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '2vw', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '98%' }}>
        {/* Dropdown Lingua */}
        {/* <SimpleDropdown title="Lingua" options={['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco']} onSelect={setSelectedLanguage} selectedValue={selectedLanguage}/> */}

        {/* Dropdown Voce */}
        <SimpleDropdown title="Voce speaker" options={voiceOptions} onSelect={setSelectedVoice} selectedValue={selectedVoice}/>
      </Box>

      {/* Text Area */}
      <Box sx={{ width: '98%', maxHeight: '45vh' }}>
        <CustomTextArea value={text} onChange={setText} placeholder="Scrivi il tuo testo qui" height='35vh' hasLimit maxLength={10000} />
      </Box>

      {/* Audio Player */}
      {isGenerated && audioSrc && (
        <Box
          sx={{
            width: '98%',
            display: 'flex',
            alignItems: 'center',
            marginTop: '1vw',
          }}
        >
          {/* <AudioPlayer src="/audio/audio-file.wav" audioTitle="audio-file.wav"/>
          {audioSrc} */}
          <AudioPlayer src={audioSrc} audioTitle="audio-file-true.wav"/>
        </Box>
      )}

      {/* Generate Button */}
      <Button
        variant="contained"
        color='secondary'
        disabled={!isButtonEnabled}
        onClick={handleGenerateAudio}
        sx={{ borderRadius: '6px', padding: '6px 16px', textTransform: 'none', width: 'calc(9.5vw)', fontSize: '17px', marginTop: '2vw' }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Genera'}
      </Button>
    </Box>
    
  )
}

export default CreaSpeech
