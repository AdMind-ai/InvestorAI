import React, {useState, useEffect} from 'react'
import SimpleDropdown from '../SimpleDropdown'
import SaveCleanButtons from '../SaveCleanButtons'
import { useTheme } from '@mui/material/styles'
import { api } from '../../api/api';
import { toast } from 'react-toastify'
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Chat {
  id: number | string; 
  name: string;
}

interface ApiMessage {
  id: number;
  conversation: string;
  content: string;
  file: string | null;
  created_at: string;
  is_user: boolean;
}

interface ApiChatResponse {
  id: string;
  name: string;
  user: number;
  created_at: string;
  messages: ApiMessage[];
}


interface ChatHeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  searchWebEnabled : boolean;
  onChatSelect: (id: number | string | null , name: string | null) => void;
  selectedChat: { id: number | string; name: string } | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<{ id: number | string; name: string } | null>>;
  saveCleanEnabled : boolean;
}

export const modelMapping: Record<string, string> = {
  "GPT-4o mini": "gpt-4o-mini",
  "GPT-4o": "gpt-4o",
  "GPT-4.5": "gpt-4.5-preview",
  "o3 mini": "o3-mini"
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  selectedModel, 
  setSelectedModel, 
  searchWebEnabled, 
  onChatSelect,
  selectedChat,
  setSelectedChat, 
  saveCleanEnabled,
}) => {

  const theme = useTheme()
  const [chats, setChats] = useState<{ id: number | string; name: string; }[]>([]);
  // const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  
  const handleSaveClick = () => {
    setOpenSaveModal(true);
  };

  const handleDeleteClick = (chat: { id: string | number; name: string; } | null) => {
    setSelectedChat(chat);
    setOpenDeleteModal(true);
  };

  const handleSaveChat = async () => {
    if (!newChatName.trim() || chats.some(chat => chat.name === newChatName)) {
      alert("Nome inválido ou já existe. Escolha outro.");
      return;
    }
  
    if (selectedChat) {
      const oldChat = selectedChat
      const newChat = { id: selectedChat.id, name: newChatName };
      
      try {
        await api.put(`/openai/chat/conversations/${selectedChat.id}/`, {
          name: newChatName,
        });
        
        setChats(chats.map(chat => 
          chat.id === selectedChat.id ? newChat : chat
        ));
        setSelectedChat(newChat); 
        onChatSelect(newChat.id, newChat.name);
        toast.success(`Chat ${oldChat.name} aggiornato al nome "${newChat.name}"`);
      } catch (error) {
        console.error('Erro ao salvar o chat:', error);
      }
    }
  
    setOpenSaveModal(false);
    setNewChatName('');
  };

  const handleDeleteChat = async () => {
    if (selectedChat) {
      try {
        await api.delete(`/openai/chat/conversations/${selectedChat.id}/`);
        toast.success(`Chat "${selectedChat.name}" eliminato con successo.`);
        setChats(chats.filter(chat => chat.id !== selectedChat.id));
        setOpenDeleteModal(false);
        setSelectedChat(null);
        onChatSelect(null, null);
      } catch (error) {
        console.error('Erro ao deletar o chat:', error);
      }
    } else {
      console.warn('Nenhum chat selecionado para excluir.');
    }
  };

  const handleDropdownSelect = (name: string) => {
    const chat = chats.find(chat => chat.name === name);
    if (chat && onChatSelect) {
      onChatSelect(chat.id, chat.name);
      setSelectedChat({ id: chat.id, name: chat.name });
    }
  };

  useEffect(() => {
    const fetchChatConversations = async () => {
      try {
        const response = await api.get('/openai/chat/conversations/');
        const chatList: Chat[] = response.data.map((conversation: ApiChatResponse) => ({
          id: conversation.id,
          name: conversation.name,
        }));

        setChats(chatList);

        // Filtrar chats com o nome 'New Chat'
        const chatsToRemove = chatList.filter((chat) => chat.name === 'New Chat');

        // Remover esses chats do backend
        for (const chat of chatsToRemove) {
          await removeChat(chat.id);
        }

      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    const removeChat = async (chatId: string | number) => {
      const response = await api.delete(`/openai/chat/conversations/${chatId}/`);

      if (response.status === 204 || response.status === 200) {
        console.log(`Chat ${chatId} excluído.`);
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        setSelectedChat(null);
        onChatSelect(null, null);
      } else {
        console.error(`Erro ao excluir chat ${chatId}:`, response.statusText);
      }
        
    };

    fetchChatConversations();
  }, []); 

  return(
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
            onChange={(_, value) => {
              if (!searchWebEnabled && value) setSelectedModel(value); 
            }}
            aria-label="model selection"
            sx={{ gap: '4px', maxHeight: '4.1vh' }}
          >
            {Object.keys(modelMapping).map(model => (
              <ToggleButton key={model} value={model}
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
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    },
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
        {saveCleanEnabled? <SaveCleanButtons onSave={handleSaveClick} onClean={() => handleDeleteClick(selectedChat)} /> : null}
        <SimpleDropdown 
          title="Chat salvate" 
          options={chats.map(chat => chat.name)} 
          onSelect={handleDropdownSelect} 
          selectedValue={selectedChat ? selectedChat.name : ''}
        />
      </Box>

      {/* Modal para salvar chat */}
      <Dialog open={openSaveModal} onClose={() => setOpenSaveModal(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', justifyContent: 'center', mt:2, fontSize:'26px', borderRadius: '16px' }}>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            Salva Chat
          </Box>
          <IconButton
            onClick={() => setOpenSaveModal(false)}
            sx={{ position: 'absolute', top:10, right:10 }}
          >
            <CloseIcon sx={{color:'#000'}} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ borderRadius: '16px' }}>
          <DialogContentText sx={{ color: 'black', textAlign: 'center', fontSize:'20px', my:0.5, mx:1 }}>
            Scegli un nome per il chat:
          </DialogContentText>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <input 
              type="text" 
              value={newChatName} 
              onChange={(e) => setNewChatName(e.target.value)} 
              style={{ width: '80%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{justifyContent: 'center', pb:2.5, mb:2, borderRadius: '16px'}}>
          <Button 
            variant="contained" 
            onClick={handleSaveChat} 
            sx={{ py:2.6, borderRadius: '10px' }}
          >
            Salva
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para deletar chat */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', justifyContent: 'center', mt:2, fontSize:'26px', borderRadius: '16px' }}>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            Conferma Eliminazione
          </Box>
          <IconButton
            onClick={() => setOpenDeleteModal(false)}
            sx={{ position: 'absolute', top:10, right:10 }}
          >
            <CloseIcon sx={{color:'#000'}} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ borderRadius: '16px' }}>
          <DialogContentText sx={{ color: 'black', textAlign: 'center', fontSize:'20px', my:0.5, mx:1 }}>
            Vuoi davvero eliminare il chat {selectedChat?.name}?<br />
            Una volta eliminato, non sarà possibile recuperarlo.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{justifyContent: 'center', pb:2.5, mb:2, borderRadius: '16px'}}>
          <Button 
            variant="contained" 
            onClick={handleDeleteChat} 
            sx={{ bgcolor: '#d32f2f', color: '#fff', py:2.6, borderRadius: '10px', '&:hover': {bgcolor: '#c62828'} }}
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default ChatHeader