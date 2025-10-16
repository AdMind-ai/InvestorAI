import { Box, Button, Paper, Typography, Divider } from '@mui/material'
import LogoLinkedin from '../../../assets/logos/svg/logo-linkedin.svg'
// import HubOutlinedIcon from '@mui/icons-material/HubOutlined';

// Componente visual somente: mantém layout mas sem ação ou dependências externas
const ProfileLogin = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '2.1vw',
      }}
    >

      {/* Card centralizado do Linkedin (somente layout) */}
      <Paper
        elevation={3}
        sx={{
          zIndex: 2,
          width: 420,
          borderRadius: '12px',
          border: '1px solid #E4E4E4',
          p: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
          backgroundColor: 'white',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: '600', mb: '20px' }}>
          Connetti il tuo canale LinkedIn
        </Typography>

        <Paper variant='outlined' sx={{
          mb: '20px',
          padding: '30px 35px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #1976d2',
          backgroundColor: '#ffffff',
          gap: '25px',
          boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
        }}>
          {/* <HubOutlinedIcon 
            sx={{ width: '100px', height: '100px', color: '#9BAFE6' }} 
            titleAccess="Social Media" 
          />           */}

          {/* Logo linkedin */}
          <img src={LogoLinkedin} alt="LogoLinkedin"  />


          {/* Mostrar indicador visual estático (sem lógica externa) */}
          {/* <CircularProgress size={36} /> */}

          {/* Botão estático desabilitado para indicar que não há ação */}
          <Button
            variant="contained"
            sx={{
              width: '100px',
              backgroundColor: '#1AD598',
            }}
          >
            Connesso
          </Button>
        </Paper>

        <Divider sx={{ width: '105%' }} />

        <Button
          variant="contained"
          color='secondary'
          sx={{
            alignSelf: 'flex-end',
            mt: '15px',
            width: '155px',
          }}
        >
          Procedi
        </Button>
      </Paper>
    </Box>
  )
}

export default ProfileLogin