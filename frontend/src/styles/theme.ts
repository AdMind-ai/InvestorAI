import { createTheme, Theme } from '@mui/material/styles'

const theme: Theme = createTheme({
  typography: {
    fontFamily: 'Helvetica, Roboto, Arial, sans-serif',
    h1: {
      fontSize: '30px',
      fontWeight: 900, // Bold
    },
    h2: {
      fontSize: '26px',
      fontWeight: 700, // Bold
    },
    h3: {
      fontSize: '24px',
      fontWeight: 400, // Regular
    },
    body1: {
      fontSize: '22px',
      fontWeight: 400, // Regular
    },
    body2: {
      fontSize: '18.9px',
      fontWeight: 400, // Regular
    },
    subtitle1: {
      fontSize: '17px',
      fontWeight: 400, // Regular
    },
    button: {
      fontWeight: 700,
      fontSize: '13px',
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
      paper: '#E4E4E4', //light grey
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
          width: '170px',
          height: '36px',
          borderRadius: '10px',
          '&.Mui-disabled': {
            backgroundColor: '#E4E4E4',
            color: '#707070',
            fontWeight: 400,
          },
        },
        contained: {
          backgroundColor: '#0E39B0',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0C338C',
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
          padding: '16px 24px 22px 24px',
          display: 'flex',
          height: '260px',
          margin: 0,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*::-webkit-scrollbar': {
          width: '5px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#707070',
          borderRadius: '2.5px',
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: '#E4E4E4',
          borderRadius: '2.5px',
        },
      },
    },
  },
})

export default theme
