import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import Layout from "../layouts/Layout";
import LinedDropdown from "../components/dropdowns/LinedDropdown";
import avatarVideo from "../assets/mp4/annaavataradmindai.mp4";
// import AvatarImg from '../assets/image.svg'

const Avatar: React.FC = () => {
  const [targetLanguage, setTargetLanguage] = useState<string | string[]>("");

  const [text, setText] = useState<string>("");
  const [isGenerated, setIsGenerated] = useState(false);
  const isButtonEnabled = text.length > 0 && !!targetLanguage;

  const messageOfDescription = "Il tuo avatar è un ambasciatore digitale: parla per te nel mondo, ti rappresenta fedelmente e apre porte dove la lingua o la distanza sono barriere. Fai parlare la tua immagine in qualsiasi lingua, con il tuo tono di voce e la tua espressione."

  // const handleNewGeneration = () => {
  //   setTargetLanguage("");
  //   setIsGenerated(false);
  //   setText("");
  // };

  const videoRef = useRef<HTMLVideoElement>(null);

  // useEffect(() => {
  //   const video = videoRef.current;

  //   if (video) {
  //     video.addEventListener('loadedmetadata', () => {
  //       video.currentTime = 0.7;
  //     });

  //     video.addEventListener('seeked', () => {
  //       video.pause(); // pausa depois de chegar nos 0.7s
  //     });

  //     // Inicia a reprodução silenciosa (para forçar carregamento em alguns browsers)
  //     video.muted = true;
  //     video.play().catch(() => {
  //       // Alguns navegadores vão bloquear, e tudo bem — o evento `loadedmetadata` ainda funciona
  //     });
  //   }
  // }, []);


  return (
    <Layout>
      <Box sx={{ padding: '3vh', overflow: 'auto', height: '100%', width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mr: 2 }}>
          {/*  Title  */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="h2" sx={{ marginBottom: '0.2vw', marginLeft: '1vw' }}>
              Avatar AI
            </Typography>
          </Box>

        </Box>

        <Typography variant='subtitle1' sx={{ px: 2, fontSize: '14px' }}>
          {messageOfDescription}
        </Typography>

        {/* Boxes */}
        <Box
          sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '82%' }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row', height: '85%', width: '100%' }}>
            {/* Left Box */}
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, height: '100%' }}
            >
              <LinedDropdown title="Seleziona la lingua"
                options={[
                  "Italiano",
                  "Inglese",
                  "Francese",
                  "Spagnolo",
                  "Tedesco",
                  "Portoghese",
                  "Russo",
                  "Cinese",
                ]} value={targetLanguage}
                onChange={setTargetLanguage}
              />

              <TextField
                multiline
                placeholder="Scrivi il tuo testo qui"
                value={text}
                onChange={e => setText(e.target.value)}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  '& .MuiInputBase-root': {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  },
                  '& .MuiInputBase-input': {
                    height: '100% !important',
                    flex: 1,
                    overflow: 'auto',
                    boxSizing: 'border-box',
                    resize: 'none',
                  }
                }}
                InputProps={{
                  sx: {
                    height: '100%',
                    alignItems: 'stretch',
                  }
                }}
              />
            </Box>

            {/* Right Box */}
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}
            >
              {/* <Box
                component="img"
                src={AvatarImg}
                alt="Preview"
                sx={{
                  width: "100%",
                  // maxHeight: 500,
                  height:'100%',
                  objectFit: "fill",
                  borderRadius: 2,
                  background: "#fafbfd"
                }}
              /> */}
              <Box
                component="video"
                controls
                ref={videoRef}
                src={avatarVideo}
                sx={{
                  width: "100%",
                  height: '100%',
                  borderRadius: 2,
                  background: "#fafbfd",
                  objectFit: "cover"
                }}
                // keep muted autoplay so some browsers preload and we can seek
                muted
              // optionally autoplay / loop when generated
              // autoplay={isGenerated}
              // loop={isGenerated}
              />
              {isGenerated && (<Box></Box>)}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              disabled={!isButtonEnabled}
              variant="contained"
              onClick={() => setIsGenerated(true)}
              sx={{ width: '120px'}}
            >
              Genera
            </Button>
            <Button
              disabled={!isButtonEnabled}
              variant="contained"
              onClick={() => setIsGenerated(true)}
              sx={{ width: '120px' }}
            >
              Scarica
            </Button>
          </Box>
        </Box>

      </Box>
    </Layout>
  );
};

export default Avatar;