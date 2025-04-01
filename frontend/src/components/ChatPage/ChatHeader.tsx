import React, {useState, useEffect} from 'react'
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import SaveCleanButtons from '../SaveCleanButtons'
import { useTheme } from '@mui/material/styles'
import { api } from '../../api/api';
import { ResponseStream } from 'openai/lib/responses/ResponseStream.mjs'

interface ChatHeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  searchWebEnabled : boolean;
  onChatSelect: (id: number, name: string) => void;
}

export const modelMapping: Record<string, string> = {
  "GPT-4o mini": "gpt-4o-mini",
  "GPT-4o": "gpt-4o",
  "GPT-4.5": "gpt-4.5-preview",
  "o3 mini": "o3-mini"
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedModel, setSelectedModel, searchWebEnabled, onChatSelect }) => {
  const theme = useTheme()
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [chats, setChats] = useState<{ id: number; name: string; }[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ id: number; name: string } | null>(null);

  const handleChatSelect = (id: number, name: string) => {
    console.log(`Selected Chat ID: ${id}, Name: ${name}`);
    setSelectedChat({ id, name });
  };

  const handleDropdownSelect = (name: string) => {
    const chat = chats.find(chat => chat.name === name);
    if (chat && onChatSelect) {
      onChatSelect(chat.id, chat.name);
    }
  };

  useEffect(() => {
    const fetchChatConversations = async () => {
      try {
        const response = await api.get('/openai/chat/conversations');
        console.log(response)

        const chatList = response.data.map((conversation: any) => ({
          id: conversation.id,
          name: conversation.name
        }));
        setChats(chatList);

      } catch (error) {
        console.error("Error fetching conversations:", error);
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
        {isButtonEnabled? <SaveCleanButtons /> : null}
        <SimpleDropdown title="Chat salvate" options={chats.map(chat => chat.name)} onSelect={handleDropdownSelect} />
      </Box>

    </Box>
  )
}

export default ChatHeader