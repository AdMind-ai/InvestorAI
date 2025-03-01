import React, { useState } from 'react'
import { Box, List, ListItem, ListItemIcon, Divider } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'

// Importação dos ícones
import HomeIcon from '../assets/icons/home-icon.svg'
import HomeIconActive from '../assets/icons/home-icon-active.svg'
import ChatIcon from '../assets/icons/chat-icon.svg'
import ChatIconActive from '../assets/icons/chat-icon-active.svg'
import CEOIcon from '../assets/icons/ceo-icon.svg'
import CEOIconActive from '../assets/icons/ceo-icon-active.svg'
import MarketIcon from '../assets/icons/market-icon.svg'
import MarketIconActive from '../assets/icons/market-icon-active.svg'
import EarningsIcon from '../assets/icons/earnings-icon.svg'
import EarningsIconActive from '../assets/icons/earnings-icon-active.svg'
import FinanceIcon from '../assets/icons/finance-icon.svg'
import SecurityIcon from '../assets/icons/security-icon.svg'

// Menu com links e ícones
const menuItems = [
  { title: 'Home', path: '/', icon: HomeIcon, activeIcon: HomeIconActive },
  {
    title: 'Chat',
    path: '/chat-assistant',
    icon: ChatIcon,
    activeIcon: ChatIconActive,
  },
  {
    title: 'CEO Perception',
    path: '/ceo-perception',
    icon: CEOIcon,
    activeIcon: CEOIconActive,
  },
  {
    title: 'Market',
    path: '/market-intelligence',
    icon: MarketIcon,
    activeIcon: MarketIconActive,
  },
  {
    title: 'Earnings',
    path: '/earnings',
    icon: EarningsIcon,
    activeIcon: EarningsIconActive,
  },
]

const admItems = [
  { title: 'Finance', path: '/', icon: FinanceIcon, activeIcon: FinanceIcon },
  { title: 'Adm', path: '/', icon: SecurityIcon, activeIcon: SecurityIcon },
]

const Sidebar: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [activePath, setActivePath] = useState(location.pathname)

  const handleNavigation = (path: string) => {
    setActivePath(path)
    navigate(path)
  }

  return (
    <Box
      sx={{
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        width: 'calc(7vw)',
        minWidth: '20px',
        maxWidth: '400px',
        color: theme.palette.text.primary,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'calc(6vw)',
          minWidth: '20px',
          maxWidth: '400px',
          textAlign: 'center',
          height: 'calc(8.5vh)',
          borderBottom: `calc(0.1vh) solid ${theme.palette.background.paper}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Logo Icon */}
        <Box
          sx={{
            fontSize: 'clamp(10px, 4vw, 250px)',
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          ʌ
        </Box>
      </Box>

      {/* Menu Functions */}
      <Box
        sx={{
          marginTop: 'calc(11vh)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <List
          sx={{
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'calc(0.5vw)',
          }}
        >
          {menuItems.map((item) => {
            const isActive = activePath === item.path
            return (
              <ListItem
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  padding: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 'calc(4vw)',
                  height: 'calc(4vw)',
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? theme.palette.text.primary
                    : 'transparent',
                  borderRadius: 'calc(0.5vw)',
                  '&:hover': {
                    backgroundColor: isActive ? 'black' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 'calc(0.5vw)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 'calc(4vw)',
                    minWidth: '10px',
                    maxWidth: '400px',
                  }}
                >
                  <img
                    src={isActive ? item.activeIcon : item.icon}
                    alt={`${item.title} Icon`}
                    style={{
                      width: 'calc(2vw)',
                      height: 'calc(2vw)',
                    }}
                  />
                </ListItemIcon>
              </ListItem>
            )
          })}
        </List>
      </Box>

      {/* Adm */}
      <Box
        sx={{
          marginBottom: 'calc(5vh)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Divider sx={{ width: 'calc(70%)' }} />
        <List
          sx={{
            marginTop: 'calc(0.5vw)',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'calc(0.5vw)',
          }}
        >
          {admItems.map((item) => {
            const isActive = false
            return (
              <ListItem
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  padding: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 'calc(4vw)',
                  height: 'calc(4vw)',
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? theme.palette.text.primary
                    : 'transparent',
                  borderRadius: 'calc(0.5vw)',
                  '&:hover': {
                    backgroundColor: isActive ? 'black' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 'calc(0.5vw)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 'calc(4vw)',
                    minWidth: '10px',
                    maxWidth: '400px',
                  }}
                >
                  <img
                    src={isActive ? item.activeIcon : item.icon}
                    alt={`${item.title} Icon`}
                    style={{
                      width: 'calc(2vw)',
                      height: 'calc(2vw)',
                    }}
                  />
                </ListItemIcon>
              </ListItem>
            )
          })}
        </List>
      </Box>
    </Box>
  )
}

export default Sidebar
