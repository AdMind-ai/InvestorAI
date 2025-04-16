import React from 'react';
import { Box, Typography, Divider, LinearProgress } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Layout from '../layouts/Layout'
// import { api } from '../api/api'

const cardsTitle = [
  { key: 'earnings', label: 'Earnings Call' },
  { key: 'chat', label: 'Chat Assistant' },
];

const cardsMock = {
  earnings: [
    { title: 'Crea speech', usage: '98%' },
    { title: 'Traduttore di testo', usage: '1%' },
    { title: 'Traduttore di documenti', usage: '84%' },
    { title: 'Trascrizione di audio', usage: '12%' },
    { title: 'Linkedin post', usage: '120/240' },
  ],
  chat: [
    { title: 'GPT-4o mini', usage: '50%' },
    { title: 'GPT-4o', usage: '0%' },
    { title: 'GPT-4.5', usage: '50%' },
    { title: 'o3 mini', usage: '50%' },
    { title: 'SearchWeb', usage: '1/10' },
    { title: 'Overview del titolo', usage: '20/70' },
    { title: 'Allega immagini/documento', usage: '55/60' },
  ],
};

function getUsageValue(usage) {
  if (usage.endsWith('%')) {
    const percent = parseFloat(usage.replace('%', ''));
    return { value: percent, isPercent: true, label: usage };
  } else if (usage.includes('/')) {
    const [current, total] = usage.split('/').map(Number);
    const percent = total ? (current / total) * 100 : 0;
    return { value: percent, isPercent: false, label: usage };
  }
  return { value: 0, isPercent: false, label: usage };
}

const Card = ({ title, usage }) => {
  const { value, label } = getUsageValue(usage);
  return (
    <Box
      sx={{
        width: '255px',
        border: '1px solid #ddd',
        borderRadius: 2,
        padding: 2,
        boxShadow: '0px 3px 10px rgba(0,0,0,0.1)',
        minHeight: '100px',
        mb: 1,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Typography variant="subtitle2" mb={1}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'bottom', gap: 1 }}>
        <Typography
          variant="subtitle2" fontWeight='bold'
          sx={{ color: '#212121', textAlign: 'right' }}
        >
          {label}
        </Typography>
        <Box sx={{ flex: 1, mb:2 }}>
          <LinearProgress
            variant="determinate"
            value={value}
            sx={{
              height: 15,
              borderRadius: 1.3,
              background: '#eee',
              // '& .MuiLinearProgress-bar': { backgroundColor: '#ED6008' },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

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
        {/* Header */}
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
            height: '100%',
            width: '100%',
            overflow: 'auto',
            padding: '5vh',
            // backgroundColor: 'red',
          }}
        >

          {/* Main Content*/}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6vh' }}>
            {/* Loop nos grupos */}
            {cardsTitle.map((group) => (
              <Box key={group.key}>
                <Typography variant="h4" fontWeight="bold" marginLeft={1} marginBottom={1.5}>
                  {group.label}
                </Typography>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                      flexWrap: 'wrap'
                    }}
                  >
                    {(cardsMock[group.key] || []).map((card, idx) => (
                      <Card key={idx} title={card.title} usage={card.usage} />
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

        </Box>
      </Box>
    </Layout>
  )
}

export default Usage
