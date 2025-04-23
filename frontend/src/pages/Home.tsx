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
  },
  {
    title: 'Earnings Call',
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
  {
    title: 'ESG Monitoring',
    description:
      'Offre una selezione delle notizie più rilevanti in ambito ESG, organizzate in diverse categorie, per garantire aggiornamenti costantei e puntuali.',
    icon: ESGIcon,
    path: '/esg',
  },
]

const Home: React.FC = () => {
  return (
    <Layout>
      <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
        height: '100%',
        width: '100%',
      }}
      >
        <Typography variant="h3" sx={{textAlign: 'center', padding:'0px 0px', paddingTop:'4vh'}}>
          Cosa vuoi fare oggi?
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: 'calc(2.5vh) calc(3vh) calc(4vh) calc(3vh)',
            // overflow: 'auto',
            height: '84%',
            width: '100%',
            // backgroundColor: 'blue',
            gap:0.5,
          }}
          >
          {cards.map((card, index) => (
            <Box key={index} sx={{padding:'15px 15px'}}>
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
    </Layout>
  )
}

export default Home
