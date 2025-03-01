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
    title: 'Chat Assistant',
    description:
      'Chiedi al tuo assistente virtuale: risposte rapide, informazioni precise e supporto costante.',
    icon: ChatIcon,
    path: '/chat-assistant',
  },
  {
    title: 'CEO perception',
    description:
      'Analizza e monitora come una persona, un business o una notizia viene percepita online.',
    icon: CEOIcon,
    path: '/ceo-perception',
  },
  {
    title: 'Market Intelligence',
    description:
      'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
    icon: MarketIcon,
    path: '/market-intelligence',
  },
  {
    title: 'Earnings',
    description:
      'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
    icon: EarningsIcon,
    path: '/earnings',
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
          padding: 'calc(5vh) calc(5vh) calc(5vh) calc(5vh)',
          overflow: 'auto',
          height: '100%',
          width: '100%',
          rowGap: 'calc(3vh)',
          columnGap: 'calc(2vw)',
        }}
      >
        {cards.map((card, index) => (
          <Box key={index}>
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
