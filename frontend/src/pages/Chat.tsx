import React, { useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Layout from '../layouts/Layout'
import SimpleDropdown from '../components/SimpleDropdown'
import OutlinedButton from '../components/OutlinedButton'

// Importação dos ícones
import OverviewIcon from '@mui/icons-material/AnalyticsOutlined'
import SearchWebIcon from '@mui/icons-material/TravelExploreOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile'

// import AttachFileIcon from '@mui/icons-material/AttachFile'
// import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
// import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined'
// import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'

const Chat: React.FC = () => {
  const theme = useTheme()
  const [selectedModel, setSelectedModel] = useState('GPT-4o mini')

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'center',
          padding: 'calc(3vh)',
          overflow: 'auto',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Title */}
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
                onChange={(_, newValue) =>
                  newValue && setSelectedModel(newValue)
                }
                sx={{ gap: '4px', maxHeight: '4.1vh' }}
              >
                {['GPT-4o mini', 'GPT-4o', 'GPT-4.5', 'o3 mini'].map((model) => (
                  <ToggleButton
                    key={model}
                    value={model}
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
            <SimpleDropdown title="Chat salvate" options={['']} />

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

        <Divider />

        {/* Main Content */}
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
              marginBottom: '3vh',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                marginTop: '12px',
              }}
            >
              {/* Text Box */}
              <TextField
                variant="outlined"
                fullWidth
                multiline
                minRows={1}
                value={''}
                placeholder="Come posso esserti d’aiuto?"
                sx={{
                  fontSize: '10px',
                  backgroundColor: 'inherit',
                  borderRadius: '12px',
                  minHeight: '50px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    paddingBottom: '70px',
                    fontSize: '17px',
                    minHeight: '50px',
                    color: theme.palette.text.secondary,
                    overflow: 'auto',
                  },
                }}
              />

              {/* Attach File Button - Bottom Left */}
              {/* <Button
                sx={{
                  position: 'absolute',
                  left: '16px',
                  bottom: '16px',
                  width: '36px',
                  height: '36px',
                  minWidth: '36px',
                  padding: 0,
                  borderRadius: '6px',
                  color: theme.palette.text.secondary,
                  backgroundColor: theme.palette.background.paper,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AttachFileIcon />
              </Button> */}

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
                disabled
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
            {/* <OutlinedButton
              icon={<DescriptionOutlinedIcon />}
              title="Scrivi articolo"
              color={1}
            />
            <OutlinedButton
              icon={<TipsAndUpdatesOutlinedIcon />}
              title="Analyse Data"
              color={2}
            />
            <OutlinedButton
              icon={<CampaignOutlinedIcon />}
              title="Summarize Text"
              color={3}
            /> */}
          </Box>

        </Box>
      </Box>
    </Layout>
  )
}

export default Chat
