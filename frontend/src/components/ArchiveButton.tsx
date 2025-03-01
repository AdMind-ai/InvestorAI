import React from 'react'
import { Button, Box, Typography } from '@mui/material'
import ArchiveIcon from '../assets/icons/archive-icon.svg'
import { useTheme } from '@mui/material/styles'

interface ArchiveButtonProps {
  label: string
}

const ArchiveButton: React.FC<ArchiveButtonProps> = ({ label }) => {
  const theme = useTheme()
  return (
    <Button
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `calc(0.1vh) solid ${theme.palette.text.secondary}`,
        borderRadius: 'calc(0.5vw)',
        padding: 0,
        textTransform: 'none',
        width: 'calc(7.2vw)',
        height: 'calc(4.9vh)',
        minWidth: '10px',
        maxWidth: '450px',
        color: theme.palette.text.secondary,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderColor: theme.palette.text.secondary,
        },
      }}
    >
      {/* Ícone */}
      <Box
        component="img"
        src={ArchiveIcon}
        alt="Archive Icon"
        sx={{
          width: 'clamp(1px, 1.2vw, 90px)',
          height: 'clamp(1px, 1.2vw, 90px)',
          marginRight: 'calc(0.5vw)',
        }}
      />
      {/* Texto do botão */}
      <Typography
        variant="button"
        sx={{
          fontSize: 'clamp(2px, 1.1vw, 70px)',
          fontWeight: 400,
          color: theme.palette.text.secondary,
        }}
      >
        {label}
      </Typography>
    </Button>
  )
}

export default ArchiveButton
