import { Box, TextField } from '@mui/material';

interface CustomTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  isDisabled?: boolean;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({ value, onChange, placeholder = "Text here.", height = '30vh', isDisabled=false }) => {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', marginTop: '12px' }}>
      <TextField
        variant="outlined"
        disabled={isDisabled}
        fullWidth
        multiline
        minRows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          flex: 1,
          fontSize: '10px',
          backgroundColor: 'inherit',
          borderRadius: '2vh',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          '& .MuiOutlinedInput-root': {
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '2vh',
            fontSize: '17px',
            height: { height },
            overflow: 'auto',
          },
          '& .MuiOutlinedInput-input': {
            overflowY: 'auto',
            height: { height },
          },
        }}
      />
    </Box>
  );
};

export default CustomTextArea;
