import React, { useState } from 'react'
import { Button, Menu, MenuItem, Box, Typography, ListItemIcon } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CheckIcon from '@mui/icons-material/Check';

interface SimpleDropdownProps {
  title: string
  options: string[]
  selectedValue: string;
  onSelect?: (selectedOption: string) => void
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({ title, options, selectedValue, onSelect }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelect?.(options[index])
    handleClose();
  };

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
          width: 'auto',
        }}
      >
        {selectedValue || title}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            borderRadius: 10,  
            backgroundColor: '#f9f9f9', 
            maxHeight: 300, 
            overflowY: 'auto',
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => handleSelect(index)}
            selected={option === selectedValue}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
              fontWeight: index === selectedIndex ? 'bold' : 'normal',
              fontSize: '14px', 
              borderRadius: 10,  
            }}
          >
            {option === selectedValue && (
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
            )}
            <Typography variant="inherit">{option}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default SimpleDropdown
