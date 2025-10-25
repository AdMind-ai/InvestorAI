import React from 'react';
import { Box, Typography } from '@mui/material'
import '../styles/markdown.css';
import Layout from '../layouts/Layout'

import { MarketProvider } from "../context/MarketContext";
import MarketInsightReport from '../components/MarketPage/MarketInsightReport'
import MarketCompetitorsNews from '../components/MarketPage/MarketCompetitorsNews'
import MarketSectorNews from '../components/MarketPage/MarketSectorNews'
import MarketCompetitors from '../components/MarketPage/MarketCompetitors'
import MarketOverviewReport from '../components/MarketPage/MarketOverviewReport'


const Market: React.FC = () => {
  const messageOfDescription = "Market Intelligence raccoglie le notizie più rilevanti del settore e dei competitor e propone report sintetici con indicatori chiave. Una guida efficace per individuare trend emergenti, opportunità e rischi e prendere decisioni strategiche tempestive."

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
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="h2" sx={{ marginBottom: '0.2vw', marginLeft: '1vw' }}>
              Market Intelligence
            </Typography>
          </Box>

        </Box>

        <Typography variant='subtitle1' sx={{ px: 4.8, fontSize: '14px' }}>
          {messageOfDescription}
        </Typography>

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'top',
            height: '100%',
            width: '100%',
          }}
        >
          <MarketProvider>
            {/* Dashboards */}
            <Box sx={{ padding: '3vh', width: '100%', display: 'flex', flexDirection: 'column', gap: '3vh' }}>
              {/* Center Line */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                  <MarketSectorNews />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: '3vh' }}>
                {/* Left Column */}
                <Box sx={{ display: 'flex', flex: 1.5, flexDirection: 'column', gap: '3vh', height: '100%' }}>
                  <MarketCompetitorsNews />
                  {/* <MarketStockOverview /> */}
                </Box>

                {/* Right Column */}
                <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '3vh' }}>
                  <MarketCompetitors />
                </Box>
              </Box>

              {/* Center Line */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>

                  <MarketInsightReport />
                  <MarketOverviewReport />
                </Box>
              </Box>

            </Box>
          </MarketProvider>

        </Box>
      </Box>
    </Layout>
  )
}

export default Market
