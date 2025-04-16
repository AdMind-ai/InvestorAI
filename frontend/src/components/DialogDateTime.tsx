import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material"
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

interface DialogDateTimeInterface {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onCancel: () => void;
    datetimeState: {
            value: any;
            set: () => Dispatch<void>;
        };
    textConfirmButton: string;
}
    

    const DialogDateTime = ({open, onClose, onConfirm, onCancel, textConfirmButton, datetimeState}:DialogDateTimeInterface)=> {

        let slotProps = {
            layout: {
              sx: {
                [`.Mui-selected`]: {
                  color: '#721384',
                  fontWeight:500,
                  backgroundColor: '#FFF',
        
                },
              },
            },
            textField: { size: 'small' }
          }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                <Typography component='p'>
                    Schedule post
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{margin:'30px'}}>
                <Box sx={{display: 'flex', flexDirection:'row',justifyContent:'space-around', alignItems: 'center', width: '100%', margin:'10px'}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker 
                    size="small"
                    slotProps={slotProps}
                    value={datetimeState.value} 
                    onChange={datetimeState.set} 
                    format="DD/MMM/YYYY HH:mm"
                    />
                </LocalizationProvider>
                </Box>
                <Box sx={{display: 'flex', flexDirection:'row',justifyContent:'space-around', alignItems: 'center', width: '100%', margin:'10px'}}>
                    <Button 
                        onClick={onCancel}
                        variant="contained"
                        color='secondary'
                        sx={{
                            alignSelf: 'flex-end',
                            mt: '15px',
                            flexDirection: 'column',
                            marginRight: '10px',
                        }}
                        >
                        Cancellare
                    </Button>
                    <Button 
                        onClick={onConfirm}
                        variant="contained"
                        color='primary'
                        sx={{
                            alignSelf: 'flex-end',
                            mt: '15px',
                            flexDirection: 'column',
                            marginRight: '10px',
                        }}
                        >
                        {textConfirmButton}
                    </Button>
                </Box>
            </Box>
            </DialogContent>
        </Dialog>
    )
}

export default DialogDateTime