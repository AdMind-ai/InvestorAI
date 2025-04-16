import React from 'react';
import { Box, Typography, Divider } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Layout from '../layouts/Layout'
// import { api } from '../api/api'



const Usage: React.FC = () => {
  const theme = useTheme()


  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Title */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.2vw',
            padding: 'calc(3vh) calc(3vh) 0 calc(3vh)',
          }}
        >
          <Typography variant="h2" sx={{ marginLeft: '1vw' }}>
          Utilizzo dei crediti
          </Typography>

        </Box>
        <Divider sx={{mx:'calc(3vh)'}}/>

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'top',
            height: '100%',
            width: '100%',
            overflow: 'auto',
            // backgroundColor: 'red',
          }}
        >
          <Box sx={{ padding: '3vh', width: '100%', display: 'flex', flexDirection: 'column', gap: '3vh' }}>
            <Box sx={{ display: 'flex', gap: '3vh'}}>

              {/* Segunda Fileira*/}
              <Box sx={{ display: 'flex', flex: 1, flexDirection:'column', gap: '3vh' }}>

                {/* Notizie dei competitors */}
                <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="h4" fontWeight="bold" color="#ED6008">
                    Notizie dei competitors
                  </Typography>
                </Box>


              </Box>
            </Box>

          </Box>

        </Box>
      </Box>
    </Layout>
  )
}

export default Usage
