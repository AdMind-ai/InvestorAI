import { Box, TextField } from '@mui/material';
import { DotTyping } from './DotTyping';
import theme from '../styles/theme';

interface CustomTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  isDisabled?: boolean;
  showTyping?: boolean;
  hasLimit?: boolean;
  limitThreshold?: number;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({
  value,
  onChange,
  placeholder = "Text here.",
  height = '30vh',
  isDisabled = false,
  showTyping = false,
  hasLimit = false,
  limitThreshold
}) => {
  const isOverLimit = hasLimit && limitThreshold !== undefined && value.length > limitThreshold;

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
        placeholder={placeholder}
        helperText={hasLimit ? `${value.length}/${limitThreshold} caratteri` : ""}
        FormHelperTextProps={{
          sx: {
            textAlign: 'right',
            margin: 0,
            paddingRight: '12px',
            position: 'absolute',
            bottom: '8px',
            right: 0,
            width: '100%',
            backgroundColor: 'transparent',
            fontSize: '0.8rem',
            pointerEvents: 'none',
            color: isOverLimit ? 'red' : 'gray',
          }
        }}
        sx={{
          height: '100%',
          backgroundColor: 'inherit',
          borderRadius: '2vh',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          '& .MuiOutlinedInput-root': {
            height: '100%',
            borderRadius: '2vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            paddingBottom: '30px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'gray', 
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isOverLimit ? 'red' : theme.palette.primary.main, 
            },
          },
          '& .MuiOutlinedInput-input': {
            overflowY: 'auto',
            padding: '12px',
            paddingBottom: '30px',
            fontSize: '17px',
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
          <DotTyping />
        </Box>
      )}
    </Box>
  );
};

export default CustomTextArea;
