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
import MarketingIcon from '../assets/icons/marketing-icon.svg'
import MarketingIconActive from '../assets/icons/marketing-icon-active.svg'
import EarningsIcon from '../assets/icons/earnings-icon.svg'
import EarningsIconActive from '../assets/icons/earnings-icon-active.svg'
import FinanceIcon from '../assets/icons/finance-icon.svg'
import SecurityIcon from '../assets/icons/security-icon.svg'

// Menu com links e ícones
const menuItems = [
  { title: 'Home', path: '/', icon: HomeIcon, activeIcon: HomeIconActive },
  { title: 'Chat', path: '/chat', icon: ChatIcon, activeIcon: ChatIconActive },
  {
    title: 'CEO Perception',
    path: '/ceo',
    icon: CEOIcon,
    activeIcon: CEOIconActive,
  },
  {
    title: 'Marketing',
    path: '/marketing',
    icon: MarketingIcon,
    activeIcon: MarketingIconActive,
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Box
          sx={{
            width: '100px',
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
          }}
        >
          {/* Logo ou Cabeçalho */}
          <Box
            sx={{
              textAlign: 'center',
              height: '70px',
              borderBottom: `1px solid ${theme.palette.background.paper}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                fontSize: '60px',
                fontWeight: 700,
                color: theme.palette.primary.main,
              }}
            >
              ʌ
            </Box>
          </Box>
        </Box>

        {/* Lista de menus */}
        <Box sx={{ marginTop: 2 }}>
          <List
            sx={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {menuItems.map((item) => {
              const isActive = activePath === item.path
              return (
                <ListItem
                  key={item.title}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '70px',
                    height: '70px',
                    cursor: 'pointer',
                    backgroundColor: isActive
                      ? theme.palette.text.primary
                      : 'transparent',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: isActive
                        ? 'black'
                        : 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <img
                      src={isActive ? item.activeIcon : item.icon}
                      alt={`${item.title} Icon`}
                      style={{ width: '35px', height: '35px' }}
                    />
                  </ListItemIcon>
                </ListItem>
              )
            })}
          </List>
        </Box>
      </Box>

      {/* Adm */}
      <Box
        sx={{
          marginBottom: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Divider sx={{ width: 'calc(70%)' }} />
        <List
          sx={{
            marginTop: 1,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {admItems.map((item) => {
            const isActive = false
            return (
              <ListItem
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '70px',
                  height: '70px',
                  cursor: 'pointer',
                  backgroundColor: isActive
                    ? theme.palette.text.primary
                    : 'transparent',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: isActive ? 'black' : 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <img
                    src={isActive ? item.activeIcon : item.icon}
                    alt={`${item.title} Icon`}
                    style={{ width: '35px', height: '35px' }}
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
