import { Box, TextField } from '@mui/material';

interface CustomTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const CustomTextArea: React.FC<CustomTextAreaProps> = ({ value, onChange, placeholder = "Text here.", height = '30vh' }) => {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', marginTop: '12px' }}>
      <TextField
        variant="outlined"
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
