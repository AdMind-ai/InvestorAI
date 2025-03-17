import { Box, Typography, TextField, Button } from '@mui/material'
import OutlinedButton from '../OutlinedButton'
import OverviewIcon from '@mui/icons-material/AnalyticsOutlined'
import React, { useState, useEffect, useRef } from 'react'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import SearchWebIcon from '@mui/icons-material/TravelExploreOutlined'
import { useTheme } from '@mui/material/styles'

interface ChatEmptyStateProps {
    onSendMessage: (message: string) => void;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSendMessage }) => {
  const theme = useTheme();
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  }
  
  return (
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
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.primary,
          textAlign: 'center',
        }}
      >
        Scrivi ciò di cui hai bisogno nella chat oppure seleziona un’attività che desideri svolgere dall’elenco sottostante.
      </Typography>

      {/* Text Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          maxWidth: '75vw',
          // backgroundColor:'blue',
          marginBottom: '3vh',
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
            minRows={2}
            fullWidth
            multiline
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Come posso esserti d’aiuto?"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                handleSubmit();
              }
            }}
            sx={{
              border: 'none',
              outline: 'none',
              minHeight: '50px', 
              marginBottom: '40px',
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
            onClick={handleSubmit}
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

      <Box sx={{ display: 'flex', gap: 2 }}>
        <OutlinedButton
          icon={<OverviewIcon />}
          title="Overview del titolo"
          color={1}
        />
      </Box>
      


    </Box>
  )
}
  
export default ChatEmptyState