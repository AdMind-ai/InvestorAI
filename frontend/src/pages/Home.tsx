import React, { useEffect, useState } from 'react'
import { useGlobal } from '../context/GlobalContext'
import { Box, Typography, Modal, IconButton, List, ListItem } from '@mui/material'
import Layout from '../layouts/Layout'
import HomeCard from '../components/HomeCard'
import CloseIcon from '@mui/icons-material/Close'
import ReactMarkdown from 'react-markdown'

// Ícones
import ChatIcon from '../assets/icons-sidebar/chat-icon.svg'
import CEOIcon from '../assets/icons-sidebar/ceo-icon.svg'
import MarketIcon from '../assets/icons-sidebar/market-icon.svg'
import EarningsIcon from '../assets/icons-sidebar/earnings-icon.svg'
import ESGIcon from '../assets/icons-sidebar/esg-icon.svg'
import AvatarIcon from '../assets/icons-sidebar/avatar.svg'

const cards = [
  {
    title: 'Market Intelligence',
    description: 'Analizza mercato, competitor, clienti e fornitori con insight aggiornati.',
    icon: MarketIcon,
    path: '/market-intelligence',
    tool: 'intelligence'
  },
  {
    title: 'CEO Perception',
    description: 'Monitora la percezione online di CEO e top management.',
    icon: CEOIcon,
    path: '/ceo-perception',
    tool: 'intelligence'
  },
  {
    title: 'ESG Monitoring',
    description: 'Notizie ESG selezionate e organizzate per categoria.',
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
    description: 'Traduci, trascrivi, crea post e speech in pochi clic.',
    icon: EarningsIcon,
    path: '/earnings',
    tool: 'operativi'
  },
  {
    title: 'Avatar AI',
    description: 'Il tuo ambasciatore digitale, che parla per te nel mondo.',
    icon: AvatarIcon,
    path: '/avatar',
    tool: 'operativi'
  }
]

const modalText = `
“Investor AI” è un tool pensato per **potenziare le attività di Investor Relations**, rendendo accessibili anche alle PMI le possibilità dell’Artificial Intelligence nello svolgimento di attività che altrimenti richiederebbero team interni dedicati e risorse ingenti. “Investor AI” propone:

**3 tool di intelligence** per restare sempre aggiornati su 3 leve di difesa del valore aziendale:
  - il **posizionamento competitivo**, mediante monitoraggio continuo dell’evoluzione del mercato di riferimento, delle azioni poste in campo dai competitor, dai clienti e dai fornitori (*Market Intelligence*);
  - la **difesa del capitale umano**, mediante il monitoraggio della reputazione della squadra manageriale (*CEO Perception*);
  - l’**implementazione di strategie di sostenibilità** e la relativa rendicontazione e comunicazione (*ESG Monitoring*).

**3 tool operativi** per comunicare come una grande azienda:  
  - un **ambiente protetto** in cui interrogare rapidamente documenti e report, ottenere risposte precise e preparare materiali pronti all’uso, anche su informazioni price sensitive non ancora rese note al mercato (*Chat Assistant*);
  - **strumenti per realizzare documenti e speech** in molteplici lingue ampliando il target di potenziali investitori a livello internazionale (*Earnings Call*).  
  - **il tuo ambasciatore digitale**, che parla per te nel mondo, ti rappresenta fedelmente e apre porte dove la lingua o la distanza sono barriere (*Avatar AI*).

I tool di intelligence forniscono la **conoscenza strategica**, i tool operativi la trasformano in **comunicazione efficace**.

“Investor AI” non è solo un software: è il vostro alleato per crescere, competere e fare la differenza nel mercato dei capitali. È il ponte tra la vostra ambizione e le possibilità che il mercato può offrirvi.
`

const Home: React.FC = () => {
  const [openModal, setOpenModal] = useState(false)
  const { companyInfoAdm } = useGlobal()

  // Allowed companies for Avatar feature (adjust as needed)
  const STATIC_ALLOWED: string[] = ['GREEN OLEO']
  const isAvatarAllowed = companyInfoAdm ? STATIC_ALLOWED.includes(companyInfoAdm.short_name) : false

  // Show the intro modal only once per login session
  useEffect(() => {
    const STORAGE_KEY = 'homeModalShown'
    const alreadyShown = localStorage.getItem(STORAGE_KEY)
    if (alreadyShown !== 'true') {
      setOpenModal(true)
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }, [])

  return (
    <Layout>
      {/* Modal inicial */}
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
            width: { xs: '90%', md: '60%' },
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            overflowY: 'auto',
            border: 'none',
            outline: 'none',
          }}
        >

          <IconButton
            aria-label="close"
            onClick={() => setOpenModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              mt: 3,
            }}
          >
            <ReactMarkdown
              components={{
                p: ({ ...props }) => (
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, fontSize: '17px' }} {...props} />
                ),
                strong: ({ ...props }) => (
                  <Typography component="span" fontWeight="bold" sx={{ fontSize: '17px' }} {...props} />
                ),
                em: ({ ...props }) => (
                  <Typography component="span" fontWeight="bold" color='primary' sx={{ fontSize: '17px' }} {...props} />
                ),
                ul: ({ ...props }) => (
                  <List sx={{ listStyleType: 'disc', pl: 5, fontSize: '17px', mb: 2 }} {...props} />
                ),
                li: ({ ...props }) => (
                  <ListItem
                    sx={{ display: 'list-item', py: 0.3, fontSize: '17px' }}
                    {...props}
                  />
                ),
              }}
            >
              {modalText}
            </ReactMarkdown>
          </Box>
        </Box>
      </Modal>

      {/* Conteúdo principal */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'auto',
          height: '100%',
          width: '100%',
          padding: '2vh 2vw',
          gap: 6,
        }}
      >
        {/* Intelligence Section */}
        <Box sx={{ width: '100%', maxWidth: 1200, mt: 2 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 3 }}>
            Tool di Intelligence
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
              .filter(card => card.tool === 'intelligence')
              .map((card, index) => (
                <Box
                  key={index}
                  sx={{ minWidth: 280, maxWidth: 360, flex: '1 1 300px' }}
                >
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
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 3 }}>
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
              .filter(card => card.tool === 'operativi')
              .filter(card => {
                // hide avatar card if not allowed for this company
                if (card.path === '/avatar' && !isAvatarAllowed) return false
                return true
              })
              .map((card, index) => (
                <Box
                  key={index}
                  sx={{ minWidth: 280, maxWidth: 360, flex: '1 1 300px' }}
                >
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
