// {/* Crescita del settore */}
// <Box sx={{ flex:1, border:'1px solid #ddd', borderRadius:3, px:3, py:2, boxShadow:'0px 3px 10px rgba(0, 0, 0, 0.1)', position:'relative' }}>

// {/* Cabeçalho com botões de seleção */}
// <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
//   <Typography variant='body2' fontWeight="bold" color='#ED6008'>Crescita del settore</Typography>
  
//   <Box sx={{display:'flex', alignItems:'center'}}>
//     <Button size="small" variant='outlined' color='primary' sx={{bgcolor:'#FCE8DA', borderRadius:3, mr:1, textTransform:'none', fontSize:'0.9rem', width: '80px', height: '35px'}}>Europa</Button>
//     <Button size="small" variant='outlined' color='primary' sx={{borderRadius:3, mr:2, textTransform:'none', fontSize:'0.9rem', fontWeight:'400', width: '80px', height: '35px'}}>Italia</Button>
//     <Box component="select" sx={{ borderRadius: 3, py: 1, px:3, borderColor: '#ccc', color:'grey', cursor:'pointer' }}>
//       <option>Ultimi 12 mesi</option>
//     </Box>
//   </Box>
// </Box>

// {/* Crescimento anual e mapa */}
// <Box sx={{ display:'flex', gap:3, mt:3, mb:3 }}>
//   <Box sx={{flex:1, bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, display:'flex', flexDirection:'column', boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
//     <Box>
//       <Typography variant="body2">Crescita percentuale annua</Typography>
//       <Typography variant="subtitle1" color='textSecondary' sx={{mt:1, mb:2}}>rispetto all’anno precedente</Typography>
//     </Box>
    
//     <Box sx={{display:'flex', justifyContent:'center', mb:1}}>
//       <Box sx={{ width:180, height:180, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', mt:1 }}>
//         <svg viewBox="0 0 100 100" style={{ position:'absolute', width:'100%', height:'100%' }}>
//           <circle 
//             cx="50" cy="50" r="45"
//             stroke="#CED7EC" 
//             strokeWidth="8" 
//             fill="none" 
//           />
//           <circle 
//             cx="50" cy="50" r="45"
//             stroke="#5172CC"
//             strokeWidth="8"
//             fill="none"
//             strokeDasharray="8,23"
//             strokeLinecap="round"
//             transform="rotate(-90 50 50)"
//           />
//         </svg> 
//         <Typography variant="h1" sx={{zIndex:1, fontWeight:'bold'}}>
//           +57%
//         </Typography>
//       </Box>
//     </Box>
//   </Box>

//   <Box sx={{display:'flex', flexDirection:'column', justifyContent:'space-between', flex:1.2, bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
//     <Typography variant="body2" sx={{mb:3}}>Principali paesi in crescita</Typography>
//     <Box 
//       sx={{ 
//         display:'flex',
//         justifyContent:'center',
//         width: '100%', height: '100%', 
//         '& img': {
//           width: '98%', height: '100%', 
//           transition: 'filter 0.3s ease',
//           '&:hover': {
//             filter: 'drop-shadow(1px 1px 40px rgba(0, 0, 0, 0.3))'
//           }
//         }
//       }}
//     >
//       <img 
//         src="/image/mock_map.png"
//         alt="Mock Map"
//       />
//     </Box>
//     <Box sx={{mt:1}}>
//       <Typography variant="subtitle2" sx={{mt:1}}>Germania: +10%</Typography>
//       <Typography variant="subtitle2" sx={{mt:1}}>Italia: +8%</Typography>
//       <Typography variant="subtitle2" sx={{mt:1}}>Spagna: +6%</Typography>
//     </Box>
//   </Box>
// </Box>

// {/* Segmenti trainanti */}
// <Box sx={{bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, mb:3, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
//   <Typography variant="body2">Segmenti trainanti</Typography>
  
//   <Box sx={{my:2}}>
//     <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
//       <Typography variant="subtitle2">01 Cloud Computing </Typography>
//       <Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
//         <LinearProgress value={45} variant="determinate" 
//           sx={{ 
//             height:'4px', 
//             borderRadius:3, 
//             width: '20vw', 
//             bgcolor: '#CDE7FF',
//             '& .MuiLinearProgress-bar': {
//               background: '#0095FF',
//               borderRadius:3,
//             }
//           }}
//         />
//         <Chip 
//           label="45%" 
//           size="small" 
//           sx={{
//             ml: 6,
//             mr: 2,
//             pt:0.2,
//             bgcolor: '#F0F9FF',  
//             fontSize: 10, 
//             height: 20,
//             borderRadius: '7px',
//             color: '#0095FF',    
//             border: '1px solid #0095FF' 
//           }}
//         />
//       </Box>
//     </Box>
//     <Box sx={{ml:2.8, mt:0.8, color:'#7E7E7E'}}>
//       <Typography variant="subtitle1" >Fattori: Adozione accelerata di soluzioni SaaS e IaaS.</Typography>
//       <Typography variant="subtitle1" >Innovazioni: Integrazione di AI per ottimizzare l'efficienza.</Typography>
//     </Box>
//   </Box>
  
//   <Divider sx={{borderStyle:'dashed' }} />
//   <Box sx={{my:2}}>
//     <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
//       <Typography variant="subtitle2">02 Intelligenza Artificiale </Typography>
//       <Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
//         <LinearProgress value={18} variant="determinate" 
//           sx={{ 
//             height:'4px', 
//             borderRadius:3, 
//             width: '20vw', 
//             bgcolor: '#C5A8FF',
//             '& .MuiLinearProgress-bar': {
//               background: '#884DFF',
//               borderRadius:3,
//             }
//           }}
//         />
//         <Chip 
//           label="18%" 
//           size="small" 
//           sx={{
//             ml: 6,
//             mr: 2,
//             pt:0.2,
//             bgcolor: '#FBF1FF',  
//             fontSize: 10, 
//             height: 20,
//             borderRadius: '7px',
//             color: '#884DFF',    
//             border: '1px solid #884DFF' 
//           }}
//         />
//       </Box>
//     </Box>
//     <Box sx={{ml:2.8, mt:0.8, color:'#7E7E7E'}}>
//       <Typography variant="subtitle1" >Applicazioni: Automazione dei processi e analisi predittiva.</Typography>
//       <Typography variant="subtitle1" >Trend: Maggiore penetrazione in settori tradizionali come la sanità.</Typography>
//     </Box>
//   </Box>
  
//   <Divider sx={{borderStyle:'dashed' }} />
//   <Box sx={{mt:2}}>
//     <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
//       <Typography variant="subtitle2">03 Cybersecurity </Typography>
//       <Box sx={{display:'flex', flexDirection:'row', alignItems:'center'}}>
//         <LinearProgress value={25} variant="determinate" 
//           sx={{ 
//             height:'4px', 
//             borderRadius:3, 
//             width: '20vw', 
//             bgcolor: '#FFD5A4',
//             '& .MuiLinearProgress-bar': {
//               background: '#FF8F0D',
//               borderRadius:3,
//             }
//           }}
//         />
//         <Chip 
//           label="25%" 
//           size="small" 
//           sx={{
//             ml: 6,
//             mr: 2,
//             pt:0.2,
//             bgcolor: '#FEF6E6',  
//             fontSize: 10, 
//             height: 20,
//             borderRadius: '7px',
//             color: '#FF8900',    
//             border: '1px solid #FF8900' 
//           }}
//         />
//       </Box>
//     </Box>
//     <Box sx={{ml:2.8, mt:0.8, color:'#7E7E7E'}}>
//       <Typography variant="subtitle1" >Fattori: Aumento delle minacce informatiche e regolamentazioni più severe.</Typography>
//       <Typography variant="subtitle1" >Innovazioni: Sviluppo di soluzioni di sicurezza basate su comportamenti.</Typography>
//     </Box>
//   </Box>
// </Box>

// {/* Incremento investimento e trends emergenti */}
// <Box sx={{ display:'flex',gap:3, mb:6 }}>
//   <Box sx={{flex:1, bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, boxShadow:"0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
//     <Typography variant="body2">Incremento degli investimenti</Typography>
//     <Typography variant="subtitle1" color='textSecondary' sx={{mt:1, mb:4}}>rispetto agli scorsi 5 anni</Typography>

//     {/* Gráfico de barras Simples */}
//     <Box sx={{display:'flex', mt:2, height:'75%', justifyContent:'space-between', position:'relative', px:0.5, py:2}}>

//       {[20,25,30,23,80].map((value, index)=>(
//         <Box key={index} sx={{display:'flex', flexDirection:'column', alignItems:'center', height:'100%', justifyContent:'flex-end'}}>
//           <Box 
//             sx={{
//               width:'16px',
//               height:`${value}%`,
//               bgcolor: index===4?'#3CD856':'#E4E4E4',
//               borderRadius:'3px',
//               position:'relative'
//             }}
//           >
//             {index === 4 && (
//               <Box sx={{
//                 position:'absolute', top:'-50px', left:'50%', 
//                 transform:'translateX(-50%)', bgcolor:'#FFF',
//                 px:1, borderRadius:'6px', fontWeight:'bold',
//                 pt:0.5,
//                 fontSize:20, boxShadow:'1px 1px 8px rgba(0,0,0,0.2)',
//                 width:'80px',
//                 height:'40px',
//                 textAlign:'center',
//                 '&::after': {
//                   content: '""',
//                   position: 'absolute',
//                   bottom: '-4px',
//                   left: '50%',
//                   transform:'translateX(-50%)',
//                   width: 0,
//                   height: 0,
//                   borderLeft: '5px solid transparent',
//                   borderRight: '5px solid transparent',
//                   borderTop: '5px solid #FFF'
//                 }
//               }}>
//                 +5M €
//               </Box>
//             )}
//           </Box>
//           <Typography variant="caption" sx={{ mt:0.5, color:'#999'}}>{2020 + index}</Typography>
//         </Box>
//       ))}
//     </Box>
//   </Box>

//   <Box sx={{flex:1.2,bgcolor:'#F8F8F8', borderRadius:3, px:2, py:3, boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)"}}>
//     <Typography variant="body2">Trend emergenti</Typography>
//     <Box sx={{mt:3}}>
//       <Box sx={{display:'flex', gap:1.2}}>
//         <Typography variant="subtitle2" >01</Typography>
//         <Typography variant="subtitle2" >Aumento della domanda di soluzioni green tech.</Typography>
//       </Box>
//       <Divider sx={{borderStyle:'dashed', my: 2}} />
//       <Box sx={{display:'flex', gap:1.2}}>
//         <Typography variant="subtitle2" >02</Typography>
//         <Typography variant="subtitle2" >Adozione crescente di AR e VR in settori come retail e istruzione.</Typography>
//       </Box>
//       <Divider sx={{borderStyle:'dashed', my: 2 }} />
//       <Box sx={{display:'flex', gap:1.2, mb:1}}>
//         <Typography variant="subtitle2" >03</Typography>
//         <Typography variant="subtitle2" >Implementazione di robotica avanzata e processi automatizzati.</Typography>
//       </Box>
//     </Box>
//   </Box>

// </Box>

// <Typography
//   sx={{
//     position: 'absolute',
//     bottom: 15,
//     left: '50%',
//     transform: 'translateX(-50%)',
//     cursor: 'pointer',
//     fontSize: '1rem',
//     color: "#888",
//     textDecoration: 'underline',
//   }}
// >
//   Espandi
// </Typography>
// </Box>