import React, { useEffect, useState } from 'react'
import { Box, Typography, Modal, IconButton } from '@mui/material'
import Layout from '../layouts/Layout'
import HomeCard from '../components/HomeCard'
import CloseIcon from '@mui/icons-material/Close'

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
      'Analizza mercato e competitors con insight aggiornati.',
    icon: MarketIcon,
    path: '/market-intelligence',
    tool: 'intelligence'
  },
  {
    title: 'CEO perception',
    description:
      'Monitora la percezione online di CEO e top management.',
    icon: CEOIcon,
    path: '/ceo-perception',
    tool: 'intelligence'
  },
  {
    title: 'ESG Monitoring',
    description:
      'Notizie ESG selezionate e organizzate per categoria.',
    icon: ESGIcon,
    path: '/esg',
    tool: 'intelligence'
  },
  {
    title: 'Chat Assistant',
    description:
      'Assistente privato per risposte rapide e sicure (anche per informazioni price sensitive).',
    icon: ChatIcon,
    path: '/chat-assistant',
    tool: 'operativi'
  },
  {
    title: 'Earnings Call',
    description:
      'Traduci, trascrivi, crea post e speech in pochi clic.',
    icon: EarningsIcon,
    path: '/earnings',
    tool: 'operativi'
  }
]

const Home: React.FC = () => {
  const [openModal, setOpenModal] = useState(false)

  useEffect(() => {
    // Abre a modal sempre que o componente montar
    setOpenModal(true)
  }, [])

  const modalText = `“Investor AI” è un tool pensato per “democratizzare” il potenziamento delle attività di Investor Relations, rendendo accessibili anche alle PMI le possibilità dell’Artificial Intelligence nello svolgimento di attività che altrimenti richiederebbero team interni dedicati e risorse ingenti.

  “Investor AI” propone:

  3 tool di intelligence per restare sempre aggiornati su 3 leve di difesa del valore aziendale:
  il posizionamento competitivo, mediante monitoraggio continuo dell’evoluzione del mercato di riferimento e delle azioni poste in campo dai principali competitor (Market Intelligence); 
  la difesa del capitale umano mediante il monitoraggio della reputazione della squadra manageriale (CEO Perception); 
  l’implementazione di strategie di sostenibilità e la relativa rendicontazione e comunicazione (ESG Monitoring). 

  2 tool operativi per comunicare come una grande azienda: 
  un ambiente protetto in cui interrogare rapidamente documenti e report, ottenere risposte precise e preparare materiali pronti all’uso, anche su informazioni price sensitive non ancora rese note al mercato (Chat Assistant); 
  strumenti per realizzare documenti e speech in molteplici lingue ampliando il target di potenziali investitori a livello internazionale (Earnings Call). 
  
  In sintesi, i tool di intelligence vi danno la conoscenza strategica, i tool operativi vi permettono di trasformarla in comunicazione efficace. 
  “Investor AI” non è solo un software: è il vostro alleato per crescere, competere e fare la differenza nel mercato dei capitali. È il ponte tra la vostra ambizione e le possibilità che il mercato può offrirvi.`

  return (
    <Layout>
      {/* Modal que abre ao iniciar o componente */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="home-modal-title"
        aria-describedby="home-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          <IconButton
            aria-label="close"
            onClick={() => setOpenModal(false)}
            sx={{ position: 'absolute', right: 0, top: 0 }}
            size="small"
          >
            <CloseIcon />
          </IconButton>

          <Typography
            id="home-modal-description"
            variant="body1"
            sx={{
              fontSize: '16px',
              px: 3,
              height: '20vw',
              overflowY: 'auto',
              whiteSpace: 'pre-line',
            }}
          >
            {modalText}
          </Typography>
        </Box>
      </Modal>
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
