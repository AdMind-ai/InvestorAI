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
  'Callum': 'N2lVS1w4EtoT3dr4eOWO',
  'River': 'SAz9YHcvj6GT2YYXdXww',
  'Liam': 'TX3LPaxmHKxFdv7VOQHJ',
  'Charlotte': 'XB0fDUnXU5powFXDhCwa',
  'Alice': 'Xb7hH8MSUJpSbSDYk0k2',
  'Matilda': 'XrExE9yKIg1WjnnlVkGX',
  'Will': 'bIHbv24MWmeRgasZH58o',
  'Jessica': 'cgSgspJ2msm6clMCkdW9',
  'Eric': 'cjVigY5qzO86Huf0OWal',
  'Chris': 'iP95p4xoKVk53GoZ742B',
  'Brian': 'nPczCjzI2devNBz1zQrb',
  'Daniel': 'onwK4e9ZLuTAKqWW03F9',
  'Lily': 'pFZP5JQG7iQjIQuC4Bku',
  'Bill': 'pqHfZKP75CvOlQylNhV4',
  'MarcoTrox - Italian Professional Voice Talent': '13Cuh3NuYvWOVQtLbRN8',
  'Aaron - AI & Tech News': '3DR8c2yd30eztg65o4jV',
  'Benjamin - Criovozia': '80lPKtzJMPh1vjYMUgwe',
  'Ava - youthful and expressive German female voice': 'AnvlJBAqSLDzEevYr9Ap',
  'Giulia - sweet and soothing': 'CnVVMwhKmKZ6hKBAkL6Y',
  'Andy M - Italian male warm expressive': 'DLMxnwJE0a28JQLTMJPJ',
  'Dante - Italian, 30 years old': 'F7eI6slaNFiCSAjYVX5H',
  'Voce Minatore Audiolibro': 'F9w7aaEjfT09qV89OdY8',
  'Ronny Pro': 'IxprfqLvLirqXn7FdoLy',
  'Giacomo Andreoli': 'K1tUDof5PBLHFWSha7Rk',
  'Aaron Patrick - Fun-Upbeat': 'MP7UPhn7eVWqCGJGIh6Q',
  'Rossana': 'NHKPYzJJpg27vbywLSzX',
  'Gabriel - French high quality': 'PBm6YPbx7WbrxFTZwj3E',
  'Alessandro': 'PSp7S6ST9fDNXDwEzX0m',
  'Christopher': 'QRtC9QO1TMWv4NedDNQo',
  'Christopher - scientific mind': 'SKiSiJy90hYzWch2Gohz',
  'GianP - Social Media & Ads': 'SpoXt7BywHwFLisCTpQ3',
  'Hannah - assertive & refined': 'WS5NDpCHnVmKWdD3oolF',
  'Victor Power - Ebooks': 'YNOujSUmHtgN6anjqXPf',
  'ScheilaSMTy': 'cyD08lEy76q03ER1jZ7y',
  'Chris Basetta - Profonda': 'g1X9mrbeBlMAWtcs2Dfp',
  'Luca': 'kmIocz8ptnzGYxNhfW6f',
  'Francesco': 'lcweSB9PJMspXEFIqkPb',
  'Bill - Health Nutrition Videos': 'lnUnPeUhSI5EcqtFBux7',
  'Tyler Kurk': 'raMcNf2S8wCmuaBcyI6E',
  'Chris Basetta - Social Media': 't3hJ92dgZhDVtsff084B',
  'Elena - Stories and Narrations': 'tXgbXPnsMpKXkuTgvE3h',
  'Justin Time - eLearning Narration': 'uFIXVu9mmnDZ7dTKCBTX',
  'French Darling - For Kids Stories and Audiobooks': 'vTGV06pygfwa2WhLDZFp',
  'Emanuel': 'xKlYVm5xfEkeK36yeDDj',
  'Adam': 'yfg5cjOrqg6KVleh2la0',
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
        <CustomTextArea value={text} onChange={setText} placeholder="Inserisci il testo qui." height='35vh' />
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
