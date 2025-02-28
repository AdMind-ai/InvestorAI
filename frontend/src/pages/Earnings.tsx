import React, { useState } from 'react'
import { Box, Divider, Button, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Layout from '../layouts/Layout'
import { useTheme } from '@mui/material/styles'

// Importação dos ícones

const Earnings: React.FC = () => {
  const theme = useTheme()
  const [selectedOption, setSelectedOption] = useState('speech');

  return (
    <Layout>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: 'calc(3vh)',
            overflow: 'auto',
            height: '100%',
            width: '100%',
          }}
        >
          {/* Title */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom:'0.2vw' }}>
            <Typography variant='h2' sx={{ marginLeft:'1vw' }}>Market Intelligence</Typography>
            <Typography
              variant="subtitle1"
              sx={{
                marginRight: '1vw',
                color: theme.palette.text.secondary,
                textDecoration: 'underline', 
                cursor: 'pointer', 
                '&:hover': {
                  color: theme.palette.secondary.light, 
                }
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
              width: '100%',
              maxWidth: '800px',
              margin: 'auto',
              gap: 2,
            }}
          >
            {/* Botões de seleção */}
            <ToggleButtonGroup
              value={selectedOption}
              exclusive
              onChange={(_, newValue) => newValue && setSelectedOption(newValue)}
              sx={{ display: 'flex', gap: 1 }}
            >
              <ToggleButton value="speech" sx={{ borderRadius: '12px', padding: '8px 16px' }}>
                Crea speech
              </ToggleButton>
              <ToggleButton value="document" sx={{ borderRadius: '12px', padding: '8px 16px' }}>
                Traduci documento
              </ToggleButton>
              <ToggleButton value="transcribe" sx={{ borderRadius: '12px', padding: '8px 16px' }}>
                Trascrivi video o audio
              </ToggleButton>
              <ToggleButton value="linkedin" sx={{ borderRadius: '12px', padding: '8px 16px' }}>
                Crea post per LinkedIn
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Área de texto */}
            <TextField
              variant="outlined"
              fullWidth
              multiline
              minRows={6}
              placeholder="Text here."
              sx={{
                fontSize: '17px',
                backgroundColor: 'theme.palette.background.paper',
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />

            {/* Botão Enviar */}
            <Button
              variant="contained"
              disabled
              sx={{
                alignSelf: 'flex-end',
                borderRadius: '12px',
                padding: '6px 16px',
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

export default Earnings
