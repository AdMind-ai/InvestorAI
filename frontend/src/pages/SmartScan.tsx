import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
  Paper
} from "@mui/material";
import Layout from "../layouts/Layout";
import CircularProgress from '@mui/material/CircularProgress';
import UploadableFileArea from '../components/upload-components/UploadableFileArea'
import SaveCleanButtons from "../components/buttons/SaveCleanButtons";
import { fetchWithAuth } from '../api/fetchWithAuth';
import { toast } from "react-toastify";
import SendIcon from '@mui/icons-material/Send';

const SmartScan: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isExtracted, setIsExtracted] = useState(false);
  const [assistantId, setAssistantId] = useState<string | null>(null); 
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]); 
  const [userMsg, setUserMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /// UPLOAD HANDLERS
  const handleFileUpload = (file: File | File[]) => {
    setFiles(prevFiles => [...prevFiles, ...(Array.isArray(file) ? file : [file])]);
  };
  const handleDeleteFile = (filename: string) => {
    setFiles(files => files.filter(f => f.name !== filename));
  };
  const handleNewExtract = () => {
    setIsExtracted(false);
    setFiles([]);
    setMessages([]);
    setUserMsg("");
    setAssistantId(null); 
  };

  // EXTRAÇÃO DE DADOS
  const handleExtract = async () => {
    if (!files.length) return;
    setIsLoading(true);
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    try {
      // Usando fetchWithAuth para upload multipart
      const res = await fetchWithAuth("/smartscan/extract/", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Erro na extração: " + (await res.text()));
      }

      const data = await res.json();
      setMessages([{ role: "assistant", content: data.summary || "" }]);
      setIsExtracted(true);
      setAssistantId(data.assistant_id || null); 
      toast.success("Dati estratti con successo!");
    } catch (e) {
      toast.error("Errore nell'estrazione dei dati");
      console.error(e);
    }
    setIsLoading(false);
  };

  // CHAT
  const handleChatSend = async () => {
    if (!userMsg || !assistantId) return;
    setIsChatLoading(true);

    try {
      const bodyObj = {
        assistant_id: assistantId,
        messages: [
          ...messages,
          { role: "user", content: userMsg }
        ]
      };
      const res = await fetchWithAuth("/smartscan/chat/", {
        method: "POST",
        body: JSON.stringify(bodyObj),
        headers: {
        },
      });

      if (!res.ok) {
        throw new Error("Erro no chat: " + (await res.text()));
      }

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: "user", content: userMsg },
        { role: "assistant", content: data.answer }
      ]);
      setUserMsg("");
    } catch (e) {
      toast.error("Errore durante la risposta della IA");
      console.error(e);
    }
    setIsChatLoading(false);
  };

  return (
    <Layout>
      <Box sx={{display: "flex", flexDirection: "column", px: 2, pt: 1, height: '100%', width: "100%"}}>
        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%"}}>
          <Typography variant="h6" sx={{fontWeight: 700, ml: 1}}>SmartScan AI</Typography>
          {isExtracted && (
            <SaveCleanButtons onClean={handleNewExtract}/>
          )}
        </Box>
        <Divider />
        {/* --- UPLOAD & EXTRAÇÃO --- */}
        {!isExtracted && (
          <Box sx={{mt:2, display:'flex', flexDirection:'column', alignItems:'center', width:'100%', gap:3}}>
            <UploadableFileArea onFileUpload={handleFileUpload} onDeleteFile={handleDeleteFile} files={files} width={'100%'} height={'67vh'} />
            <Button
              disabled={!files.length || isLoading}
              variant="contained"
              onClick={handleExtract}
              sx={{ width: '160px' }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Estrai tutti i dati'}
            </Button>
          </Box>
        )}
        {/* --- RESUMO & CHAT --- */}
        {isExtracted && (
          <Box sx={{
            mt:3,
            display:'flex',
            flexDirection:'column',
            width:'100%',
            gap:2,
            overflowY:'auto',
            maxHeight:'calc(100vh - 180px)',
          }}>
            {/* Timeline Chat + Dati Estratti */}
            <Box
              sx={{
                flex:1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                px:2
              }}
            >
              {messages.map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    mb: 0.5,
                    maxWidth: i === 0? "100%":"75%"
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      py: 1,
                      px: 2,
                      bgcolor:
                        i === 0
                          ? "#f9f9f9" // Dati Estratti bg
                          : m.role === "user"
                          ? "#e7ebff"
                          : "#F2F5F2",
                      borderLeft:
                        i === 0
                          ? "4px solid #CCD4FF" // Dati Estratti destaque
                          : "0px solid transparent",
                      color: "#222",
                      borderRadius: 2,
                      fontSize: "15px"
                    }}
                  >
                    {i === 0 ? (
                      <>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ mb: 1 }}
                        >
                          DATI ESTRATTI
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            whiteSpace: "pre-line",
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                            width: "99%",
                            fontSize: "14px"
                          }}
                        >
                          {m.content}
                        </Typography>
                      </>
                    ) : (
                      m.content
                    )}
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            {/* Chat input */}
            <Box sx={{ display: "flex", alignItems:'center', gap:1 }}>
              <TextField
                value={userMsg}
                onChange={e=>setUserMsg(e.target.value)}
                placeholder="Interroga i tuoi dati"
                size="small"
                onKeyDown={e=>{if(e.key==='Enter' && !isChatLoading){ handleChatSend(); }}}
                sx={{flex:1, bgcolor:'#fafafa'}}
                disabled={isChatLoading}
              />
              {isChatLoading ? 
              <IconButton onClick={handleChatSend} disabled={!userMsg || isChatLoading}>
                <CircularProgress size={26} color="inherit" /> 
              </IconButton>
              : 
              <IconButton onClick={handleChatSend} disabled={!userMsg || isChatLoading}>
                <SendIcon/>
              </IconButton>
              }
              
            </Box>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default SmartScan;