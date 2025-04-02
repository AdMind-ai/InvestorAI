import React, { useState, useEffect } from 'react'
import { Box, Divider } from '@mui/material'
import Layout from '../layouts/Layout'
import ChatHeader from '../components/ChatPage/ChatHeader'
import ChatMessageList from '../components/ChatPage/ChatMessageList'
import ChatInputArea from '../components/ChatPage/ChatInputArea'
import { DotTyping } from '../components/DotTyping';

import {api} from '../api/api'

interface Message {
  sender: 'user' | 'ai'
  content: string
}

const Chat: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('GPT-4o mini')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false);
  const [citations, setCitations] = useState<string[]>([])
  const [searchWebEnabled, setSearchWebEnabled] = useState(false)
  const [selectedChat, setSelectedChat] = useState<{ id: number | string ; name: string } | null>(null);

  const handleChatSelect = async (id: number | string | null , name: string | null ) => {
    console.log(`Selected Chat ID: ${id}, Name: ${name}`);
    if (id && name) {
      setSelectedChat({ id, name });
      
      try {
        const response = await api.get(`/openai/chat/conversations/${id}`);
        console.log(response.data); 
    
        const messages = response.data.messages.map((message: any) => ({
          ...message,  
          sender: message.is_user ? 'user' : 'ai'  
        }));
    
        setMessages(messages);
    
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    } else {
      setSelectedChat(null);
      setMessages([])
    }
  
  };

  useEffect(() => {
    if (searchWebEnabled) {
      setSelectedModel('GPT-4o');
      console.log(selectedModel)
    }
  }, [searchWebEnabled]);

  const handleSendMessage = (message: string, sender: 'user'|'ai', isStream: boolean = false) => {
    if (!isStream) {
      setMessages(messages => [...messages, { sender, content: message }]);
      if (sender === 'user') setIsTyping(true);
      console.log('entra')
    } else {
      setMessages(messages => {
        const lastMessage = messages[messages.length - 1];
        if (sender === 'ai' && lastMessage?.sender === 'ai') {
          return [...messages.slice(0, -1), { sender: 'ai', content: lastMessage.content + message }];
        } else {
          return [...messages, { sender, content: message }];
        }
      });
    }
    if (sender === 'ai') {
      console.log('sai')
      setIsTyping(false);
    }
  };

  useEffect(() => {
    console.log(selectedChat)
  }, [selectedChat]);

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
        <ChatHeader 
          selectedModel={selectedModel} 
          setSelectedModel={setSelectedModel} 
          searchWebEnabled={searchWebEnabled} 
          onChatSelect={handleChatSelect} 
          selectedChat={selectedChat}  
          setSelectedChat={setSelectedChat}
          saveCleanEnabled={messages.length > 0}
        />
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
          { selectedChat ? (
            <>
              <ChatMessageList messages={messages} citations={citations} isTyping={isTyping} />
              <ChatInputArea 
                onSend={handleSendMessage} 
                selectedModel={selectedModel} 
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                searchWebEnabled={searchWebEnabled}
                setSearchWebEnabled={setSearchWebEnabled}
                isEmptyMessages={false}
                setCitations={setCitations}
              />
            </>
          ) : (
            <ChatInputArea 
              onSend={handleSendMessage} 
              selectedModel={selectedModel} 
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              searchWebEnabled={searchWebEnabled}
              setSearchWebEnabled={setSearchWebEnabled}
              isEmptyMessages={true}
              setCitations={setCitations}
            />
            // messages.length > 0 ||
            // <ChatEmptyState onSendMessage={(msg)=>handleSendMessage(msg,"user")} />
          )}
        </Box>
      </Box>
    </Layout>
  )
}

export default Chat