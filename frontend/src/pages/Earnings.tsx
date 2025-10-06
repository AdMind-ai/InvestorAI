import React, { useState } from 'react'
import {
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import Layout from '../layouts/Layout'
import { useTheme } from '@mui/material/styles'
import SaveCleanButtons from '../components/SaveCleanButtons'

import Traduttore from '../components/EarningsPage/Traduttore'
import CreaSpeech from '../components/EarningsPage/CreaSpeech'
import Trascrizione from '../components/EarningsPage/TrascrizioneAudio'
// import SocialMedia from '../components/EarningsPage/socialMedia/SocialMedia'

const Earnings: React.FC = () => {
  const theme = useTheme();
  const [selectedOption, setSelectedOption] = useState<string>('Traduttore');

  const Options = [
    {
      title: 'Traduttore',
      content:
        'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
    },
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
      title: 'Trascrizione audio',
      content:
        'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
    },
    // {
    //   title: 'Social Media',
    //   content:
    //     'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
    // },
  ]

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '3vh ',
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
            Earnings Call
          </Typography>

        </Box>

        <Divider />

        {/* Main Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'top', width: '100%', height: '100%', paddingTop: '1.5vw' }} >
          
          {/* Selection Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={selectedOption}
              exclusive
              onChange={(_, newValue) => newValue && setSelectedOption(newValue)}
              sx={{ display: 'flex', gap: 2, borderRadius: '12px', overflow: 'visible', width: '98%' }}
            >
              {Options.map((option) => (
                <ToggleButton
                  key={option.title}
                  value={option.title}
                  sx={{
                    borderRadius: '10px !important',
                    padding: '8px 16px',
                    fontWeight: selectedOption === option.title ? 'bold' : 'regular',
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
          </Box>
          
          {/* Content */}
          {selectedOption === 'Traduttore' && <Traduttore />}
          {selectedOption === 'Crea speech' && <CreaSpeech/>}
          {selectedOption === 'Trascrizione audio' && <Trascrizione />}
          {/* {selectedOption === 'Social Media' && <SocialMedia />} */}
          
        </Box>
      </Box>
    </Layout>
  );
};

export default Earnings;