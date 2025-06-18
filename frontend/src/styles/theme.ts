import { createTheme, Theme } from '@mui/material/styles'

const theme: Theme = createTheme({
  typography: {
    fontFamily: 'Helvetica, Roboto, Arial, sans-serif',
    h1: {
      fontSize: '28px',
      fontWeight: 700, // Bold
    },
    h2: {
      fontSize: '26px',
      fontWeight: 700, // Bold
    },
    h3: {
      fontSize: '24px',
      fontWeight: 700, // Regular
    },
    h4: {
      fontSize: '18px',
      fontWeight: 700, // Regular
    },
    body1: {
      fontSize: '22px',
      fontWeight: 400, // Regular
    },
    body2: {
      fontSize: '18.9px',
      fontWeight: 400, // Regular
      lineHeight: '1',
    },
    subtitle1: {
      fontSize: '13px',
      fontWeight: 400, // Regular
      lineHeight: '1.3',
    },
    subtitle2: {
      fontSize: '16px',
      fontWeight: 400, // Regular
      lineHeight: '1',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400, // Regular
    },
    button: {
      fontWeight: 700,
      fontSize: '16px',
      padding: 0,
      letterSpacing: '0%',
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: '#ED6008', //orange
      light: '#FCE8DA',
      contrastText: '#FFFFFF', //white
    },
    secondary: {
      main: '#5072CC', //blue
      light: '#CED7EC',
      contrastText: '#FFFFFF', //white
    },
    background: {
      default: '#FFFFFF', //white
      paper: '#F5F5F5', //light grey
    },
    text: {
      primary: '#292929', //black
      secondary: '#707070', //dark grey
    },
    action: {
      disabled: '#E4E4E4',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '16px',
          width: '170px',
          height: '36px',
          borderRadius: '8px',
          fontWeight: 700,
          '&.Mui-disabled': {
            backgroundColor: '#E4E4E4',
            color: '#707070',
            fontWeight: 400,
          },
        },
        contained: {
          backgroundColor: '#5072CC', // Primary
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0C338C',
          },
        },
        containedSecondary: { 
          backgroundColor: '#ED6008',  // Secondary
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#C64D06', 
          },
        },
      },
    },    
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          borderRadius: '12px',
          border: '1px solid #E4E4E4',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.29)',
          padding: '16px 22px 18px 22px',
          display: 'flex',
          height: '220px',
          margin: 0,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*::-webkit-scrollbar': {
          width: '0.45vw',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#707070',
          borderRadius: '10px',
          cursor: 'pointer',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: '#E4E4E4',
          borderRadius: '10px',
          cursor: 'pointer',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          fontSize: '0.8rem',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          borderRadius: '8px',
          backgroundColor: '#fff',
          borderColor: '#E1E8F0',
        },
        notchedOutline: {
          borderColor: '#E1E8F0',
          borderRadius: '8px',
        },
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
        },
      }
    },
  },
})

export default theme
