import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Modal,
  Typography,
} from '@mui/material'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PostInterface from '../../../interfaces/postInterface'
import AyrshareInterface from '../../../interfaces/ayrshareInterface'
import { useEffect, useState } from 'react'
import CustomTextArea from '../../CustomTextArea'
import DragDropImage from '../../upload-components/DragDropImage'
import DialogDateTime from '../../DialogDateTime'

import dayjs from 'dayjs';
import 'dayjs/locale/it';

dayjs.locale('it');

const ModalEditPost = ({
  open,
  onClose,
  states,
  post,
}: {
  open: boolean
  onClose: () => void
  states: AyrshareInterface
  post: PostInterface
}) => {
  let margin = (window.innerWidth / 100) * 10
  if (window.innerWidth < 600) {
    margin = 10
  }

  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const handleImageUpload = (file: File) => {
    states?.postPublishImage?.set(file)
  }

  const handleImageDelete = () => {
    states.postPublishImage.set(null);
  };

  useEffect(() => {
    if (post !== null) {
      states?.postPublishText?.set(post.text)
      states?.postPublishImage?.set(null)
      states?.postPublishSchedule?.set(null)
      states?.postFiles?.set([])
    }
  }, [post]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      disableAutoFocus={true}
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{ position: 'relative', margin: `${margin}px` }}>
        <Box
          sx={{
            border: '0px solid #e0e0e0',
            borderRadius: '10px',
            padding: '40px 20px',
            backgroundColor: '#FFF',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Typography variant="h4" sx={{ marginRight: '10px' }}>
                  Anteprima linkedin
                </Typography>
                {states.aiSubmit.value ? <CircularProgress size={20} /> : <></>}
              </Box>
              <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#F5F5F5',
                  borderRadius: '30px',
                  px: 1.8,
                  py: 0.9,
                  }}>
                  <CalendarTodayOutlinedIcon sx={{ color: '#9a9a9a', fontSize: '12px', mr: 1 }} />
                  <Typography variant='body2' sx={{ color: '#9a9a9a', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {dayjs(post.post_date).format('DD MMMM YYYY - HH:mm')}
                  </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                marginBottom: '10px',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '70%',
                  padding: '10px',
                }}
              >
                <CustomTextArea
                  value={states.postPublishText.value}
                  onChange={states.postPublishText.set}
                  placeholder="Scrivi il tuo testo qui."
                  height="100%"
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '30%',
                  padding: '10px',
                }}
              >
                <DragDropImage
                  onFileUpload={handleImageUpload}
                  onFileDelete={handleImageDelete}
                  image={states.postPublishImage.value}
                />
              </Box>
            </Box>
            <Divider sx={{ width: '100%' }} />
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'end',
              }}
            >
              <Button
                onClick={() => states.editPost.set(post.id)}
                disabled={states.aiSubmit.value}
                variant="contained"
                color="secondary"
                sx={{
                  alignSelf: 'flex-end',
                  mt: '15px',
                  width: '155px',
                  flexDirection: 'column',
                  marginRight: '10px',
                }}
              >
                Pubblica ora
              </Button>
              <Button
                onClick={() => setOpenDialog(true)}
                disabled={states.aiSubmit.value}
                variant="contained"
                color="primary"
                sx={{
                  alignSelf: 'flex-end',
                  mt: '15px',
                  width: '155px',
                }}
              >
                Programma il post
              </Button>
            </Box>
            {}
            <DialogDateTime
              open={openDialog}
              onClose={() => {
                states.postPublishSchedule.set(null)
                setOpenDialog(false)
              }}
              onConfirm={() => states.editPost.set(post.id, 'schedule')}
              onCancel={() => {
                states.postPublishSchedule.set(null)
                setOpenDialog(false)
              }}
              datetimeState={states.postPublishSchedule}
              textConfirmButton="Programma il postpost"
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default ModalEditPost
