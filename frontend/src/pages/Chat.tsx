import React, { useState } from 'react'
import { Box, Divider } from '@mui/material'
import Layout from '../layouts/Layout'
import ChatHeader from '../components/ChatPage/ChatHeader'
import ChatMessageList from '../components/ChatPage/ChatMessageList'
import ChatInputArea from '../components/ChatPage/ChatInputArea'
import ChatEmptyState from '../components/ChatPage/ChatEmptyState'

interface Message {
  sender: 'user' | 'ai'
  content: string
}

const Chat: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('GPT-4o mini')
  const [messages, setMessages] = useState<Message[]>([])

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return
    setMessages(messages => [...messages, { sender: 'user', content: text }])

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
        padding: 'calc(3vh)',
        overflow: 'auto',
        height: '100%',
        width: '100%',
        }}
      >      
        {/* Header */}
        <ChatHeader selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
        <Divider />

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
          {messages.length > 0 ? (
            <>
              <ChatMessageList messages={messages} />
              <ChatInputArea onSend={handleSendMessage} />
            </>
          ) : (
            <ChatEmptyState onSendMessage={handleSendMessage} />
          )}
        </Box>
      </Box>
    </Layout>
  )
}

export default Chat