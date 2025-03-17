import React, { useState, useEffect, useRef } from 'react'
import { Box, Button, TextField } from '@mui/material'
import OutlinedButton from '../OutlinedButton'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import SearchWebIcon from '@mui/icons-material/TravelExploreOutlined'

interface ChatInputAreaProps {
  onSend: (message: string) => void;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ onSend }) => {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  }

  return (
    <Box sx={{ 
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents:'none', 
      }}
    >
      <Box sx={{
          width: '100%',
          maxWidth: '86vw',
          minHeight: '20vh', 
          borderRadius: '12px',
          border: '1px solid #CBCBCB',
          padding: '16px',      
          backgroundColor:'white',
          pointerEvents:'auto', 
        }}
      >
        <TextField inputRef={inputRef} variant="standard" multiline fullWidth minRows={2}
          value={text} placeholder="Come posso esserti d’aiuto?"
          onChange={e=>setText(e.target.value)} 
          onKeyDown={e=> (e.key==='Enter' && !e.shiftKey && (e.preventDefault(),handleSubmit()))}
          sx={{
            mb: '40px',
            '& .MuiInputBase-root': {
              padding: 0, 
              fontSize: '17px',
              maxHeight: '200px', overflowY: 'auto', 
              '&:before, &:after, &:hover:not(.Mui-disabled):before': { borderBottom: 'none !important' },
            }
          }}
        />

        <Box sx={{ position:'absolute', bottom: '1.8vh', left: '2.6vw', display: 'flex', gap: 2 }}>
          <OutlinedButton icon={<AttachFileIcon />} title="Immagine/documento" color={1}/>
          <OutlinedButton icon={<SearchWebIcon />} title="SearchWeb" color={1}/>
        </Box>

        <Button
          variant="contained"
          disabled={text.trim().length===0}
          onClick={handleSubmit}
          sx={{ 
            position:'absolute',
            right:'2.6vw', bottom:'1.8vh',
            borderRadius:'6px',
            padding:'6px 16px',
            textTransform:'none',
            width:'calc(9.5vw)', fontSize:'17px',
          }}>
          Invia
        </Button>

      </Box>
    </Box>
  )
}

export default ChatInputArea