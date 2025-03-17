import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Paper
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Layout from '../layouts/Layout'
import SimpleDropdown from '../components/SimpleDropdown'
import OutlinedButton from '../components/OutlinedButton'

// Importação dos ícones
import OverviewIcon from '@mui/icons-material/AnalyticsOutlined'
import SearchWebIcon from '@mui/icons-material/TravelExploreOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile'

// import AttachFileIcon from '@mui/icons-material/AttachFile'
// import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
// import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined'
// import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'

interface Message {
  sender: 'user' | 'ai',
  content: string;
}

const Chat: React.FC = () => {
  const theme = useTheme()
  const [selectedModel, setSelectedModel] = useState('GPT-4o mini')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [messages]);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (text.trim() === '') return;

    // adiciona mensagem usuário
    setMessages([...messages, { sender: 'user', content: text }])

    // limpa campo
    setText('')

    // simulação resposta IA
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', content: 'Resposta da IA aqui...' }])
    }, 500)
  }

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'center',
          padding: 'calc(3vh)',
          overflow: 'auto',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Title */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.2vw',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h2" sx={{ marginLeft: '1vw' }}>
              ChatGPT
            </Typography>

            <Box
              sx={{
                backgroundColor: theme.palette.primary.light,
                padding: '4px',
                borderRadius: '8px !important',
                display: 'inline-flex',
              }}
            >
              <ToggleButtonGroup
                value={selectedModel}
                exclusive
                onChange={(_, newValue) =>
                  newValue && setSelectedModel(newValue)
                }
                sx={{ gap: '4px', maxHeight: '4.1vh' }}
              >
                {['GPT-4o mini', 'GPT-4o', 'GPT-4.5', 'o3 mini'].map((model) => (
                  <ToggleButton
                    key={model}
                    value={model}
                    sx={{
                      textTransform: 'none',
                      fontSize:'14px',
                      fontWeight: 'regular',
                      color: theme.palette.text.primary,
                      backgroundColor: 'transparent',
                      borderRadius: '8px !important',
                      borderColor: 'transparent !important',
                      padding: '6px 12px',
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      },
                    }}
                  >
                    {model}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>


          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SimpleDropdown title="Chat salvate" options={['Test']} />

            <Typography
              variant="subtitle2"
              sx={{
                marginRight: '1vw',
                color: theme.palette.text.secondary,
                textDecoration: 'underline',
                cursor: 'pointer',
                '&:hover': {
                  color: theme.palette.secondary.light,
                },
              }}
              onClick={() => console.log('Click!')}
            >
              Cronologia
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Main Content */}
        <Box
          sx={{
            flex:1,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '1rem',
            height: '100%',
          }}
        >

          {/* Messages Container */}
          {messages.length > 0 && (
            <Box sx={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0, 
                overflowY: 'auto', 
                px:'1.5vw',
                paddingBottom: '0px', 
                mb: '22vh',
                // backgroundColor: 'red'
              }}
            >
              {messages.map((msg, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                  <Paper sx={{
                    maxWidth: '95%',
                    padding: '1rem',
                    backgroundColor: msg.sender === 'user' ? '#E6E6E6' : '#F8F8FA',
                    borderRadius: '8px',
                    borderColor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'hidden',
                    mb: '1vw',
                  }}>
                    <Typography variant="subtitle1" sx={{ fontSize:'14px', fontWeight: 'bold', mb: 1 }}>
                      {msg.sender === 'user' ? 'TU' : 'AI'}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef}></div>
            </Box>
          )}

          {/* TextArea Container */}
          {messages.length > 0 && (

            <Box sx={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents:'none', 
            }}>
              <Box sx={{
                  width: '100%',
                  maxWidth: '88vw',
                  minHeight: '20vh', 
                  borderRadius: '12px',
                  border: '1px solid #CBCBCB',
                  padding: '16px',      
                  backgroundColor:'white',
                  pointerEvents:'auto', 
              }}>
                <TextField
                  variant="standard"
                  inputRef={inputRef}
                  fullWidth
                  multiline
                  minRows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Come posso esserti d’aiuto?"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault(); 
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    mb: '50px',
                    '& .MuiInputBase-root': {
                      padding: 0, 
                      fontSize: '17px',
                      maxHeight: '200px', overflowY: 'auto', 
                      '&:before, &:after, &:hover:not(.Mui-disabled):before': { borderBottom: 'none !important' },
                    }
                  }}
                />

                <Box sx={{ position:'absolute', left:'26px', bottom:'16px', display:'flex', gap:2 }}>
                  <OutlinedButton icon={<AttachFileIcon />} title="Immagine/documento" color={1}/>
                  <OutlinedButton icon={<SearchWebIcon />} title="Searchweb" color={1}/>
                </Box>

                <Button
                  variant="contained"
                  disabled={text.trim().length===0}
                  onClick={handleSendMessage}
                  sx={{ 
                    position:'absolute',
                    right:'26px', bottom:'16px',
                    borderRadius:'6px',
                    padding:'6px 16px',
                    textTransform:'none',
                    width:'calc(9.5vw)', fontSize:'17px',
                  }}>
                  Invia
                </Button>
              </Box>
            </Box>
          )}

          {/* Mensagem inicial quando não houver mensagens */} 
          {messages.length == 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                // backgroundColor: 'red',
              }}
            >
              {/* Title */}
              {messages.length == 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                  }}
                >
                  Scrivi ciò di cui hai bisogno nella chat oppure seleziona un’attività che desideri svolgere dall’elenco sottostante.
                </Typography>
              )}
        
              {/* Text Area */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%',
                  maxWidth: '75vw',
                  // backgroundColor:'blue',
                  marginBottom: messages.length == 0 ? '3vh': 0,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    marginTop: '12px',
                    minHeight: '50px',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    border: `1px solid #CBCBCB`,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px',      
                  }}
                >
                  {/* Text Box */}
                  <TextField
                    variant="standard"
                    inputRef={inputRef}
                    fullWidth
                    multiline
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Come posso esserti d’aiuto?"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault(); 
                        handleSendMessage();
                      }
                    }}
                    sx={{
                      border: 'none',
                      outline: 'none',
                      minHeight: '50px', 
                      marginBottom: '50px',
                      maxHeight: 'calc(100% - 50px)', 
                      '& .MuiInputBase-root': {
                        padding: 0,
                        fontSize: '17px',
                        color: theme.palette.text.primary,
                        '&:before, &:after': { border: 'none' },
                        overflow: 'auto',
                        '&:before, &:after, &:hover:not(.Mui-disabled):before': {
                          borderBottom: 'none !important',
                        },
                      },
                      '& .MuiInputBase-inputMultiline': {
                        overflow: 'auto',
                      },
                    }}
                  />
        
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '16px',
                      bottom: '16px',
                      padding: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <OutlinedButton
                      icon={<AttachFileIcon />}
                      title="Immagine/documento"
                      color={1}
                    />
                    <OutlinedButton
                      icon={<SearchWebIcon />}
                      title="Searchweb"
                      color={1}
                    />
                  </Box>
        
                  {/* Send Button - Bottom Right */}
                  <Button
                    variant="contained"
                    disabled={text.trim().length === 0}
                    onClick={handleSendMessage}
                    sx={{
                      position: 'absolute',
                      right: '16px',
                      bottom: '16px',
                      borderRadius: '6px',
                      padding: '6px 16px',
                      textTransform: 'none',
                      width: 'calc(9.5vw)',
                      fontSize: '17px',
                    }}
                  >
                    Invia
                  </Button>
                </Box>
              </Box>
        
              {messages.length == 0 && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <OutlinedButton
                    icon={<OverviewIcon />}
                    title="Overview del titolo"
                    color={1}
                  />
                </Box>
              )}
        
        
            </Box>
          )}

        </Box>

      </Box>
    </Layout>
  )
}

export default Chat
