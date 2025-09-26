import React, { useState, useEffect } from 'react'
import { Box, Divider } from '@mui/material'
import Layout from '../layouts/Layout'
import ChatHeader from '../components/ChatPage/ChatHeader'
import ChatMessageList from '../components/ChatPage/ChatMessageList'
import ChatInputArea from '../components/ChatPage/ChatInputArea'

import { api } from '../api/api'
import { toast } from 'react-toastify'

interface Message {
  sender: 'user' | 'ai'
  content: string
  citations?: string[]
}

interface ApiMessage {
  id: number;
  conversation: string;
  content: string;
  file: string | null;
  created_at: string;
  is_user: boolean;
}

// interface ApiChatResponse {
//   id: string;
//   name: string;
//   user: number;
//   created_at: string;
//   messages: ApiMessage[];
// }

const Chat: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('GPT-5')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false);
  const [isOverview, setIsOverview] = useState(false);
  const [citations, setCitations] = useState<string[]>([])
  const [searchWebEnabled, setSearchWebEnabled] = useState(false)
  const [selectedChat, setSelectedChat] = useState<{ id: number | string; name: string; thread_id: string | null } | null>(null);
  const [conversationId, setConversationId] = useState<string>('');

  useEffect(() => {
    const createConversation = async () => {
      try {
        await api.post('/openai/chat/create-conversation/', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).then(response => {
          if (response.status === 201) {
            setConversationId(response.data.conversation_id);
          }
        });
      } catch (err) {
        console.error("Erro ao criar nova conversa:", err);
        toast.error("Erro ao criar nova conversa:");
      }
    }
    createConversation();
  }, []);

  const handleChatSelect = async (id: number | string | null, name: string | null, thread_id: string | null) => {
    if (id && name && thread_id) {
      console.log(`Selected Chat ID: ${id}, Name: ${name}`);
      setSelectedChat({ id, name, thread_id });

      try {
        const response = await api.get(`/openai/chat/${id}`);
        console.log(response.data, citations);

        const messages = response.data.messages.map((message: ApiMessage & { citations?: string[] }) => ({
          sender: message.is_user ? 'user' : 'ai',
          content: message.content,
          citations: message.citations || []
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

  const handleSendMessage = (message: string, sender: 'user' | 'ai', isStream: boolean = false) => {
    console.log('----------------------------')
    console.log('onsend:', message, '\n', sender, ' - ', isStream);
    if (!isStream) {
      setIsOverview(false);
      if (sender === 'user')
        setMessages(messages => [...messages, { sender, content: message }]);
    } else {
      console.log('isOverview: ', isOverview, 'isTyping: ', isTyping)
      setMessages(messages => {
        const lastMessage = messages[messages.length - 1];
        if (sender === 'ai' && lastMessage?.sender === 'ai') {
          return [...messages.slice(0, -1), { sender: 'ai', content: lastMessage.content + message }];
        } else {
          return [...messages, { sender, content: message }];
        }
      });
    }
    console.log('----------------------------')
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
        <ChatHeader
          conversationId={conversationId}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onChatSelect={handleChatSelect}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          saveCleanEnabled={messages.length > 0}
          messages={messages}
          setMessages={setMessages}
        />

        <Divider />

        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '1rem',
            height: '100%',
          }}
        >
          <ChatMessageList
            messages={messages}
            isTyping={isTyping}
            isOverview={isOverview}
          />
          {/* Messages Container */}
          <ChatInputArea
            conversationId={conversationId}
            onSend={handleSendMessage}
            selectedModel={selectedModel}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            searchWebEnabled={searchWebEnabled}
            setSearchWebEnabled={setSearchWebEnabled}
            isEmptyMessages={!(selectedChat || messages.length != 0)}
            setCitations={setCitations}
            setIsOverview={setIsOverview}
            setIsTyping={setIsTyping}
          />

        </Box>
      </Box>
    </Layout>
  )
}

export default Chat