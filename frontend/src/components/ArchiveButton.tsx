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
        border: `1px solid ${theme.palette.text.secondary}`,
        borderRadius: '8px',
        padding: '8px 16px',
        textTransform: 'none',
        width: '110px',
        height: '34px',
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
          width: '18px',
          height: '18px',
          marginRight: '8px',
        }}
      />
      {/* Texto do botão */}
      <Typography
        variant="button"
        sx={{
          fontSize: '16px',
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
