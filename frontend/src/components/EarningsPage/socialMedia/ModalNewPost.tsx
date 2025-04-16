import moment from 'moment'
import { Box, Modal } from '@mui/material'

import { useEffect } from 'react';
import NewPost from './NewPost';




const ModalNewPost = ({open, onClose, states}) => {

    useEffect(()=>{
        if (open) {
            states.postPublishText.set('')
            states.postPublishImage.set(null)
            states.postPublishSchedule.set(null)
            states.postFiles.set([])
        }

    },[open])

    let margin = (window.innerWidth/100) * 10
    if (window.innerWidth < 600){
        margin= 10
    }

    return (
        <Modal
        disableAutoFocus={true}
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
            <Box sx={{position:'relative', margin:`${margin}px`}}>
                <Box sx={{border:'0px solid #e0e0e0', borderRadius: '10px', padding:'20px', backgroundColor:'#FFF'}}>   

                    <NewPost states={states}/>
                </Box>
            </Box>
        </Modal>
    )

}

export default ModalNewPost