// import { useTheme } from '@mui/material/styles'
import { Box, Button } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useState } from 'react'
import CustomTextArea from '../CustomTextArea'
import UploadableTextArea from '../UploadableTextArea'
import DocumentList from '../DocumentList';
import { api } from '../../api/api'
import CircularProgress from '@mui/material/CircularProgress';

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
  const [selectedLanguageOriginal, setSelectedLanguageOriginal] = useState<null | string>(null);
  const [selectedLanguageTarget, setSelectedLanguageTarget] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [textFileTranslated, setTextFileTranslated] = useState<string>('');
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [isFileTranslated, setIsFileTranslated] = useState<boolean>(false);
  const [documentsTranslated, setDocumentsTranslated] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleDeleteDocument = (id: number) => {
    setDocumentsTranslated((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
    if (documentsTranslated.length === 0) {
      setIsFileTranslated(false);
    }
  };

  // Send Button Activation
  const isButtonEnabled =
    selectedLanguageOriginal !== null && selectedLanguageTarget !== null && (text.trim().length > 0 || file !== null);

  // File Upload
  const handleFileUpload = (file: File) => {
    setFile(file);
    // console.log(file);
  };

  const handleTranslation = async () => {
    if (!selectedLanguageOriginal || !selectedLanguageTarget) {
      alert("Por favor selecione os idiomas corretamente.");
      return;
    }

    setIsLoading(true); 
    try {
      if (file) { 
        setIsTranslated(false);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('origin', languageMap[selectedLanguageOriginal!]);
        formData.append('target', languageMap[selectedLanguageTarget!]);
  
        const response = await api.post('/deepl/file/', formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        const translatedFileUrl = `/deepl/file?document=${response.data.document}`;
        const translatedFileName = response.data.document || file.name;
        const fileExtension = getFileExtension(translatedFileName);
          
        const newTranslatedDocument = {
          id: Date.now(),
          name: translatedFileName,
          type: fileExtension,
          translatedUrl: translatedFileUrl,
        };
        setDocumentsTranslated((prevDocs) => [...prevDocs, newTranslatedDocument]);
        setIsFileTranslated(true);
  
        // Obtém texto do arquivo traduzido:
        const fileResponse = await api.get(translatedFileUrl, { responseType: 'blob' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const contentAsText = (event.target?.result as string) || '';
          setTextFileTranslated(contentAsText); 
          setIsLoading(false);
          console.log(textFileTranslated);
        };
        reader.readAsText(fileResponse.data);
  
      } else if (text.trim()) { 
        setIsLoading(true);
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
        alert("Insira texto ou carregue documento claramente!");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro durante tradução:', error);
      alert('Erro durante a tradução.');
      setIsLoading(false);
    }
    
  };
  
  // Função adicional claramente simples para extrair extensão do arquivo
  const getFileExtension = (filename: string) => {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length);
  };


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
          <SimpleDropdown title="Lingua originale" options={['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco']} onSelect={setSelectedLanguageOriginal} />
          {/* Upload Area */}
          <UploadableTextArea text={text} setText={setText} onFileUpload={handleFileUpload} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Dropdown Lingua target */}
          <SimpleDropdown title="Lingua target" options={['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco']} onSelect={setSelectedLanguageTarget} />
          {/* TextArea */}
          {
            isFileTranslated ? (
              <Box sx={{ position: 'relative', width: '100%', height: '100%', marginTop: '12px', borderRadius: '2vh', border: '1px solid #ddd', py: '16px', display: 'flex', justifyContent: 'center' }}>
                <DocumentList documents={documentsTranslated} onDelete={handleDeleteDocument} isTranslated={true} />
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
