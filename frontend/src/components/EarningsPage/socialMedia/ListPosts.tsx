import moment from 'moment'
import { Box, Button, Typography } from '@mui/material'

import PostInterface from '../../../interfaces/postInterface'
import AyrshareInterface from '../../../interfaces/ayrshareInterface'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import noImagePNG from '../../../assets/icons/no-image.png' 
import DialogDelete from '../../DialogDelete';
import { useState } from 'react';
import ModalNewPost from './ModalNewPost';
import ModalEditPost from './ModalEditPost';

const PostLine = ({
    post,
    setHandlerDeletPost,
    editPost
  }: {
    post: PostInterface,
    setHandlerDeletPost: React.Dispatch<React.SetStateAction<number | null>>,
    editPost: (post: PostInterface) => void
  }) => {

    return (
        <Box sx={{border: '1px solid #e0e0e0', borderRadius: '10px', width: '100%', marginBottom: '10px', alignItems:'center', alignContent:'center', padding:'10px'}}>  
            <Box sx={{display:'flex', flexDirection: 'row'}}>
                <Box sx={{padding:'10px'}}>
                    <Box
                        component="img"
                        alt={post.image ? 'image to post' : 'no image'}
                        src={post.image ? post.image : noImagePNG}
                        sx={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                        }}
                    />
                </Box>

                <Box sx={{width:'100%', margin:'10px', marginTop:"0px"}}>   
                    <Box>
                        <Typography  sx={{fontSize:'11pt'}} >
                        {post.text?.length > 270 ? post.text.slice(0, 270) + '...' : post.text}
                        </Typography>
                        
                    </Box>       
                    <Box>
                        <Typography  sx={{fontSize:'11pt', color:'#a7a6a6'}} >
                            Post programmato il: <span style={{border: '1px solid #e0e0e0',backgroundColor:'#e0e0e0', borderRadius: '10px',padding:'2px'}}>{moment(post.post_date).format('DD MMMM YYYY - HH:mm')}</span>
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <DeleteOutlineIcon sx={{ color: '#de0606', cursor: 'pointer' }} onClick={()=>{
                        setHandlerDeletPost(post.id)
                        
                    }} />

                </Box>
            </Box>
            <Box sx={{display:'flex', flexDirection: 'row', justifyContent:'flex-end', margin:'0px'}}>
                <Typography onClick={()=>{editPost(post)}}  sx={{fontSize:'11pt', color:'#a7a6a6', textDecoration:'underline', cursor:'pointer'}} >
                        Modifica post
                </Typography>
            </Box>
        </Box>)
}

const ListPosts =  ({states}: {states: AyrshareInterface}) => {

    const [handlerDeletPost, setHandlerDeletPost] = useState(null)
    const [openNewPost, setOpenNewPost] = useState(false);
    const [editPost, setEditPost] = useState(null);
   
    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center',textAlign: 'center'}}>
            
                <Typography variant="h4" sx={{marginRight: '10px'}}>
                    I tuoi post programmati
                </Typography>
                <Button 
                    onClick={()=>{
                        setOpenNewPost(true)
                    }}
                    variant="contained"
                    color='primary'
                    sx={{
                        alignSelf: 'flex-end',
                        mt: '15px',
                        width: '155px',
                        backgroundColor: '#ced7ec',
                        borderColor: '#708bd4',
                        color: '#708bd4',
                        '&:hover': {
                            color: '#ced7ec',
                        }
                    }}
                >
                    Nuovo post
                </Button>
                
            </Box>

            <Box sx={{width: '100%', marginTop: '20px'}}>
                {states.posts.value.map((post, key)=>{

                    return (<Box key={key}><PostLine post={post} setHandlerDeletPost={setHandlerDeletPost} editPost={setEditPost}/></Box>)
                })}
            </Box>
            <Box sx={{width: '100%', marginTop: '20px', display:'flex', justifyContent:'center'}}>
                {
                    states.countPosts.value > 3 && (
                        <Box sx={{display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center',textAlign: 'center', marginTop: '20px'}}>
                            {

                            }
                            
                            <Box component='button'
                                onClick={states.urlPostsPrevious.set}
                                disabled={states.urlPostsPrevious.value===null}
                                sx={{
                                    display:'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    borderRadius: '10px !important',
                                    padding: '1px 8px',
                                    height: 'calc(5.3vh)',
                                    color: states.urlPostsPrevious.value===null? '#acacac':'#7e7e7e',
                                    border: `1px solid #e0e0e0 !important`,
                                    backgroundColor: states.urlPostsPrevious.value===null? '#d6d6d6' : '#fff',
                                    cursor: states.urlPostsPrevious.value===null? 'default':'pointer',
                                    marginRight: '10px',
                                }}
                            >
                                <ArrowBackIcon />
                                <Typography  sx={{fontSize: '10pt'}}>Precedente</Typography>
                            </Box>
                            {
                                Array.from({ length: (states.countPosts.value/3)+1 }, (_, i) => i + 1).map((page, key) => (
                                    <Box key={key} component='button'
                                        sx={{
                                            display:'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            borderRadius: '10px !important',
                                            padding: '1px 8px',
                                            height: 'calc(5.3vh)',
                                            color: '#7e7e7e',
                                            border: `1px solid #e0e0e0 !important`,
                                            backgroundColor: '#fff',
                                            cursor: 'default',
                                            marginRight: '10px',
                                            width: 'calc(5.3vh)',
                                        }}
                                    >
                                        <Typography  sx={{fontSize: '10pt'}}>{page}</Typography>
                                    </Box>
                                ))
                            }
                            <Box component='button'
                                onClick={states.urlPostsNext.set}
                                disabled={states.urlPostsNext.value===null}
                                sx={{
                                    display:'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    borderRadius: '10px !important',
                                    padding: '1px 8px',
                                    height: 'calc(5.3vh)',
                                    color: states.urlPostsNext.value===null? '#acacac':'#7e7e7e',
                                    border: `1px solid #e0e0e0 !important`,
                                    backgroundColor: states.urlPostsNext.value===null? '#d6d6d6' : '#fff',
                                    cursor: states.urlPostsNext.value===null? 'default':'pointer',
                                }}
                            >
                                <Typography  sx={{fontSize: '10pt'}}>Successivo</Typography>
                                <ArrowForwardIcon />
                            </Box>
                            
                        </Box>
                    )
                }
            </Box>
            <DialogDelete open={handlerDeletPost !==null} onClose={()=>setHandlerDeletPost(null)} onConfirm={()=>states.deletePost.set(handlerDeletPost)} title='&#9888; Conferma richiesta &#9888;' text='Vuoi davvero eliminare questo post?' subText='Una volta eliminato, non serà più possibile recuperarlo.' textButton='Elimina post' /> 
            <ModalNewPost open={openNewPost} onClose={()=>setOpenNewPost(false)} states={states} />
                {
                    editPost !== null &&
                    <ModalEditPost open={editPost !== null} onClose={()=>setEditPost(null)} states={states} post={editPost}/>
                }
        </Box>
    )

}

export default ListPosts