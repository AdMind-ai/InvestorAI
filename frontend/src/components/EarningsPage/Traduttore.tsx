// import { useTheme } from '@mui/material/styles'
import { Box, Button } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useState, useEffect } from 'react'
import CustomTextArea from '../CustomTextArea'
import UploadableTextArea from '../upload-components/UploadableTextArea'
import DocumentList from "../upload-components/DocumentListUploaded";
import { api } from '../../api/api'
import { toast } from "react-toastify";
import CircularProgress from '@mui/material/CircularProgress';

interface PendingTask {
  task_id: string;
  filename: string;
  originalName: string;
  originalType: string;
}

interface Document {
  id: number;
  name: string;
  type: string;
  translatedUrl?: string;
}

const languageMap: Record<string, string> = {
  'Italiano': 'italian',
  'Inglese': 'english',
  'Francese': 'french',
  'Spagnolo': 'spanish',
  'Greco': 'greek',
  'Portoghese': 'portuguese',
  'Tedesco': 'german',
};

const Traduttore = () => {
  // const theme = useTheme()
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Text
  const [text, setText] = useState<string>('');
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [translatedText, setTranslatedText] = useState<string>('');
  
  // Files
  const [files, setFiles] = useState<File[]>([]);
  const [isFileTranslated, setIsFileTranslated] = useState<boolean>(false);
  const [documentsTranslated, setDocumentsTranslated] = useState<Document[]>([]);
  
  // Languages
  const [selectedLanguageOriginal, setSelectedLanguageOriginal] = useState<string>('');
  const [selectedLanguageTarget, setSelectedLanguageTarget] = useState<string>('');
  const [filteredOriginalLanguages, setFilteredOriginalLanguages] = useState<string[]>([]);
  const [filteredTargetLanguages, setFilteredTargetLanguages] = useState<string[]>([]);
  const languages = ['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco'];
  
  useEffect(() => {
    setFilteredOriginalLanguages(languages.filter(lang => lang !== selectedLanguageTarget));
    setFilteredTargetLanguages(languages.filter(lang => lang !== selectedLanguageOriginal));
  }, [selectedLanguageOriginal, selectedLanguageTarget]);

  // Send Button Activation
  const isButtonEnabled =
    selectedLanguageOriginal !== '' && selectedLanguageTarget !== '' && (text.trim().length > 0 || files.length > 0);

  const getFilename = (url: string) => {
    // remove o query string
    const cleanUrl = url.split('?')[0];
    // pega só o último segmento do caminho
    return cleanUrl.split('/').pop();
  }

  // File Delete 
  const handleDeleteDocument = (filename: string) => {
    setFiles((prev) => prev.filter(f => f.name !== filename));
    setIsFileTranslated(false);
  };

  // File Upload
  const handleFileUpload = (file: File | File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...(Array.isArray(file) ? file : [file])
    ]);
  };

  // File Extension
  const getFileExtension = (filename: string) => {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length);
  };

  // Translation
  const handleTranslation = async () => {
    if (!selectedLanguageOriginal || !selectedLanguageTarget) {
      return;
    }

    setIsLoading(true); 
    try {
      if (files.length > 0) { 
        setIsFileTranslated(false);

        const translationRequests = files.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('origin', languageMap[selectedLanguageOriginal!]);
          formData.append('target', languageMap[selectedLanguageTarget!]);
          return api.post('/deepl/file/', formData, {
            headers: { "Content-Type": "multipart/form-data" }
          }).then(res => ({ 
            task_id: res.data.task_id, 
            filename: res.data.filename, 
            originalName: file.name,
            originalType: getFileExtension(file.name)
          }));
        });

        toast.info("Attendere un momento, la traduzione potrebbe richiedere alcuni minuti.");
  
        const tasksStarted = await Promise.all(translationRequests);
        
        setPendingTasks(tasksStarted); 

      } else if (text.trim()) { 
        setIsFileTranslated(false);
        const response = await api.post('/deepl/text/', {
          text: text,
          origin: languageMap[selectedLanguageOriginal!],
          target: languageMap[selectedLanguageTarget!],
        });
        
        setTranslatedText(response.data.translated_text);
        console.log(response.data.translated_text)
        setIsTranslated(true);
        setIsLoading(false);
      } else {
        toast.error('Error: Nessun testo o file da tradurre.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro durante tradução:', error);
      toast.error('Error durante la traduzione. Riprova più tardi.');
      setIsLoading(false);
    }
    
  };


  useEffect(() => {
    if (pendingTasks.length === 0) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    // checa status de cada e atualiza a lista
    const interval = setInterval(async () => {
      for (const task of pendingTasks) {
        try {
          const { data } = await api.get('/deepl/file/task_status/', { 
            params: { task_id: task.task_id }
          });
          console.log("Task status:");
          console.log(data);
          if (data.status === "SUCCESS" && data.result && !data.error) {
            console.log("File translated successfully:", data.result);
            setDocumentsTranslated(prev => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                name: getFilename(data.result) as string,
                type: task.originalType,
                translatedUrl: data.result,              
                originalName: task.originalName
              }
            ]);
            setIsFileTranslated(true);
            setFiles([]); 
            setPendingTasks(current => current.filter(t => t.task_id !== task.task_id));
          }
          else if (data.status === "FAILURE" || data.status === "REVOKED") {
            // erro
            toast.error('Falha ao traduzir arquivo ' + task.originalName);
            setPendingTasks(current => current.filter(t => t.task_id !== task.task_id));
          }
          // Não faz nada enquanto estiver "PENDING" ou "STARTED"
        } catch (err) {
          // erro de conexão, mostra toast mas não tira da fila ainda
          console.error(err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pendingTasks]);


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '2vw', alignItems: 'center' }}>

      {/* Text Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '2vw',
          width: '98%',
          height: '51vh',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Dropdown Lingua originale */}
          <SimpleDropdown title="Lingua originale" options={filteredOriginalLanguages} onSelect={setSelectedLanguageOriginal} selectedValue={selectedLanguageOriginal}/>
          {/* Upload Area */}
          <UploadableTextArea text={text} setText={setText} onFileUpload={handleFileUpload} placeholder='Scrivi il tuo testo qui' documentPlaceHolder='Carica un file o trascinalo qui'/>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Dropdown Lingua target */}
          <SimpleDropdown title="Lingua target" options={filteredTargetLanguages} onSelect={setSelectedLanguageTarget} selectedValue={selectedLanguageTarget}/>
          {/* TextArea */}
          {
            isFileTranslated ? (
              <Box sx={{ position: 'relative', width: '100%', height: '100%', marginTop: '12px', borderRadius: '2vh', border: '1px solid #ddd', py: '16px', display: 'flex', justifyContent: 'center' }}>
                <DocumentList documents={[...documentsTranslated].reverse()} onDelete={handleDeleteDocument} isTranslation isResult/>
              </Box>
            ) : isTranslated ? (
              <CustomTextArea 
                value={translatedText} 
                onChange={setTranslatedText} 
                placeholder=""
                height='44vh'
              /> 
            ) : (
              <CustomTextArea 
                value="" 
                onChange={() => {}} 
                placeholder=""
                height='44vh' 
                isDisabled 
              /> 
          )
        }
        </Box>
      </Box>

      {/* Generate Button */}
      <Button
        variant="contained"
        color="primary"
        disabled={!isButtonEnabled || isLoading}
        onClick={handleTranslation}
        sx={{ borderRadius: '6px', padding: '6px 16px', textTransform: 'none', width: 'calc(9.5vw)', fontSize: '17px', marginTop: '2vw' }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Traduci'}
      </Button>
    </Box>
    
  )
}

export default Traduttore
