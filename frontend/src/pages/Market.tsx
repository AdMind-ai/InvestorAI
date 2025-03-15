import React from 'react'
import { Box, Typography, Divider, Button, TextField } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Layout from '../layouts/Layout'

// Importação dos ícones

const Market: React.FC = () => {
  const theme = useTheme()

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'center',
          padding: 'calc(3vh)',
          overflow: 'auto',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Title */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.2vw',
          }}
        >
          <Typography variant="h2" sx={{ marginLeft: '1vw' }}>
            Market Intelligence
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              marginRight: '1vw',
              color: theme.palette.text.secondary,
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.secondary.light,
              },
            }}
            onClick={() => console.log('Click!')}
          >
            Cronologia
          </Typography>
        </Box>
        <Divider />

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            // backgroundColor: 'red',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            Scrivi qui fino a tre nomi di persona, business o notizia e scopri
            le percezioni online
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '100%',
              maxWidth: '75vw',
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Inserisci la prima parola da cercare"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '50px',
                  borderRadius: '12px',
                  fontSize: '17px',
                },
              }}
            />
            <TextField
              variant="outlined"
              placeholder="Inserisci la seconda parola da cercare"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '50px',
                  borderRadius: '12px',
                  fontSize: '17px',
                },
              }}
            />
            <TextField
              variant="outlined"
              placeholder="Inserisci la terza parola da cercare"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '50px',
                  borderRadius: '12px',
                  fontSize: '17px',
                },
              }}
            />
          </Box>

          <Button
            variant="contained"
            disabled
            sx={{
              marginTop: '16px',
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.secondary,
              textTransform: 'none',
            }}
          >
            Invia
          </Button>
        </Box>
      </Box>
    </Layout>
  )
}

export default Market
