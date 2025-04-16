import React, { useState } from 'react'
import { Box, List, ListItem, ListItemIcon, Divider } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'

// Importação dos ícones
import HomeIcon from '../assets/icons-sidebar/home-icon.svg'
import HomeIconActive from '../assets/icons-sidebar/home-icon-active.svg'
import ChatIcon from '../assets/icons-sidebar/chat-icon.svg'
import ChatIconActive from '../assets/icons-sidebar/chat-icon-active.svg'
import CEOIcon from '../assets/icons-sidebar/ceo-icon.svg'
import CEOIconActive from '../assets/icons-sidebar/ceo-icon-active.svg'
import MarketIcon from '../assets/icons-sidebar/market-icon.svg'
import MarketIconActive from '../assets/icons-sidebar/market-icon-active.svg'
import EarningsIcon from '../assets/icons-sidebar/earnings-icon.svg'
import EarningsIconActive from '../assets/icons-sidebar/earnings-icon-active.svg'
import ESGIcon from '../assets/icons-sidebar/esg-icon.svg'
import ESGIconActive from '../assets/icons-sidebar/esg-icon-active.svg'
import FinanceIcon from '../assets/icons-sidebar/usage-icon.svg'
import FinanceIconActive from '../assets/icons-sidebar/usage-icon-active.svg'
import SecurityIcon from '../assets/icons-sidebar/access-icon.svg'
import SecurityIconActive from '../assets/icons-sidebar/access-icon-active.svg'

// Logos
import InvestorLogo from '../assets/logos/svg/NOPAYOFF_LEFT_POSITIVE.svg'

// Menu com links e ícones
const menuItems = [
  { title: 'Home', path: '/', icon: HomeIcon, activeIcon: HomeIconActive },
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
  {
    title: 'CEO Perception',
    path: '/ceo-perception',
    icon: CEOIcon,
    activeIcon: CEOIconActive,
  },
  {
    title: 'Chat',
    path: '/chat-assistant',
    icon: ChatIcon,
    activeIcon: ChatIconActive,
  },
  {
    title: 'ESG',
    path: '/esg',
    icon: ESGIcon,
    activeIcon: ESGIconActive,
  },
]

const admItems = [
  { title: 'Finance', path: '/usage', icon: FinanceIcon, activeIcon: FinanceIconActive },
  { title: 'Adm', path: '/access', icon: SecurityIcon, activeIcon: SecurityIconActive },
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
        maxWidth: '410px',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Logo Icon */}
        <Box
          component="img"
          src={InvestorLogo}
          alt="Investor Logo"
          sx={{
            width: "27vh",
            height: "27vh",
            marginLeft: 'calc(12vw)',
            marginTop: 'calc(2.5vh)',
          }}
        />
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
                  height: 'calc(3.6vw)',
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? theme.palette.primary.main
                    : 'transparent',
                  borderRadius: 'calc(0.5vw)',
                  '&:hover': {
                    backgroundColor: isActive ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 'calc(0.5vw)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 'calc(3vw)',
                    minWidth: '10px',
                    maxWidth: '400px',
                  }}
                >
                  <img
                    src={isActive ? item.activeIcon : item.icon}
                    alt={`${item.title} Icon`}
                    style={{
                      width: 'calc(1.7vw)',
                      height: 'calc(1.7vw)',
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
          marginBottom: 'calc(4vh)',
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
                  height: 'calc(3.6vw)',
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? theme.palette.primary.main
                    : 'transparent',
                  borderRadius: 'calc(0.5vw)',
                  '&:hover': {
                    backgroundColor: isActive ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 'calc(0.5vw)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 'calc(3vw)',
                    minWidth: '10px',
                    maxWidth: '400px',
                  }}
                >
                  <img
                    src={isActive ? item.activeIcon : item.icon}
                    alt={`${item.title} Icon`}
                    style={{
                      width: 'calc(1.7vw)',
                      height: 'calc(1.7vw)',
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
