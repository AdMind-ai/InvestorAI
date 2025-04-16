import { useEffect } from "react";
import useAyrshareStates from "../../../hooks/useAyrshareStates";
import AyrshareInterface from "../../../interfaces/ayrshareInterface";
import { Box, CircularProgress } from "@mui/material";
import NewPost from "./NewPost";
import ListPosts from "./ListPosts";
import Profile from "./Profile";

const SocialMedia = () => {
    const states: AyrshareInterface = useAyrshareStates();

    useEffect(() => {
        if (states.profile.value === null) {
            states.profile.set();
        }
      }, []);


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