import React, { useEffect, useRef } from 'react'
import { Box, Paper, Typography } from '@mui/material'

interface Message {
  sender: 'user' | 'ai'
  content: string
}

interface ChatMessageListProps {
  messages: Message[]
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        top:0, bottom:0, left:0, right:0, 
        overflowY: 'auto', 
        px:'1.1vw',
        paddingBottom: '0px', 
        mb: '1vh',
        pb: '20vh',
        mx:0
      }}
    >
      {messages.map((msg, idx) => (
        <Box key={idx} display="flex" justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'} mb={1}>
          <Paper 
            sx={{ 
              maxWidth: '95%',
              padding: '1rem',
              backgroundColor: msg.sender === 'user' ? '#E6E6E6' : '#F8F8FA',
              borderRadius: '8px',
              borderColor: 'transparent',
              boxShadow: 'none',
              overflow: 'hidden',
              mb: '1vw',
            }}
          >
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
  )
}

export default ChatMessageList