import React from 'react'
import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useTheme } from '@mui/material/styles'

interface ChatHeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedModel, setSelectedModel }) => {
  const theme = useTheme()

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
            onChange={(_, value) => value && setSelectedModel(value)}
            sx={{ gap: '4px', maxHeight: '4.1vh' }}
          >
            {['GPT-4o mini', 'GPT-4o', 'GPT-4.5', 'o3 mini'].map(model => (
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
  )
}

export default ChatHeader