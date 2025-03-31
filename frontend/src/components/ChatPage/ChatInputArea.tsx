import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, IconButton  } from '@mui/material';
import OutlinedButton from '../OutlinedButton';
import FilePresentRoundedIcon from '@mui/icons-material/FilePresentRounded';
import CloseIcon from '@mui/icons-material/DisabledByDefaultRounded';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchWebIcon from '@mui/icons-material/TravelExploreOutlined';
import OverviewIcon from '@mui/icons-material/AnalyticsOutlined';
import openai from '../../utils/openaiClient';
import { modelMapping } from './ChatHeader';
import { useTheme } from '@mui/material/styles';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import CircularProgress from '@mui/material/CircularProgress';

interface ChatInputAreaProps {
  onSend: (content: string, sender: 'user' | 'ai', isStream?: boolean) => void;
  selectedModel: string;
  searchWebEnabled: boolean;
  isEmptyMessages: boolean;
  setCitations?: React.Dispatch<React.SetStateAction<string[]>>;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSend,
  selectedModel,
  searchWebEnabled,
  isEmptyMessages,
  setCitations
}) => {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isFileAttached, setIsFileAttached] = useState(false);
  const [isWebSearch, setIsWebSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if(selectedFile) {
      setFile(selectedFile);
      setIsFileAttached(true);
    }
  };

  const handleFileUploadClick = () => {
    document.getElementById('file-input')?.click();
  };

  const handleWebSearchClick = () => {
    setIsWebSearch(prev => !prev);
  };

  const handleOverviewClick = async () => {
    setLoading(true);
    
    try {
      const response = await fetchWithAuth('/perplexity/deep-search/', {
        method: 'POST',
        body: JSON.stringify({
          message: "Please give me a deep overview about the company FOPE SPA, listed in the Italian Stock Market, stock price and general overview for the last 24 hours. Please answer in Italian language."
        })
      });
  
      if (!response.ok || !response.body) {
        onSend('Erro ao conectar.', 'ai');
        setLoading(false);
        return;
      }
      setLoading(false);
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let citationsReceived = false;
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
  
        if (!citationsReceived && chunk.includes('_CITATIONS_START_')) {
          const citationsJson = chunk.substring(
            chunk.indexOf('_CITATIONS_START_') + '_CITATIONS_START_'.length,
            chunk.indexOf('_CITATIONS_END_')
          );
          const citations = JSON.parse(citationsJson).citations;
          setCitations?.(citations);
          citationsReceived = true;
  
          const cleanedChunk = chunk.substring(chunk.indexOf('_CITATIONS_END_') + '_CITATIONS_END_'.length);
          onSend(cleanedChunk, 'ai', true);
        } else {
          onSend(chunk, 'ai', true); 
        }
      }
  
    } catch (error) {
      console.error('Erro ao conectar:', error);
      onSend('Erro ao conectar.', 'ai');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsFileAttached(false);
    if (!text.trim()) return;
  
    onSend(text, 'user');
  
    let finalPrompt = text;
    if (searchWebEnabled && isWebSearch) {
      finalPrompt += "\n\nCerca sul web informazioni sull'argomento sopra e completa la tua risposta.";
    }
  
    setText('');
    setFile(null);
  
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        try {
          const stream = await openai.chat.completions.create({
            model: realModelOpenAI,
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: finalPrompt },
                { type: 'image_url', image_url: { url: base64data } }
              ]
            }],
            stream: true, 
          });
  
          
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              onSend(delta, 'ai', true);
            }
          }
  
        } catch (error) {
          onSend('Erro ao gerar resposta da OpenAI.', 'ai');
          console.error(error);
        }
      };
  
    } else {
      try {
        const stream = await openai.chat.completions.create({
          model: realModelOpenAI,
          messages: [{ role: 'user', content: finalPrompt }],
          stream: true, 
        });
  
        
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            onSend(delta, 'ai', true);
          }
        }
  
      } catch (error) {
        onSend('Erro ao gerar resposta da OpenAI.', 'ai');
        console.error(error);
      }
    }
  };

  const realModelOpenAI = isWebSearch ? 'gpt-4o-search-preview' : (modelMapping[selectedModel] || 'gpt-4o-mini');

  const ChatTextInputBox = () => (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '50px',
        maxHeight: '300px',
        borderRadius: '12px',
        border: `1px solid #CBCBCB`,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
      }}
    >
      {AttachedFilePreview()}
      <TextField
        inputRef={inputRef}
        variant="standard"
        multiline
        fullWidth
        minRows={2}
        value={text}
        placeholder="Come posso esserti d’aiuto?"
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        sx={{
          mb: '60px',
          '& .MuiInputBase-root': {
            padding: 0,
            fontSize: '17px',
            maxHeight: isFileAttached? '160px':'200px',
            overflowY: 'auto',
            '&:before, &:after, &:hover:not(.Mui-disabled):before': {
              borderBottom: 'none !important'
            },
          }
        }}
      />

      <Box sx={{ position:'absolute', bottom:16, left:16, display:'flex', gap:2 }}>
        <input id="file-input" type="file" accept="image/*,application/pdf" hidden onChange={handleFileChange} />
        <OutlinedButton icon={<AttachFileIcon />} title="Immagine/documento" color={1} onClick={handleFileUploadClick} disabled={isFileAttached} toggleSelection={false}/>
        <OutlinedButton icon={<SearchWebIcon />} title="SearchWeb" color={1} onClick={handleWebSearchClick} isSelected={isWebSearch} disabled={isFileAttached}/>
      </Box>

      <Button
        variant="contained"
        disabled={!text.trim()}
        onClick={handleSubmit}
        sx={{
          position: 'absolute', bottom:16, right:16,
          borderRadius:'6px', padding:'6px 16px',
          textTransform:'none', width:'9.5vw', fontSize:'17px'
        }}
      >
        Invia
      </Button>
    </Box>
  );

  const AttachedFilePreview = () => file && (
    <Box sx={{display:'flex', gap:0.2, alignItems:'end', mb:1.5}}>
      <FilePresentRoundedIcon color="action" sx={{height:20}}/>
      <Typography variant="subtitle1" >
        {file.name.length > 100 ? file.name.substring(0,100)+'...' : file.name}
      </Typography>
      <IconButton 
        size="small" 
        onClick={()=>{
          setFile(null);
          setIsFileAttached(false);
          setIsWebSearch(false);
        }}
        sx={{
          color: '#FF1744',
          width: 15,
          height: 15,
          ml:3,
        }}
      >
        <CloseIcon sx={{fontSize: '15px', fontWeight:'700'}}/>
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%' }}>
      {isEmptyMessages ? (
        <>
          <Typography variant="body2" sx={{ mb:2, color: theme.palette.text.primary, textAlign: 'center' }}>
            Scrivi ciò di cui hai bisogno nella chat oppure seleziona un’attività che desideri svolgere dall’elenco sottostante.
          </Typography>

          <Box sx={{ width: '100%', maxWidth :'75vw', marginBottom:'3vh', display:'flex', flexDirection: 'column', alignItems:'center' }}>
            {ChatTextInputBox()}

            <Box sx={{ mt:2, display:'flex', gap:2, flexDirection:'column', alignItems: 'center' }}>
              <OutlinedButton icon={<OverviewIcon />} title="Overview del titolo" color={1} onClick={handleOverviewClick} />
              {loading && <CircularProgress />}
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', justifyContent:'center', pointerEvents:'none' }}>
          <Box sx={{ width:'100%', maxWidth:'86vw', backgroundColor:'white', borderRadius: '12px', pointerEvents:'auto' }}>
            {ChatTextInputBox()}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ChatInputArea;