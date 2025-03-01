import React from 'react'
import { useTheme } from '@mui/material/styles'
import { Box, Button, Typography, Card } from '@mui/material'
import { useNavigate } from 'react-router-dom'

interface CardProps {
  title: string
  description: string
  icon: string
  path: string
}

const HomeCard: React.FC<CardProps> = ({ title, description, icon, path }) => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <Card
      sx={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        aspectRatio: '2.17 / 1',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Ícone */}
        <Box
          component="img"
          src={icon}
          alt={`${title} Icon`}
          sx={{
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            color: theme.palette.secondary.main,
          }}
        />

        {/* Título */}
        <Typography variant="h2">{title}</Typography>
      </Box>

      {/* Descrição */}
      <Typography variant="body2">{description}</Typography>

      {/* Botão */}
      <Button variant="contained" onClick={() => handleNavigation(path)}>
        VAI ALLA FUNZIONE
      </Button>
    </Card>
  )
}

export default HomeCard
