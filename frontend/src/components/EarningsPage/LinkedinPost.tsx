import { Box, Button, Paper, Typography, Divider } from '@mui/material'
import linkedinBackground from '../../assets/backgrounds/linkedin-background.svg'
import LinkedinLogo from '../../assets/icons/linkedin-logo.png'

const LinkedinPost = () => {

  const handleConnectClick = () => {
    // lógica para conectar seu LinkedIn aqui
    console.log("Conectando ao LinkedIn...");
  }

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
      {/* Fundo SVG */}
      <Box
        component="img"
        src={linkedinBackground}
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          zIndex: 0,
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
        }}
      />

      {/* Card centralizado do Linkedin */}
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
          backgroundColor:'white',
        }}
      >
        <Typography variant="subtitle2" sx={{fontWeight: '600', mb: '20px'}}>
          Connetti il tuo canale Linkedin
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
          gap: '35px',
          boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
        }}>
          <Box
            component="img"
            src={LinkedinLogo}
            alt="Linkedin"
            sx={{ width: '75px', height: 'auto'}}
          />

          <Button 
            variant="contained"
            disabled
            onClick={handleConnectClick}
            sx={{
              width: '100px',
              backgroundColor: '#1AD598',
            }}
            >
            Connetti
          </Button>
        </Paper>

        <Divider sx={{ width: '105%' }} />
        
        <Button 
          variant="contained"
          color='primary'
          disabled
          sx={{
            alignSelf: 'flex-end',
            mt: '15px',
            width: '155px',
          }}
        >
          Salva e Procedi
        </Button>
      </Paper>
    </Box>
  )
}

export default LinkedinPost