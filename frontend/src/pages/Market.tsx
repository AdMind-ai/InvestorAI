import React from 'react'
import { Box, Typography, Divider, Link, Button, LinearProgress, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Layout from '../layouts/Layout'

// Icon Imports
import CardEuroIcon from '../assets/dashboard_icons/card_euro_icon.svg'
import CardArrowsIcon from '../assets/dashboard_icons/card_arrows_icon.svg'
import CardCurveArrowIcon from '../assets/dashboard_icons/card_curvearrow_icon.svg'

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const competitors = [
  { name: "Apple Inc.", logo: "https://logo.clearbit.com/apple.com" },
  { name: "Microsoft Corporation", logo: "https://logo.clearbit.com/microsoft.com" },
  { name: "Google LLC (Alphabet Inc.)", logo: "https://logo.clearbit.com/google.com" },
  { name: "Amazon.com Inc.", logo: "https://logo.clearbit.com/amazon.com" },
  { name: "Samsung Electronics", logo: "https://logo.clearbit.com/samsung.com" },
  { name: "Meta Platforms Inc.", logo: "https://logo.clearbit.com/meta.com" },
  { name: "Intel Corporation", logo: "https://logo.clearbit.com/intel.com" },
  { name: "Tesla Inc.", logo: "https://logo.clearbit.com/tesla.com" },
  { name: "IBM Corporation", logo: "https://logo.clearbit.com/ibm.com" },
  { name: "Dell Technologies", logo: "https://logo.clearbit.com/dell.com" },
  { name: "NVIDIA Corporation", logo: "https://logo.clearbit.com/nvidia.com" },
  { name: "ORACLE Corporation", logo: "https://logo.clearbit.com/oracle.com" },
];

const Market: React.FC = () => {
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
            Market Intelligence
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              marginRight: '1vw',
              color: theme.palette.text.secondary,
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.secondary.light,
              },
            }}
            onClick={() => console.log('Click!')}
          >
            Cronologia
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
          {/* Here goes all the dashboards */}
          <Box sx={{ padding: '3vh', width: '100%', display: 'flex', flexDirection: 'column', gap: '3vh' }}>
            <Box sx={{ display: 'flex', gap: '3vh'}}>
              {/* Primeira Fileira */}
              <Box sx={{ display: 'flex', flex: 1.5, flexDirection:'column', gap: '3vh' }}>

                {/* Overview */}
                <Box sx={{ border: '1px solid #ddd', borderRadius: 3, px: 3, py:2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  {/* Title and select */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="#A700FF">
                      Overview del titolo mensile
                    </Typography>
                    <Box component="select" sx={{ borderRadius: 3, py: 1, px:3, borderColor: '#ccc', color:'grey', cursor:'pointer' }}>
                      <option>Ultimi 12 mesi</option>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Graph */}
                    <Box sx={{ flex:1, height: 250, bgcolor: '#f7f7f7', borderRadius: 3, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src="/image/mock_graph_1.png"
                        alt="Mock Graph 1"
                        style={{ width: '100%', height:'100%' }}
                      />
                    </Box>

                    {/* Cards */}
                    <Box sx={{ display: 'flex', flexDirection:'column', gap: 1, mt: 2, mb:2 }}>
                      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center' }}>
                        <Box
                          component="img"
                          src={CardEuroIcon}
                          alt="Euro Icon"
                          sx={{
                            width: "35px",
                            height: "35px",
                            marginRight: '6px',
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection:'column'}}>
                          <Typography variant="subtitle2"><b>19.455€</b></Typography>
                          <Typography variant="caption">Prezzo attuale</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center' }}>
                        <Box
                          component="img"
                          src={CardArrowsIcon}
                          alt="Euro Icon"
                          sx={{
                            width: "35px",
                            height: "35px",
                            marginRight: '6px',
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection:'column'}}>
                          <Typography variant="subtitle2"><b>+1.5%</b></Typography>
                          <Typography variant="caption">Var. giornaliera</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection:'row', pl:1, pr:2, py:1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)", gap:0.6, alignItems:'center' }}>
                        <Box
                          component="img"
                          src={CardCurveArrowIcon}
                          alt="Euro Icon"
                          sx={{
                            width: "35px",
                            height: "35px",
                            marginRight: '6px',
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection:'column'}}>
                          <Typography variant="subtitle2"><b>Moderata</b></Typography>
                          <Typography variant="caption">Volatilità</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mt: 2, mb:1.5 }}/>

                  {/* Table */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    position: 'relative', 
                  }}>

                    {/* Linha pontilhada vertical */}
                    <Box sx={{ 
                      position: 'absolute', 
                      height: '100%', 
                      left: '50%', 
                      top: 0, 
                      borderLeft: '1px dotted #ccc', 
                    }}/>

                    {/* Linha pontilhada horizontal */}
                    <Box sx={{ 
                      position: 'absolute', 
                      width: '100%', 
                      left: 0, 
                      top: '53%', 
                      borderTop: '1px dotted #ccc', 
                    }}/>

                    <Box sx={{ flex: '1 1 50%', pb: 1, pl:2, mt:1 }}>
                      <Typography variant="subtitle1">Settore: <b>Tecnologia</b></Typography>
                      <Typography variant="subtitle1">Capitalizzazione mercato: <b>$150 miliardi</b></Typography>
                      <Typography variant="subtitle1">Indice PE: <b>25.5</b></Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 50%', pb: 1, pl:2, mt:1 }}>
                      <Typography variant="subtitle1">Eventuali Fattori di Rischio:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">Potenziale rallentamento delle vendite nel mercato europeo.</Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 50%', pt: 1, pl:2, mt:1 }}>
                      <Typography variant="subtitle1">Ultima Notizia Rilevante</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">TechCorp ha lanciato un nuovo smartphone che ha ricevuto recensioni positive.</Typography>
                    </Box>

                    <Box sx={{ flex: '1 1 50%', pt: 1, pl:2, pr:2, mt:1 }}>
                      <Typography variant="subtitle1" sx={{ }}>Previsione a Breve Termine</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">Il titolo è previsto continuare una crescita moderata grazie al successo del nuovo prodotto.</Typography>
                    </Box>

                  </Box>
                  
                  <Typography sx={{mt:3, cursor:'pointer', textDecoration:'underline', fontSize:'1rem', textAlign:'center', color:"#888"}}>Espandi</Typography>
                </Box>

                {/* Insight Report */}
                <Box sx={{ position:'relative', border: '1px solid #ddd', borderRadius: 3, px: 3, py: 2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" color="#5072CC">
                      Insight Report - Performance Aziendale
                    </Typography>
                    <Box component="select" sx={{ borderRadius: 3, py: 1, px:3, borderColor: '#ccc', color:'grey' }}>
                      <option>Q3 2024</option>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{mt:1.5, mb:0.5}}>
                      Highlights Finanziari
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Ricavi Totali: €2,1 miliardi (+12% YoY).
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Crescita del Margine Operativo: EBIT al 19,5% (+2,3 pp rispetto al trimestre precedente).
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Profitto Netto: €310 milioni (+18% YoY), grazie a un forte focus su efficienza operativa e nuova espansione geografica.
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Portafoglio Ordini: Raggiunto un livello record di €4,5 miliardi (+26% YoY).
                    </Typography>

                    <Typography variant="h4" fontWeight="bold" sx={{mt:1.5, mb:0.5}}>
                      Innovazione e Strategia
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Investimento in R&D: €120 milioni nel Q3 (+15% YoY), consolidando la leadership in soluzioni tecnologiche innovative.
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:0.4, ml: 1, lineHeight:1.2}}>
                      • Lanciati 3 nuovi prodotti nel settore AI e IoT (Internet of Things), con particolare attenzione all’automazione industriale.
                    </Typography>
                    <Typography variant="subtitle2" sx={{mb:6, ml: 1, lineHeight:1.2}}>
                      • Espansione del team di ricerca con l’assunzione di 150 nuovi talenti specializzati in intelligenza artificiale e machine learning.
                    </Typography>

                  </Box>

                  <Typography
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: "#888",
                      textDecoration: 'underline',
                    }}
                  >
                    Espandi
                  </Typography>
                </Box>


              </Box>

              {/* Segunda Fileira*/}
              <Box sx={{ display: 'flex', flex: 1, flexDirection:'column', gap: '3vh' }}>

                {/* Notizie dei competitors */}
                <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="h4" fontWeight="bold" color="#ED6008">
                    Notizie dei competitors
                  </Typography>
                  <Box sx={{ my: 2, mb:8 }}>
                    {[
                      'Luigi Farris Nominato CEO dell’Anno: Innovazione e...',
                      'Investimenti Record per Luigi Farris: 10 Miliardi per...',
                      'Green Revolution: Luigi Farris Lancia un Progetto...',
                      'Luigi Farris Nominato CEO dell’Anno: Innovazione e...',
                      'Investimenti Record per Luigi Farris: 10 Miliardi per...',
                      'Green Revolution: Luigi Farris Lancia un Progetto...',
                      'Investimenti Record per Luigi Farris: 10 Miliardi per...',
                      'Green Revolution: Luigi Farris Lancia un Progetto...'
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', py: 1 }}>
                        <Typography variant="subtitle2">{item}</Typography>
                        <Link color="secondary" sx={{ cursor: 'pointer', fontSize:14 }}>
                          Vai all’articolo
                        </Link>
                      </Box>
                    ))}
                  </Box>
                  <Typography
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: "#888",
                      textDecoration: 'underline',
                    }}
                  >
                    Espandi
                  </Typography>
                </Box>

                
                {/* Aziende competitors */}
                <Box sx={{ 
                  position: 'relative', 
                  flex: 1, 
                  border: '1px solid #ddd', 
                  borderRadius: 3, 
                  padding: 3, 
                  boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' 
                }}>
                  <Typography variant="body2" fontWeight="bold" color="#10AF2A">
                    Aziende competitors
                  </Typography>

                  {/* Grid das logos */}
                  <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 2,
                      my: 3,
                      alignItems: 'center',
                      justifyItems: 'center',
                      width: '100%',
                    }}>

                    {competitors.map((company, idx) => (
                      <Box key={company.name} sx={{ width: '100%', height:'100%' }}>
                        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign: 'center', width: '100%', height:'100%', mb:3 }}>
                          <Box component="img" src={company.logo} 
                              sx={{ 
                                  width: '50px', 
                                  height: '50px',
                                  objectFit: 'contain',
                                  marginBottom: '10px', 
                              }} 
                          />
                          <Typography variant="caption" sx={{fontSize:'0.8rem', lineHeight:1.2}}>{company.name}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* linhas pontilhadas horizontais */}
                  <Box sx={{ 
                        position:'absolute', 
                        top:'37%', 
                        left: '5%', 
                        width:'90%',
                        borderTop:'1px dotted #ccc'
                      }} 
                  />
                  <Box sx={{ 
                        position:'absolute', 
                        top:'62%', 
                        left: '5%',
                        width:'90%',
                        borderTop:'1px dotted #ccc'
                      }} 
                  />

                  <Typography
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: "#888",
                      textDecoration: 'underline',
                    }}
                  >
                    Espandi
                  </Typography>
                </Box>

              </Box>
            </Box>

            {/* Terceiro Área - Grafico Andamento */}
            <Box sx={{ border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="body2" fontWeight="bold" color='#A700FF'>Andamento rispetto ai competitors</Typography>
              <Box sx={{height:'460px', borderRadius:2, mt:3, pl:1, pb:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <img 
                  src="/image/mock_graph_2.png"
                  alt="Mock Graph 2"
                  style={{ width: '100%', height:'100%' }}
                />
              </Box>
            </Box>

            {/* Quarta Fileira */}
            <Box sx={{display:'flex', gap: 3}}>

              {/* Crescita del settore */}
              <Box sx={{ flex:1, border:'1px solid #ddd', borderRadius:3, px:3, py:2, boxShadow:'0px 3px 10px rgba(0, 0, 0, 0.1)', position:'relative' }}>

                {/* Cabeçalho com botões de seleção */}
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Typography variant='body2' fontWeight="bold" color='#ED6008'>Crescita del settore</Typography>
                  
                  <Box sx={{display:'flex', alignItems:'center'}}>
                    <Button size="small" variant='outlined' color='primary' sx={{bgcolor:'#FCE8DA', borderRadius:3, mr:1, textTransform:'none', fontSize:'0.9rem', width: '80px', height: '35px'}}>Europa</Button>
                    <Button size="small" variant='outlined' color='primary' sx={{borderRadius:3, mr:2, textTransform:'none', fontSize:'0.9rem', fontWeight:'400', width: '80px', height: '35px'}}>Italia</Button>
                    <Box component="select" sx={{ borderRadius: 3, py: 1, px:3, borderColor: '#ccc', color:'grey', cursor:'pointer' }}>
                      <option>Ultimi 12 mesi</option>
                    </Box>
                  </Box>
                </Box>

                {/* Crescimento anual e mapa */}
                <Box sx={{ display:'flex', gap:3, mt:3, mb:3 }}>
                  <Box sx={{flex:1, bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, display:'flex', flexDirection:'column', boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
                    <Box>
                      <Typography variant="body2">Crescita percentuale annua</Typography>
                      <Typography variant="subtitle1" color='textSecondary' sx={{mt:1, mb:2}}>rispetto all’anno precedente</Typography>
                    </Box>
                    
                    <Box sx={{display:'flex', justifyContent:'center', mb:1}}>
                      <Box sx={{ width:180, height:180, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', mt:1 }}>
                        <svg viewBox="0 0 100 100" style={{ position:'absolute', width:'100%', height:'100%' }}>
                          <circle 
                            cx="50" cy="50" r="45"
                            stroke="#CED7EC" 
                            strokeWidth="8" 
                            fill="none" 
                          />
                          <circle 
                            cx="50" cy="50" r="45"
                            stroke="#5172CC"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray="8,23"
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg> 
                        <Typography variant="h1" sx={{zIndex:1, fontWeight:'bold'}}>
                          +57%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{display:'flex', flexDirection:'column', justifyContent:'space-between', flex:1.2, bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
                    <Typography variant="body2" sx={{mb:3}}>Principali paesi in crescita</Typography>
                    <Box 
                      sx={{ 
                        display:'flex',
                        justifyContent:'center',
                        width: '100%', height: '100%', 
                        '& img': {
                          width: '98%', height: '100%', 
                          transition: 'filter 0.3s ease',
                          '&:hover': {
                            filter: 'drop-shadow(1px 1px 40px rgba(0, 0, 0, 0.3))'
                          }
                        }
                      }}
                    >
                      <img 
                        src="/image/mock_map.png"
                        alt="Mock Map"
                      />
                    </Box>
                    <Box sx={{mt:1}}>
                      <Typography variant="subtitle2" sx={{mt:1}}>Germania: +10%</Typography>
                      <Typography variant="subtitle2" sx={{mt:1}}>Italia: +8%</Typography>
                      <Typography variant="subtitle2" sx={{mt:1}}>Spagna: +6%</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Segmenti trainanti */}
                <Box sx={{bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, mb:3, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
                  <Typography variant="body2">Segmenti trainanti</Typography>
                  
                  <Box sx={{my:2}}>
                    <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <Typography variant="subtitle2">01 Cloud Computing </Typography>
                      <Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                        <LinearProgress value={45} variant="determinate" 
                          sx={{ 
                            height:'4px', 
                            borderRadius:3, 
                            width: '20vw', 
                            bgcolor: '#CDE7FF',
                            '& .MuiLinearProgress-bar': {
                              background: '#0095FF',
                              borderRadius:3,
                            }
                          }}
                        />
                        <Chip 
                          label="45%" 
                          size="small" 
                          sx={{
                            ml: 6,
                            mr: 2,
                            pt:0.2,
                            bgcolor: '#F0F9FF',  
                            fontSize: 10, 
                            height: 20,
                            borderRadius: '7px',
                            color: '#0095FF',    
                            border: '1px solid #0095FF' 
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ml:2.8, mt:0.8, color:'#7E7E7E'}}>
                      <Typography variant="subtitle1" >Fattori: Adozione accelerata di soluzioni SaaS e IaaS.</Typography>
                      <Typography variant="subtitle1" >Innovazioni: Integrazione di AI per ottimizzare l'efficienza.</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{borderStyle:'dashed' }} />
                  <Box sx={{my:2}}>
                    <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <Typography variant="subtitle2">02 Intelligenza Artificiale </Typography>
                      <Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                        <LinearProgress value={18} variant="determinate" 
                          sx={{ 
                            height:'4px', 
                            borderRadius:3, 
                            width: '20vw', 
                            bgcolor: '#C5A8FF',
                            '& .MuiLinearProgress-bar': {
                              background: '#884DFF',
                              borderRadius:3,
                            }
                          }}
                        />
                        <Chip 
                          label="18%" 
                          size="small" 
                          sx={{
                            ml: 6,
                            mr: 2,
                            pt:0.2,
                            bgcolor: '#FBF1FF',  
                            fontSize: 10, 
                            height: 20,
                            borderRadius: '7px',
                            color: '#884DFF',    
                            border: '1px solid #884DFF' 
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ml:2.8, mt:0.8, color:'#7E7E7E'}}>
                      <Typography variant="subtitle1" >Applicazioni: Automazione dei processi e analisi predittiva.</Typography>
                      <Typography variant="subtitle1" >Trend: Maggiore penetrazione in settori tradizionali come la sanità.</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{borderStyle:'dashed' }} />
                  <Box sx={{mt:2}}>
                    <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <Typography variant="subtitle2">03 Cybersecurity </Typography>
                      <Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                        <LinearProgress value={25} variant="determinate" 
                          sx={{ 
                            height:'4px', 
                            borderRadius:3, 
                            width: '20vw', 
                            bgcolor: '#FFD5A4',
                            '& .MuiLinearProgress-bar': {
                              background: '#FF8F0D',
                              borderRadius:3,
                            }
                          }}
                        />
                        <Chip 
                          label="25%" 
                          size="small" 
                          sx={{
                            ml: 6,
                            mr: 2,
                            pt:0.2,
                            bgcolor: '#FEF6E6',  
                            fontSize: 10, 
                            height: 20,
                            borderRadius: '7px',
                            color: '#FF8900',    
                            border: '1px solid #FF8900' 
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ml:2.8, mt:0.8, color:'#7E7E7E'}}>
                      <Typography variant="subtitle1" >Fattori: Aumento delle minacce informatiche e regolamentazioni più severe.</Typography>
                      <Typography variant="subtitle1" >Innovazioni: Sviluppo di soluzioni di sicurezza basate su comportamenti.</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Incremento investimento e trends emergenti */}
                <Box sx={{ display:'flex',gap:3, mb:6 }}>
                  <Box sx={{flex:1, bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, boxShadow:"0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
                    <Typography variant="body2">Incremento degli investimenti</Typography>
                    <Typography variant="subtitle1" color='textSecondary' sx={{mt:1, mb:4}}>rispetto agli scorsi 5 anni</Typography>

                    {/* Gráfico de barras Simples */}
                    <Box sx={{display:'flex', mt:2, height:'75%', justifyContent:'space-between', position:'relative', px:0.5, py:2}}>

                      {[20,25,30,23,80].map((value, index)=>(
                        <Box key={index} sx={{display:'flex', flexDirection:'column', alignItems:'center', height:'100%', justifyContent:'flex-end'}}>
                          <Box 
                            sx={{
                              width:'16px',
                              height:`${value}%`,
                              bgcolor: index===4?'#3CD856':'#E4E4E4',
                              borderRadius:'3px',
                              position:'relative'
                            }}
                          >
                            {index === 4 && (
                              <Box sx={{
                                position:'absolute', top:'-50px', left:'50%', 
                                transform:'translateX(-50%)', bgcolor:'#FFF',
                                px:1, borderRadius:'6px', fontWeight:'bold',
                                pt:0.5,
                                fontSize:20, boxShadow:'1px 1px 8px rgba(0,0,0,0.2)',
                                width:'80px',
                                height:'40px',
                                textAlign:'center',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: '-4px',
                                  left: '50%',
                                  transform:'translateX(-50%)',
                                  width: 0,
                                  height: 0,
                                  borderLeft: '5px solid transparent',
                                  borderRight: '5px solid transparent',
                                  borderTop: '5px solid #FFF'
                                }
                              }}>
                                +5M €
                              </Box>
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ mt:0.5, color:'#999'}}>{2020 + index}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{flex:1.2,bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
                    <Typography variant="body2">Trend emergenti</Typography>
                    <Box sx={{mt:3}}>
                      <Box sx={{display:'flex', gap:1.2}}>
                        <Typography variant="subtitle2" >01</Typography>
                        <Typography variant="subtitle2" >Aumento della domanda di soluzioni green tech.</Typography>
                      </Box>
                      <Divider sx={{borderStyle:'dashed', my: 2}} />
                      <Box sx={{display:'flex', gap:1.2}}>
                        <Typography variant="subtitle2" >02</Typography>
                        <Typography variant="subtitle2" >Adozione crescente di AR e VR in settori come retail e istruzione.</Typography>
                      </Box>
                      <Divider sx={{borderStyle:'dashed', my: 2 }} />
                      <Box sx={{display:'flex', gap:1.2, mb:1}}>
                        <Typography variant="subtitle2" >03</Typography>
                        <Typography variant="subtitle2" >Implementazione di robotica avanzata e processi automatizzati.</Typography>
                      </Box>
                    </Box>
                  </Box>

                </Box>

                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: "#888",
                    textDecoration: 'underline',
                  }}
                >
                  Espandi
                </Typography>
              </Box>


              <Box sx={{ flex:1, display:'flex', flexDirection:'column', gap:3, width:'100%'}}>
                {/* Notizie Rilevanti */}
                <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 3, padding: 3, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="h4" fontWeight="bold" color='#5072CC'>
                    Notizie rilevanti del settore
                  </Typography>
                  <Box sx={{ my: 2, mb:8 }}>
                    {[
                      "Software Cloud di MegaTech Rivoluziona l’Industria",
                      "Intelligenza Artificiale: Nuovi Orizzonti per le Startup",
                      "Fusione Tra Due Giganti del Settore Tecnologico",
                      "Regolamentazioni Europee Accolgono Innovazioni Green",
                      "Cybersecurity: Aumenta la Minaccia di Hacker nel 2023",
                      "Nuovo Chip Promette di Aumentare la Velocità dei Dispositivi del Fut...",
                      "Startup AI Riceve Investimenti Record per Sviluppo Avanzato",
                      "Mercato dei Dispositivi Indossabili Cresce del 20% nel 2023",
                      "Partnership Strategica: Azienda Tech Entra nel Settore Sanitario",
                      "Celle a Combustibile: Innovazione Sostenibile nel Settore Elettronico",
                      "Nuovo Chip Promette di Aumentare la Velocità dei Dispositivi del Fut..."
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', py: 1 }}>
                        <Typography variant="subtitle2">{item}</Typography>
                        <Link color="secondary" sx={{ cursor: 'pointer', fontSize:14 }}>
                          Vai all’articolo
                        </Link>
                      </Box>
                    ))}
                  </Box>
                  <Typography
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: "#888",
                      textDecoration: 'underline',
                    }}
                  >
                    Espandi
                  </Typography>
                </Box>

                {/* Notizie rilevanti del settore */}
                <Box sx={{ flex:1, position:'relative', border: '1px solid #ddd', borderRadius: 3, px: 3, py: 2, boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold" color='#A700FF'>
                      Notizie rilevanti del settore
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<OpenInNewIcon />}
                      sx={{
                        width: '110px',
                        borderRadius: 3,
                        py: 1,
                        px: 1,
                        borderColor: '#ccc',
                        color: 'grey',
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '400',
                        '&:hover': {
                          borderColor: '#bbb',
                          backgroundColor:'transparent'
                        }
                      }}
                    >
                      Esporta
                    </Button>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{mb:1, lineHeight:1.3}}>
                      Guardando al futuro, TechCorp Inc. è ben posizionata per capitalizzare su diverse opportunità emergenti. Si prevede che il mercato dell’intelligenza artificiale continui la sua crescita robusta, offrendo nuove strade per l’innovazione e l’automazione dei processi aziendali.
                    </Typography>

                    <Typography variant="subtitle2" sx={{mb:1, lineHeight:1.3}}>
                      Per massimizzare il potenziale di crescita, si consiglia di:
                    </Typography>

                    <Typography variant="subtitle2" sx={{mb:0.5, ml:1, lineHeight:1.3}}>
                      <b>- Espandere l’Offerta Cloud:</b> Approfondire l’integrazione dei servizi di cloud computing per rispondere alla crescente domanda di soluzioni SaaS.
                    </Typography>

                    <Typography variant="subtitle2" sx={{mb:0.5, ml:1, lineHeight:1.3}}>
                      <b>- Investire in Cybersecurity:</b> Potenziare le difese informatiche per proteggere da minacce crescenti e rafforzare la fiducia dei clienti.
                    </Typography>

                    <Typography variant="subtitle2" sx={{mb:1.5, ml:1, lineHeight:1.3}}>
                      <b>- Esplorare Mercati Emergenti:</b> L’espansione in regioni come l’Asia e l’America Latina potrebbe offrire nuovi segmenti di clientela.
                    </Typography>

                    <Typography variant="subtitle2" sx={{lineHeight:1.3, mb:6}}>
                      Continua a monitorare i trend di sostenibilità, poiché la domanda di soluzioni ecologiche può rappresentare una significativa fonte di vantaggio competitivo...
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      position: 'absolute',
                      bottom: 15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: "#888",
                      textDecoration: 'underline',
                    }}
                  >
                    Espandi
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

export default Market
