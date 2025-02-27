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
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Sidebar />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          component="header"
          sx={{
            height: '70px',
            backgroundColor: 'transparent',
            padding: '0 52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 3,
          }}
        >
          <Box />
          <ArchiveButton label={'Archivio'} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="subtitle1"
              sx={{
                width: '28px',
                height: '28px',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '100%',
                textAlign: 'center',
                color: theme.palette.primary.contrastText,
              }}
            >
              M
            </Typography>
            <Typography variant="subtitle1" sx={{ marginLeft: '8px' }}>
              Mario Rossi
            </Typography>
          </Box>
        </Box>
        <Box
          component="main"
          sx={{
            padding: ' 0px 24px 24px 0px',
            height: '100%',
            overflow: 'auto',
          }}
        >
          <Box
            sx={{
              padding: '24px',
              height: '100%',
              overflow: 'auto',
              backgroundColor: theme.palette.background.default,
              borderRadius: '26px',
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
