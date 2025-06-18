// import { useTheme } from '@mui/material/styles'
import { Box, Button } from '@mui/material'
import SimpleDropdown from '../SimpleDropdown'
import { useState, useEffect } from 'react'
import CustomTextArea from '../CustomTextArea'
import UploadableTextArea from '../upload-components/UploadableTextArea'
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
    selectedLanguageOriginal !== null && selectedLanguageTarget !== null && (text.trim().length > 0 || files.length > 0);


  // File Delete 
  const handleDeleteDocument = (id: number) => {
    setDocumentsTranslated((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
    if (documentsTranslated.length === 0) {
      setIsFileTranslated(false);
    }
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
        setIsTranslated(false);

        const translationRequests = files.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('origin', languageMap[selectedLanguageOriginal!]);
          formData.append('target', languageMap[selectedLanguageTarget!]);
  
          return api.post('/deepl/file/', formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        });
  
        const responses = await Promise.all(translationRequests);
        
        const translatedDocuments: Document[] = responses.map((res, idx) => {
          const translatedFileUrl = `/deepl/file?document=${res.data.document}`;
          const translatedFileName = res.data.document || files[idx].name;
          const fileExtension = getFileExtension(translatedFileName);

          return {
            id: Date.now() + idx,
            name: translatedFileName,
            type: fileExtension,
            translatedUrl: translatedFileUrl,
          };
        });

        setDocumentsTranslated(prevDocs => [...prevDocs, ...translatedDocuments]);
        setIsFileTranslated(true);
        setFiles([]);
        setIsLoading(false);

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
        alert("Insira texto ou carregue documento claramente!");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro durante tradução:', error);
      alert('Erro durante a tradução.');
      setIsLoading(false);
    }
    
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
                <DocumentList documents={[...documentsTranslated].reverse()} onDelete={handleDeleteDocument} isTranslated={true} />
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
