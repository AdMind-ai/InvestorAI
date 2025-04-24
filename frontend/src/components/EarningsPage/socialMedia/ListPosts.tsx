import { Pagination, PaginationItem, Typography, Box, Button } from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import PostInterface from '../../../interfaces/postInterface'
import AyrshareInterface from '../../../interfaces/ayrshareInterface'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import noImagePNG from '../../../assets/icons/no-image.png' 
import DialogDelete from '../../DialogDelete';
import { useState, useEffect } from 'react';
import ModalNewPost from './ModalNewPost';
import ModalEditPost from './ModalEditPost';

import dayjs from 'dayjs';
import 'dayjs/locale/it';

dayjs.locale('it');



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
        <Box sx={{position:'relative', border: '1px solid #e0e0e0', borderRadius: '10px', width: '100%', marginBottom: '10px', alignItems:'center', alignContent:'center', padding:'10px'}}>  
            <Box sx={{display:'flex', flexDirection: 'row'}}>
                <Box sx={{ width: '95px',  height: '95px'}}>
                    <Box
                        component="img"
                        alt={post.image ? 'image to post' : 'no image'}
                        src={post.image ? post.image : noImagePNG}
                        sx={{
                            width: '95px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                        }}
                    />
                </Box>

                <Box sx={{width:'100%', px:2, py:1, display:'flex', flexDirection: 'column', justifyContent:'space-between'}}>   
                    <Box>
                        <Typography  sx={{fontSize:'11pt'}} >
                        {post.text?.length > 310 ? post.text.slice(0, 310) + '...' : post.text}
                        </Typography>
                        
                    </Box>       
                    <Box>
                        <Typography  sx={{fontSize:'11pt', color:'#a7a6a6'}} >
                            Post programmato il: 
                            <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                backgroundColor: '#F5F5F5',
                                borderRadius: '30px',
                                px: 1.8,
                                py: 0.9,
                                ml:1
                                }}>
                                <CalendarTodayOutlinedIcon sx={{ color: '#9a9a9a', fontSize: '12px', mr: 1 }} />
                                <Typography variant='body2' sx={{ color: '#9a9a9a', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                    {dayjs(post.post_date).format('DD MMMM YYYY - HH:mm')}
                                </Typography>
                            </Box>
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <DeleteOutlineIcon sx={{ color: '#de0606', cursor: 'pointer' }} onClick={()=>{
                        setHandlerDeletPost(post.id)
                        
                    }} />

                </Box>
            </Box>
            
            <Typography onClick={()=>{editPost(post)}}  sx={{position:'absolute', bottom:10, right:15, fontSize:'11pt', color:'#a7a6a6', textDecoration:'underline', cursor:'pointer'}} >
                    Modifica post
            </Typography>
        </Box>)
}

const ListPosts =  ({states}: {states: AyrshareInterface}) => {

    const [handlerDeletPost, setHandlerDeletPost] = useState<number| null>(null)
    const [openNewPost, setOpenNewPost] = useState(false);
    const [openDisconnect, setOpenDisconnect] = useState(false);
    const [editPost, setEditPost] = useState<PostInterface| null>(null)

    // Pages:
    const postsPerPage = 3;
    const totalPosts = states.countPosts.value || 1; 
    const totalPages = Math.ceil(totalPosts / postsPerPage) || 1;    
    const [page, setPage] = useState(1);
    const startIdx = (page - 1) * postsPerPage;
    const endIdx = startIdx + postsPerPage;
    const postsToShow = states.posts.value.slice(startIdx, endIdx);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [totalPages]);

    return (
        <Box sx={{width: '100%', height:'100%', display: 'flex', flexDirection: 'column', justifyContent:'space-between'}}>
            <Box>{}
                <Box sx={{display: 'flex', flexDirection: 'row', justifyContent:'space-between', alignItems: 'flex-end',textAlign: 'center'}}>
                
                    <Typography variant="h4">
                        I tuoi post programmati
                    </Typography>
                    <Box>
                        <Button 
                            onClick={()=>{
                                setOpenNewPost(true)
                            }}
                            variant="contained"
                            color='primary'
                            sx={{
                                width: '125px',
                                backgroundColor: '#ced7ec',
                                border: `1px solid #708bd4`,
                                borderRadius: '12px',
                                color: '#708bd4',
                                '&:hover': {
                                    color: '#ced7ec',
                                }
                            }}
                        >
                            Nuovo post
                        </Button>
                        <Button 
                            onClick={()=>{
                                setOpenDisconnect(true)
                            }}
                            variant="contained"
                            sx={{
                                marginLeft: 1,
                                width: '125px',
                                backgroundColor: '#f9cdcd',
                                border: `1px solid #e11c1c`,
                                borderRadius: '12px',
                                color: '#e11c1c',
                                '&:hover': {
                                    color: '#f9cdcd',
                                    backgroundColor: '#e11c1c',
                                }
                            }}
                        >
                            Disconnetti
                        </Button>
                    </Box>
                    
                </Box>

                <Box sx={{width: '100%', mt: 2}}>
                    {postsToShow.map((post, key) => (
                        <Box key={key}>
                            <PostLine 
                                post={post} 
                                setHandlerDeletPost={setHandlerDeletPost} 
                                editPost={setEditPost}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    py: 1,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'transparent',
                }}
                >
                <Pagination
                    count={100000} 
                    page={1} 
                    onChange={(_, newPage) => {
                    if (newPage > 1 && states.urlPostsNext.value) {
                        states.urlPostsNext.set(states.urlPostsNext.value);
                    } else if (newPage < 1 && states.urlPostsPrevious.value) {
                        states.urlPostsPrevious.set(states.urlPostsPrevious.value);
                    }
                    }}
                    shape='rounded'
                    variant='outlined'
                    renderItem={(item) => {
                    if (item.type === 'page' || item.type === 'start-ellipsis' || item.type === 'end-ellipsis') {
                        return null; 
                    }
                    return (
                        <PaginationItem
                        {...item}
                        components={{ previous: Typography, next: Typography }}
                        slots={{
                            previous: () => (
                            <Typography sx={{ textTransform: 'none', fontSize: '16px' }}>
                                ← Precedente
                            </Typography>
                            ),
                            next: () => (
                            <Typography sx={{ textTransform: 'none', fontSize: '16px' }}>
                                Successivo →
                            </Typography>
                            ),
                        }}
                        disabled={
                            (item.type === 'previous' && states.urlPostsPrevious.value === null) ||
                            (item.type === 'next' && states.urlPostsNext.value === null)
                        }
                        />
                    );
                    }}
                    sx={{
                    '& .MuiPaginationItem-root': {
                        color: 'text.primary',
                        borderRadius: '12px',
                        border: '1px solid #ddd',
                        margin: '0 4px',
                        height: '40px',
                        minWidth: '40px',
                        '&.Mui-selected': {
                        backgroundColor: '#f1f1f1',
                        borderColor: '#bbb',
                        },
                        '&:hover': {
                        backgroundColor: '#f1f1f1',
                        },
                        '&.MuiPaginationItem-previousNext': {
                        padding: '0px 12px',
                        },
                    },
                    }}
                />
                </Box>

            <DialogDelete open={handlerDeletPost !== null} onClose={()=>setHandlerDeletPost(null)} onConfirm={()=>states.deletePost.set(handlerDeletPost)} title='&#9888; Conferma richiesta &#9888;' text='Vuoi davvero eliminare questo post?' subText='Una volta eliminato, non serà più possibile recuperarlo.' textButton='Elimina post' /> 
            <DialogDelete 
                open={openDisconnect} 
                onClose={()=>setOpenDisconnect(false)} 
                onConfirm={async () => {
                    await states.handleDisconnectProfile();
                    setOpenDisconnect(false);
                }} 
                title='🛑 Conferma richiesta 🛑' text='Vuoi davvero disconnettere il tuo account?' subText='Tutti i post programmati verranno eliminati per sempre.' textButton='Disconetti' 
            /> 
            
            <ModalNewPost open={openNewPost} onClose={()=>setOpenNewPost(false)} states={states} />
            { editPost !== null &&
                <ModalEditPost open={editPost !== null} onClose={()=>setEditPost(null)} states={states} post={editPost}/>
            }
        </Box>
    )

}

export default ListPosts