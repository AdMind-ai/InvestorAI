import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import Layout from '../layouts/Layout'
import { useNavigate } from 'react-router-dom'

const Error404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >

        {/* SVG Illustration */}
        <Box sx={{ marginTop: 0, marginBottom: 2 }}>
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <circle cx="90" cy="90" r="85" stroke="#1976d2" strokeWidth="6" fill="#e3f2fd"/>
            <path d="M90 40 L110 114 L70 106 Z" fill="#1976d2" opacity="0.6"/>
            <circle cx="90" cy="87" r="8" fill="#fff" stroke="#1976d2" strokeWidth="2"/>
            <text x="90" y="160" textAnchor="middle" fontSize="20" fill="#1976d2" fontWeight="bold">404</text>
          </svg>
        </Box>

        <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700 }}>
          Oops... Pagina non trovata!
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            paddingX: 2,
            marginTop: 2,
            maxWidth: 940,
            color: 'text.secondary',
          }}
        >
          Torna alla <span style={{ fontWeight: 600 }}>home</span> oppure utilizza il menu di navigazione per esplorare altri contenuti.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4, fontWeight: 600 }}
          onClick={() => navigate('/')}
        >
          Torna alla Home
        </Button>

      </Box>
    </Layout>
  )
}

export default Error404