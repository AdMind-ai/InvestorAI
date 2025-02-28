import React from 'react'
import { Box, Typography, Divider } from '@mui/material'
import Layout from '../layouts/Layout'

// Importação dos ícones

const Chat: React.FC = () => {

  return (
    <Layout>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            // justifyContent: 'center',
            padding: 'calc(3vh)',
            overflow: 'auto',
            height: '100%',
            width: '100%',
            rowGap: 'calc(3vh)',
            columnGap: 'calc(2vw)',
          }}
        >
          <Typography variant='h2' sx={{ marginLeft:'1vw' }}>Chat Assistant</Typography>
          <Divider sx={{ width: 'calc(70%)' }} />

        </Box>
    </Layout>
  )
}

export default Chat
