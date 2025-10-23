import React, { useState } from 'react'
import {
  Box,
  Divider,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import Layout from '../layouts/Layout'
import { useTheme } from '@mui/material/styles'
import SocialMediaBackground from '../assets/backgrounds/linkedin-background.svg'

import Traduttore from '../components/EarningsPage/Traduttore'
import CreaSpeech from '../components/EarningsPage/CreaSpeech'
import Trascrizione from '../components/EarningsPage/TrascrizioneAudio'
import InfoTooltipIcon from '../components/InfoTooltipIcon'
import LinkedinPost from '../components/EarningsPage/newSocialMedia/LinkedinPost'
import { LinkedinPostProvider, useLinkedinPost } from '../context/LinkedinPostContext'

const EarningsContent: React.FC = () => {
  const theme = useTheme();
  const [selectedOption, setSelectedOption] = useState<string>('Traduttore');
  const { flowType, setFlowToPlan } = useLinkedinPost();

  const Options = [
    { title: 'Traduttore', content: '...' },
    { title: 'Crea speech', content: '...' },
    { title: 'Trascrizione audio', content: '...' },
    { title: 'Post LinkedIn', content: '' },
  ];

  const messageTooltipTitle = "Traduce in più lingue presentazioni e testi...";

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
          backgroundImage:
            selectedOption === 'Post LinkedIn' && flowType !== 'plan'
              ? `url(${SocialMediaBackground})`
              : 'none',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right',
          backgroundSize:
            selectedOption === 'Post LinkedIn' ? 'contain' : 'none',
          backgroundAttachment: 'fixed',
          backgroundColor:
            selectedOption === 'Post LinkedIn' ? '#fff' : 'transparent',
          transition: 'background 0.5s ease',
        }}
      >
        {/* Título */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.2vw',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="h2" sx={{ marginBottom: '0.2vw', marginLeft: '1vw' }}>
              Earnings Call
            </Typography>
            <InfoTooltipIcon message={messageTooltipTitle} size={18} color="gray" />
          </Box>
        </Box>

        <Divider />

        {/* Conteúdo principal */}
        <Box sx={{ display: 'flex', flexDirection: 'column', paddingTop: '1.5vw' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={selectedOption}
              exclusive
              onChange={(_, newValue) => newValue && setSelectedOption(newValue)}
              sx={{ display: 'flex', gap: 2, borderRadius: '12px', width: '98%' }}
            >
              {Options.map((option) => (
                <ToggleButton
                  key={option.title}
                  value={option.title}
                  sx={{
                    borderRadius: '10px !important',
                    padding: '8px 16px',
                    fontWeight:
                      selectedOption === option.title ? 'bold' : 'regular',
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

          {selectedOption === 'Traduttore' && <Traduttore />}
          {selectedOption === 'Crea speech' && <CreaSpeech />}
          {selectedOption === 'Trascrizione audio' && <Trascrizione />}
          {selectedOption === 'Post LinkedIn' && <LinkedinPost />}
        </Box>
      </Box>
    </Layout>
  );
};

const Earnings: React.FC = () => (
  <LinkedinPostProvider>
    <EarningsContent />
  </LinkedinPostProvider>
);

export default Earnings;
