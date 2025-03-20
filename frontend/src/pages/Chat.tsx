import React, { useState } from 'react'
import { Box, Divider } from '@mui/material'
import Layout from '../layouts/Layout'
import ChatHeader from '../components/ChatPage/ChatHeader'
import ChatMessageList from '../components/ChatPage/ChatMessageList'
import ChatInputArea from '../components/ChatPage/ChatInputArea'

interface Message {
  sender: 'user' | 'ai'
  content: string
}

const Chat: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('GPT-4o mini')
  const [messages, setMessages] = useState<Message[]>([])
  const [citations, setCitations] = useState<string[]>([])
  const [searchWebEnabled] = useState(false)

  const handleSendMessage = (message: string, sender: 'user'|'ai', isStream: boolean = false) => {
    if (!isStream) {
      // comportamento normal (não-streaming)
      setMessages(messages => [...messages, { sender, content: message }]);
    } else {
      // comportamento de streaming 
      setMessages(messages => {
        const lastMessage = messages[messages.length - 1];
        if (sender === 'ai' && lastMessage?.sender === 'ai') {
          // Atualiza última mensagem quando sender for 'ai'
          return [...messages.slice(0, -1), { sender: 'ai', content: lastMessage.content + message }];
        } else {
          // Inicia uma nova mensagem de streaming
          return [...messages, { sender, content: message }];
        }
      });
    }
  };

  return (
    <Layout>
      <Box
        sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: '2.2vh 3vh',
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
              <ChatMessageList messages={messages} citations={citations} />
              <ChatInputArea 
                onSend={handleSendMessage} 
                selectedModel={selectedModel} 
                searchWebEnabled={searchWebEnabled}
                isEmptyMessages={false}
                setCitations={setCitations}
              />
            </>
          ) : (
            <ChatInputArea 
              onSend={handleSendMessage} 
              selectedModel={selectedModel} 
              searchWebEnabled={searchWebEnabled}
              isEmptyMessages={true}
              setCitations={setCitations}
            />
            // <ChatEmptyState onSendMessage={(msg)=>handleSendMessage(msg,"user")} />
          )}
        </Box>
      </Box>
    </Layout>
  )
}

export default Chat