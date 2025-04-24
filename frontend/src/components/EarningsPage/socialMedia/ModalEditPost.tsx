import moment from 'moment'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Modal,
  Typography,
} from '@mui/material'

import PostInterface from '../../../interfaces/postInterface'
import AyrshareInterface from '../../../interfaces/ayrshareInterface'
import { useEffect, useState } from 'react'
import CustomTextArea from '../../CustomTextArea'
import DragDropImage from '../../DragDropImage'
import DialogDateTime from '../../DialogDateTime'

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
                  Anteprima del tuo post linkedin
                </Typography>
                {states.aiSubmit.value ? <CircularProgress size={20} /> : <></>}
              </Box>
              <Typography
                
                sx={{
                  fontSize: '10pt',
                  color: '#a7a6a6',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '10px',
                  padding: '2px',
                  marginRight: '10px',
                }}
              >
                {moment(post.post_date).format('DD MMMM YYYY - HH:mm')}
              </Typography>
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
                Pubblica subito
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
                Pianifica post
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
              textConfirmButton="Pianifica post"
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default ModalEditPost
