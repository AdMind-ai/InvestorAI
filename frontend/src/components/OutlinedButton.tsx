import React from 'react'
import { Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { SvgIconProps } from '@mui/material/SvgIcon'

interface OutlinedButtonProps {
  icon?: React.ReactElement<SvgIconProps>
  title: string
  color: number
}

const iconColors = ['#5072CC', '#EAB400', '#FF1A72']

const OutlinedButton: React.FC<OutlinedButtonProps> = ({
  icon,
  title,
  color,
}) => {
  const theme = useTheme()

  const colorIndex = color
  const iconColor = iconColors[colorIndex - 1]

  const styledIcon = icon
    ? React.cloneElement(icon, { sx: { color: iconColor, fontSize: '1.5rem' } }) // Ajusta tamanho do ícone
    : null

  return (
    <Button
      variant="outlined"
      startIcon={styledIcon}
      sx={{
        color: 'black',
        fontSize: '17px',
        fontWeight: '400',
        borderRadius: '8px',
        border: `2px solid ${theme.palette.grey[300]}`,
        textTransform: 'none',
        display: 'flex',
        alignItems: 'center',
        paddingX: '12px', 
        paddingY: '8px',  
        gap: 0, 
        whiteSpace: 'nowrap',
        width: 'auto',
        height: '6vh',
        '&:hover': {
          backgroundColor: '#f3f4f6',
          borderColor: '#9ca3af',
        },
      }}
    >
      {title}
    </Button>
  )
}

export default OutlinedButton
