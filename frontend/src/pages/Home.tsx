import React from 'react'
import { Box, Typography } from '@mui/material'
import Layout from '../layouts/Layout'
import HomeCard from '../components/HomeCard'

// Importação dos ícones
import ChatIcon from '../assets/icons-sidebar/chat-icon.svg'
import CEOIcon from '../assets/icons-sidebar/ceo-icon.svg'
import MarketIcon from '../assets/icons-sidebar/market-icon.svg'
import EarningsIcon from '../assets/icons-sidebar/earnings-icon.svg'
import ESGIcon from '../assets/icons-sidebar/esg-icon.svg'

const cards = [
  {
    title: 'Market Intelligence',
    description:
      'Conduce ricerche e analisi sul mercato di riferimento dei principali competitors e sui peers quotati sui capital markets internazionali.',
    icon: MarketIcon,
    path: '/market-intelligence',
    tool: 'intelligence'
  },
  {
    title: 'CEO perception',
    description:
      'Monitora e analizza la percezione online del CEO e dei key manager aziendali attraverso la potenza dell’AI.',
    icon: CEOIcon,
    path: '/ceo-perception',
    tool: 'intelligence'
  },
  {
    title: 'ESG Monitoring',
    description:
      'Offre una selezione delle notizie più rilevanti in ambito ESG, organizzate in diverse categorie, per garantire aggiornamenti costantei e puntuali.',
    icon: ESGIcon,
    path: '/esg',
    tool: 'intelligence'
  },
  {
    title: 'Chat Assistant',
    description:
      'Assistente virtuale rapido, sicuro e totalmente privato per ottenere risposte immediatamente anche su informazioni price sensitive non ancora pubbliche.',
    icon: ChatIcon,
    path: '/chat-assistant',
    tool: 'operativi'
  },
  {
    title: 'Earnings Call',
    description:
      'Traduce in molteplici lingue investor presentation, trascrive webcast, prepara investor speech e crea contenuti social rapidamente grazie all’AI.',
    icon: EarningsIcon,
    path: '/earnings',
    tool: 'operativi'
  },
]

const Home: React.FC = () => {
  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          overflow: 'auto',
          height: '100%',
          width: '100%',
          padding: '2vh 2vw',
          gap: 6, // espaçamento entre as seções
        }}
      >
        {/* Intelligence Section */}
        <Box sx={{ width: '100%', maxWidth: 1200, mt: 2 }}>
          <Typography
            variant="h3"
            sx={{ textAlign: 'center', mb: 3 }}
          >
            Tool Di Intelligence
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
            }}
          >
            {cards
              .filter(card => card.tool === "intelligence")
              .map((card, index) => (
                <Box key={index} sx={{ minWidth: 280, maxWidth: 360, flex: '1 1 300px' }}>
                  <HomeCard
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                    path={card.path}
                  />
                </Box>
              ))}
          </Box>
        </Box>

        {/* Operativi Section */}
        <Box sx={{ width: '100%', maxWidth: 1200 }}>
          <Typography
            variant="h3"
            sx={{ textAlign: 'center', mb: 3 }}
          >
            Tool Operativi
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
            }}
          >
            {cards
              .filter(card => card.tool === "operativi")
              .map((card, index) => (
                <Box key={index} sx={{ minWidth: 280, maxWidth: 360, flex: '1 1 300px' }}>
                  <HomeCard
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                    path={card.path}
                  />
                </Box>
              ))}
          </Box>
        </Box>
      </Box>
    </Layout>
  )
}

export default Home
