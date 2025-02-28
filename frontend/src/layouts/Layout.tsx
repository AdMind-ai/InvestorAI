import React from 'react'
import { Box, Typography } from '@mui/material'
import Sidebar from '../components/Sidebar'
import ArchiveButton from '../components/ArchiveButton'
import { useTheme } from '@mui/material/styles'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      <Box sx={{ display: 'flex', flexDirection: 'column', width:'100%', height:'100%' }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            height: 'calc(9.1vh)', 
            width: 'calc(94vw)',
            paddingRight: 'calc(6vh)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'calc(1.5vw)',
          }}
        >
          <ArchiveButton label={'Archivio'} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="subtitle1"
              sx={{
                width: 'calc(4vh)',
                height: 'calc(4vh)',
                fontSize: 'clamp(2px, 1.1vw, 70px)',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '100%',
                textAlign: 'center',
                color: theme.palette.primary.contrastText,
              }}
            >
              M
            </Typography>
            <Typography variant="subtitle1" sx={{ marginLeft: 'calc(0.5vw)', fontSize: 'clamp(2px, 1.2vw, 80px)', }}>
              Mario Rossi
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box
          component="main"
          sx={{
            padding: '0px calc(1.5vw) calc(1.5vw) 0px',
            height: 'calc(95vh)',
            width: 'calc(94vw)',
          }}
        >
          <Box
            sx={{
              height: 'calc(88vh)',
              backgroundColor: theme.palette.background.default,
              borderRadius: 'calc(1.7vw)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
