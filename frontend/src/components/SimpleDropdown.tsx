import React, { useState } from 'react'
import { Button, Menu, MenuItem, Box } from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

interface SimpleDropdownProps {
  title: string
  options: string[]
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({ title, options }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={{ padding: 0 }}>
      <Button
        onClick={handleClick}
        endIcon={<ArrowDropDownIcon />}
        sx={{
          textTransform: 'none',
          fontWeight: 'regular',
          color: 'black',
          fontSize: '16px',
          padding: '0px 12px',
          // backgroundColor:'red',
          width: 'auto',
        }}
      >
        {title}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {options.map((option, index) => (
          <MenuItem key={index} onClick={handleClose}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default SimpleDropdown
