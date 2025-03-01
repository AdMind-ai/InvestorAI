import React, { useState } from 'react'
import {
  Box,
  Divider,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import Layout from '../layouts/Layout'
import { useTheme } from '@mui/material/styles'
import AttachFileIcon from '@mui/icons-material/AttachFile'

const Earnings: React.FC = () => {
  const theme = useTheme()
  const [selectedOption, setSelectedOption] = useState<string>('Crea speech')

  const Options = [
    {
      title: 'Crea speech',
      content: [
        'The speech must be in [English].',
        'You must control the attached file.',
        'From [slide 1 to slide 5, Mario Rossi, the CEO], speaks.',
        'From [slide 6 to slide 8, Anna Bianchi, the CFO], speaks.',
        'From [slide 9 to the end, Mario Rossi, the CEO], speaks again.',
        'The speech concludes with:',
        '"Operator, we are now ready to answer any questions from the audience.',
        'Thank you all for your attention.',
        'This presentation’s speech was created with the help of artificial intelligence, reproducing my voice in multiple languages."',
      ],
    },
    {
      title: 'Traduci documento',
      content:
        'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
    },
    {
      title: 'Trascrivi video o audio',
      content:
        'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
    },
    {
      title: 'Crea post per LinkedIn',
      content:
        'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
    },
  ]

  const selectedContent =
    Options.find((option) => option.title === selectedOption)?.content || ''

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '3vh',
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
          <Typography variant="h2" sx={{ marginLeft: '1vw' }}>
            Earnings
          </Typography>
          <Typography
            variant="subtitle1"
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

        <Divider />

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            paddingTop: '1.1vw',
          }}
        >
          {/* Selection Buttons */}
          <ToggleButtonGroup
            value={selectedOption}
            exclusive
            onChange={(_, newValue) => newValue && setSelectedOption(newValue)}
            sx={{
              display: 'flex',
              gap: 2,
              borderRadius: '12px',
              overflow: 'visible',
            }}
          >
            {Options.map((option) => (
              <ToggleButton
                key={option.title}
                value={option.title}
                sx={{
                  borderRadius: '10px !important',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  height: 'calc(5.3vh)',
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.grey[300]} !important`,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    borderColor: `${theme.palette.primary.main} !important`,
                  },
                }}
              >
                {option.title}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

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
              minRows={6}
              value={
                Array.isArray(selectedContent)
                  ? selectedContent.join('\n')
                  : selectedContent
              }
              placeholder="Text here."
              sx={{
                fontSize: '10px',
                backgroundColor: 'inherit',
                borderRadius: '12px',
                minHeight: '300px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  paddingBottom: '70px',
                  fontSize: '17px',
                  minHeight: '300px',
                  color: theme.palette.text.secondary,
                  overflow: 'auto',
                },
              }}
            />

            {/* Attach File Button - Bottom Left */}
            <Button
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
            </Button>

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
              }}
            >
              Invia
            </Button>
          </Box>
        </Box>
      </Box>
    </Layout>
  )
}

export default Earnings
