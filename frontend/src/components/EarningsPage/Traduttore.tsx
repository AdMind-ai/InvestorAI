// import { useTheme } from '@mui/material/styles'
import { Box, Button } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useEffect, useState } from 'react'
import CustomTextArea from '../CustomTextArea'
import UploadableTextArea from '../UploadableTextArea'
import DocumentList from '../DocumentList';

interface Document {
  id: number;
  name: string;
  type: string;
}

const Traduttore = () => {
  // const theme = useTheme()
  const [selectedLanguage, setSelectedLanguage] = useState<null | string>(null);
  const [selectedVoice, setSelectedVoice] = useState<null | string>(null);
  const [text, setText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [documentsTranslated, setDocumentsTranslated] = useState<Document[]>([]);
  
  // Mockup Documents
  useEffect(() => {
    if (isTranslated) {
      const newDocuments: Document[] = [];

      for (let i = 0; i < 10; i++) {
        const file_id = Date.now() + Math.random();
        newDocuments.push({
          id: file_id,
          name: `file_name_${file_id}.txt`,
          type: 'txt',
        });
      }
      
      setDocumentsTranslated((prevDocs) => [...prevDocs, ...newDocuments]);
    }
  }
  , [isTranslated]);

  const handleDeleteDocument = (id: number) => {
    setDocumentsTranslated((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
    if (documentsTranslated.length === 0) {
      setIsTranslated(false);
    }
  };

  // Send Button Activation
  const isButtonEnabled =
    selectedLanguage !== null && selectedVoice !== null && text.trim().length > 0;

  // File Upload
  const handleFileUpload = (file: File) => {
    console.log('Arquivo carregado:', file);
    // Enviar o arquivo para o backend ou processar o conteúdo
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
          <SimpleDropdown title="Lingua originale" options={['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco']} onSelect={setSelectedLanguage} />
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
          <SimpleDropdown title="Lingua target" options={['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Greco', 'Portoghese', 'Tedesco']} onSelect={setSelectedVoice} />
          {/* TextArea */}
          { isTranslated ? 
            <Box sx={{ position: 'relative', width: '100%', height: '100%', marginTop: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <Box sx={{ height:'100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingY: '12px'}}>
                <DocumentList documents={documentsTranslated} onDelete={handleDeleteDocument} isTranslated={true} />
              </Box>
            </Box>
            : 
            <CustomTextArea value={translatedText} onChange={setTranslatedText} placeholder="" height='45vh' isDisabled /> 
          }
        </Box>
      </Box>


      {/* Generate Button */}
      <Button
        variant="contained"
        color="primary"
        disabled={!isButtonEnabled}
        onClick={() => setIsTranslated(true)}
        sx={{ borderRadius: '6px', padding: '6px 16px', textTransform: 'none', width: 'calc(9.5vw)', fontSize: '17px', marginTop: '2vw' }}
      >
        Traduci
      </Button>
    </Box>
    
  )
}

export default Traduttore
