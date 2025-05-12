import { useEffect, useState } from "react";
import useAyrshareStates from "../../../hooks/useAyrshareStates";
import AyrshareInterface from "../../../interfaces/ayrshareInterface";
import { Box, CircularProgress, Button } from "@mui/material";
import NewPost from "./NewPost";
import ListPosts from "./ListPosts";
import Profile from "./Profile";
import DialogDelete from '../../DialogDelete';

const SocialMedia = () => {
    const states: AyrshareInterface = useAyrshareStates();
    const [openDisconnect, setOpenDisconnect] = useState(false);

    useEffect(() => {
        if (states.profile.value === null) {
            states.profile.set();
        }
      }, []); // eslint-disable-line react-hooks/exhaustive-deps


    if (states.submit.value) {
        return <Box 
        sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2.1vw',
        }}
        ><CircularProgress /></Box>
    }
    else {
        if (states.profile.value !== null && states.social.value?.filter(item=>item==='linkedin').length===0) {
            return <Profile states={states}/>
        }

        if (states.profile.value !== null && states.posts.value.length == 0) {
            return (
                <Box>
                    <Button 
                        onClick={()=>{
                            setOpenDisconnect(true)
                        }}
                        variant="contained"
                        sx={{
                            position: 'absolute',
                            right: 60,
                            top:155,
                            zIndex: 10,
                            width: '180px',
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
                        Disconnetti profilo
                    </Button>
                    <DialogDelete 
                        open={openDisconnect} 
                        onClose={()=>setOpenDisconnect(false)} 
                        onConfirm={async () => {
                            await states.handleDisconnectProfile();
                            setOpenDisconnect(false);
                        }} 
                        title='🛑 Conferma richiesta 🛑' text='Vuoi davvero disconnettere il tuo account?' subText='Tutti i post programmati verranno eliminati per sempre.' textButton='Disconetti' 
                    /> 
                    <Box 
                        sx={{ 
                            position: 'relative', 
                            width: '100%', 
                            height: '100%', 
                            overflow: 'hidden',
                            display: 'flex',
                            padding: '10px',
                        }}
                        >
                        <NewPost states={states}/>
                    </Box>
                </Box>
                
            )
        }

        

        return (
            <Box 
                sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '100%', 
                    overflow: 'hidden',
                    display: 'flex',
                    padding: '10px',
                }}
                >
                    
                    {states.posts.value.length > 0 ? <ListPosts states={states}/> : <NewPost states={states}/>}

            </Box>
        )
    }
}

export default SocialMedia