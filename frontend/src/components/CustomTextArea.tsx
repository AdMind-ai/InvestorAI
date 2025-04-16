import { Box, TextField } from '@mui/material';
import { DotTyping } from './DotTyping';

interface CustomTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  isDisabled?: boolean;
  showTyping?: boolean;
  hasLimit?: boolean;
  maxLength?: number;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({ 
  value, 
  onChange, 
  placeholder = "Text here.", 
  height = '30vh', 
  isDisabled=false, 
  showTyping=false,
  hasLimit=false,
  maxLength=1000000 
}) => {

  return (
    <Box sx={{ position: 'relative', width: '100%', height, marginTop: '12px' }}>
      <TextField
        variant="outlined"
        disabled={isDisabled}
        fullWidth
        multiline
        minRows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          htmlInput: { maxLength },
          formHelperText: {
            sx: { position: 'absolute', right:0, bottom:5 } 
          }
        }}
        helperText={hasLimit? `${value.length}/${maxLength} caratteri`: ""}
        placeholder={placeholder}
        sx={{
          flex: 1,
          height: '100%',
          fontSize: '10px',
          backgroundColor: 'inherit',
          borderRadius: '2vh',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          '& .MuiOutlinedInput-root': {
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '2vh',
            fontSize: '17px',
            height: '100%',
          },
          '& .MuiOutlinedInput-input': {
            height: '100%!important',
            overflowY: 'auto!important',
          },
        }}
      />
      {showTyping && !value && (
        <Box sx={{
          position: 'absolute',
          top: 16,
          left: 20,
          fontSize: '1.2rem',
          pointerEvents: 'none',
        }}>
          <DotTyping/>
        </Box>
      )}
    </Box>
  );
};

export default CustomTextArea;
