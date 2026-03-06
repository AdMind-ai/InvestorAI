import React, { useState } from 'react'
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Link,
} from '@mui/material'
import Layout from '../layouts/Layout'
import { useTheme } from '@mui/material/styles'
import SocialMediaBackground from '../assets/backgrounds/linkedin-background.svg'
// feature usage checks are performed inside the individual components

import Traduttore from '../components/EarningsPage/Traduttore'
import CreaSpeech from '../components/EarningsPage/CreaSpeech'
import Trascrizione from '../components/EarningsPage/TrascrizioneAudio'
import LinkedinPost from '../components/EarningsPage/newSocialMedia/LinkedinPost'
import { LinkedinPostProvider, useLinkedinPost } from '../context/LinkedinPostContext'
import { GlossaryButton, GlossaryModal } from '../components/EarningsPage/glossary/glossary-manager'

const EarningsContent: React.FC = () => {
  const theme = useTheme();
  const [selectedOption, setSelectedOption] = useState<string>('Traduttore');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const { flowType, setFlowToPlan } = useLinkedinPost();

  const Options = [
    { title: 'Traduttore', content: '...' },
    { title: 'Crea speech', content: '...' },
    { title: 'Trascrizione audio', content: '...' },
    { title: 'Post LinkedIn', content: '' },
  ];

  const messageOfDescription = "È uno strumento pensato per farvi parlare al mondo, senza barriere linguistiche e in modo coerente e professionale. Traduce in più lingue presentazioni e testi, trascrive audio/webcast, crea investor speech e genera post social per LinkedIn. Carica file o testo, scegli lingua e formato: ottieni contenuti pronti all’uso in pochi clic.";

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
          </Box>
        </Box>

        <Typography variant='subtitle1' sx={{ px: 2, fontSize: '14px' }}>
          {messageOfDescription}
        </Typography>

        {/* Conteúdo principal */}
        <Box sx={{ display: 'flex', flexDirection: 'column', paddingTop: '1.5vw' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '98%', gap: 2 }}>
                <ToggleButtonGroup
                value={selectedOption}
                exclusive
                onChange={(_, newValue) => newValue && setSelectedOption(newValue)}
                sx={{ flex: 1, display: 'flex', gap: 2, borderRadius: '12px' }}
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

              {selectedOption === 'Traduttore' && (
                <GlossaryButton onClick={() => setGlossaryOpen(true)} />
              )}

              {/* Right-aligned link that opens the scheduled posts flow */}
              {selectedOption === 'Post LinkedIn' && flowType !== 'plan' && (
                <Link
                  component="button"
                  onClick={() => {
                    setSelectedOption('Post LinkedIn');
                    setFlowToPlan();
                  }}
                  sx={{ px: 6, fontSize: '14px', textTransform: 'none' }}
                >
                  Post programmati
                </Link>
              )}
            </Box>
          </Box>

          {selectedOption === 'Traduttore' && <Traduttore />}
          {selectedOption === 'Crea speech' && <CreaSpeech />}
          {selectedOption === 'Trascrizione audio' && <Trascrizione />}
          {selectedOption === 'Post LinkedIn' && <LinkedinPost />}
          <GlossaryModal
            open={glossaryOpen}
            onClose={() => setGlossaryOpen(false)}
            scope="company"
          />
          
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
