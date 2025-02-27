import React from 'react'
import { Box } from '@mui/material'
import Layout from '../layouts/Layout'
import HomeCard from '../components/HomeCard'

// Importação dos ícones
import ChatIcon from '../assets/icons/chat-icon.svg'
import CEOIcon from '../assets/icons/ceo-icon.svg'
import MarketingIcon from '../assets/icons/marketing-icon.svg'
import EarningsIcon from '../assets/icons/earnings-icon.svg'

const Home: React.FC = () => {
  const cards = [
    {
      title: 'Chat Assistant',
      description:
        'Chiedi al tuo assistente virtuale: risposte rapide, informazioni precise e supporto costante.',
      icon: ChatIcon,
    },
    {
      title: 'CEO perception',
      description:
        'Analizza e monitora come una persona, un business o una notizia viene percepita online.',
      icon: CEOIcon,
    },
    {
      title: 'Market Intelligence',
      description:
        'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
      icon: MarketingIcon,
    },
    {
      title: 'Earnings',
      description:
        'Lorem ipsum dolor sit amet, consect adipiscing elit, sed do eiusmod tempor incididunt aliqua.',
      icon: EarningsIcon,
    },
  ]

  return (
    <Layout>
      <Box sx={{}}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            rowGap: 3,
            columnGap: 4,
          }}
        >
          {cards.map((card, index) => (
            <Box key={index}>
              <HomeCard
                title={card.title}
                description={card.description}
                icon={card.icon}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Layout>
  )
}

export default Home
