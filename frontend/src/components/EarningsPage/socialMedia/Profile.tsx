import { Box, Button, Paper, Typography, Divider, CircularProgress } from '@mui/material'
import SocialMediaBackground from '../../../assets/backgrounds/linkedin-background.svg'
// import SocialMediaLogo from '../../../assets/icons/social-media-logo.svg'
// import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import AyrshareInterface from '../../../interfaces/ayrshareInterface'
import { useEffect, useState } from 'react'

const Profile =  ({states}: {states: AyrshareInterface}) => {

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (states.profile.value === null) {
        states.profile.set();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnectClick = () => {
    window.open(states.profileUrl.value, '_blank')
  }
  useEffect(() => {
    if (states.social.value?.filter(item=>item==='linkedin').length<=0 && attempt === 0) {
        setTimeout(()=>{setAttempt(attempt+1)}, 5000)
    }
  }, [states.social.value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(()=>{
    if (attempt > 0){
        checkSocials()
    }
},[attempt]) // eslint-disable-line react-hooks/exhaustive-deps

const checkSocials = () => {
  if (states.social.value?.filter(item=>item==='linkedin').length<=0) {
      states.profileUrl.set()
      setTimeout(()=>{setAttempt(attempt+1)}, 2500)
  }
  else {
      setAttempt(0)
  }
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
        src={SocialMediaBackground}
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
          Connetti il tuo canale social
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
          {/* <Box
            component="img"
            src={SocialMediaLogo}
            alt="Linkedin"
            sx={{ width: '80px', height: '90px' }}
          /> */}
          <HubOutlinedIcon 
            sx={{ width: '100px', height: '100px', color: '#103ab1' }} 
            titleAccess="Social Media" 
          />          
          {
            states.profile.value === null ?
            <CircularProgress /> : <></>
          }
          {
            !states.submit.value && states.profile.value !== null ?
            <Button 
              variant="contained"
              disabled={states.social.value?.filter(item=>item==='linkedin').length>0}
              onClick={handleConnectClick}
              sx={{
                width: '100px',
                backgroundColor: states.social.value?.filter(item=>item==='linkedin').length>0?'#1AD598': '#0274b3',
              }}
              >
              {states.social.value?.filter(item=>item==='linkedin').length>0?'Collegato':'Connetti'}
            </Button>
            :<></>
          }
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

export default Profile