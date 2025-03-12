import React from 'react'
import { Box } from '@mui/material'
import Layout from '../layouts/Layout'
import HomeCard from '../components/HomeCard'

// Importação dos ícones
import ChatIcon from '../assets/icons/chat-icon.svg'
import CEOIcon from '../assets/icons/ceo-icon.svg'
import MarketIcon from '../assets/icons/market-icon.svg'
import EarningsIcon from '../assets/icons/earnings-icon.svg'

const cards = [
  {
    title: 'Market Intelligence',
    description:
    'Conduce ricerche e analisi sul mercato di riferimento dei principali competitors e sui peers quotati sui capital markets internazionali.',
    icon: MarketIcon,
    path: '/market-intelligence',
  },
  {
    title: 'Earnings',
    description:
    'Traduce in molteplici lingue investor presentation, trascrive webcast, prepara investor speech e crea contenuti social rapidamente grazie all’AI.',
    icon: EarningsIcon,
    path: '/earnings',
  },
  {
    title: 'CEO perception',
    description:
    'Monitora e analizza la percezione online del CEO e dei key manager aziendali attraverso la potenza dell’AI.',
    icon: CEOIcon,
    path: '/ceo-perception',
  },
  {
    title: 'Chat Assistant',
    description:
      'Assistente virtuale rapido, sicuro e totalmente privato per ottenere risposte immediatamente anche su informazioni price sensitive non ancora pubbliche.',
    icon: ChatIcon,
    path: '/chat-assistant',
  },
]

const Home: React.FC = () => {
  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: 'calc(5vh) calc(3vh) calc(5vh) calc(3vh)',
          overflow: 'auto',
          height: '100%',
          width: '100%',
          gap:1,
        }}
      >
        {cards.map((card, index) => (
          <Box key={index} sx={{padding:'10px 10px'}}>
            <HomeCard
              title={card.title}
              description={card.description}
              icon={card.icon}
              path={card.path}
            />
          </Box>
        ))}
      </Box>
    </Layout>
  )
}

export default Home
