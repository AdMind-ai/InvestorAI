import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";

import UploadableTextArea from "../../UploadableTextArea";
import CustomTextArea from "../../CustomTextArea";
import DragDropImage from "../../DragDropImage";
import DialogDateTime from "../../DialogDateTime";
import AyrshareInterface from "../../../interfaces/ayrshareInterface";

interface NewPostProps {
  states: AyrshareInterface;
}

const NewPost: React.FC<NewPostProps> = ({ states }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // File Upload
  const handleFileUpload = (file: File | File[]) => {
    states.postFiles.set((prevFiles: File[]) => [
      ...prevFiles,
      ...(Array.isArray(file) ? file : [file]),
    ]);
  };

  const handleImageUpload = (file: File) => {
    states.postPublishImage.set(file);
  };


  /********************************
   * Layout for assistant section *
   ********************************/
  if (states.postPage.value === "assistant") {
    return (
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height:'100%',
            mt:3,
          }}
        > 
          <Box sx={{ display: "flex", flexDirection: "column", width: "96%", alignItems:'center', py:2.5, px:3.5, border:`1px solid #CBCBCB`, borderRadius:'16px', boxShadow:'0px 3px 10px rgba(0,0,0,0.1)'}}>
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height:'300px' }}>
              <Typography variant="h4" sx={{ mb: 0.5, mt:1 }}>
                Definisci il contenuto del post che vuoi generare
              </Typography>
              <UploadableTextArea
                text={states.postText.value}
                setText={states.postText.set}
                onFileUpload={handleFileUpload}
                placeholder="Scrivi il tuo testo qui"
                documentPlaceHolder="Carica un comunicato stampa o trascinalo qui"
                textAreaHeight="150px"
              />
            </Box>
            <Divider sx={{ width: "101%", mt:2 }} />
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <Button
                onClick={()=>states.createLinkedlnPost.set()}
                variant="contained"
                color="secondary"
                sx={{
                  alignSelf: "flex-end",
                  mt: 2,
                  width: 155,
                }}
              >
                Salva e Procedi
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  /****************************
   * Layout for publish view  *
   ****************************/
  return (
    <Box sx={{ width: "100%", display:'flex', justifyContent:'center', mt:3 }}>
      <Box sx={{ display: "flex", flexDirection: "column", width: "96%", alignItems:'center', py:2.5, px:3.5, border:`1px solid #CBCBCB`, borderRadius:'16px', boxShadow:'0px 3px 10px rgba(0,0,0,0.1)', position:'relative', height: '430px' }}>  
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Typography variant="h4" sx={{ position:'absolute', top:25, left:30 }}>
            Anteprima del tuo post LinkedIn
          </Typography>
          {states.aiSubmit.value && <CircularProgress size={20} />}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "280px",
            mt: 4,
            mb: 1,
            gap: 2
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex:2,
            }}
          >
            <CustomTextArea
              value={states.postPublishText.value}
              onChange={states.postPublishText.set}
              placeholder="Inserisci il testo qui."
              height="100%"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <DragDropImage
              onFileUpload={handleImageUpload}
              image={states.postPublishImage.value}
            />
          </Box>
        </Box>

        <Divider sx={{ width: "102%", mt:2 }} />

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Button
            onClick={()=> states.publishPost.set()}
            disabled={states.aiSubmit.value}
            variant="contained"
            color="secondary"
            sx={{
              width: 155,
              mr: 1,
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
              width: 155,
            }}
          >
            Pianifica post
          </Button>
        </Box>
      </Box>


      <DialogDateTime
        open={openDialog}
        onClose={() => {
          states.postPublishSchedule.set(null);
          setOpenDialog(false);
        }}
        onConfirm={() => states.publishPost.set("schedule")}
        onCancel={() => {
          states.postPublishSchedule.set(null);
          setOpenDialog(false);
        }}
        datetimeState={states.postPublishSchedule}
        textConfirmButton="Pianifica post"
      />
    </Box>
  );
};

export default NewPost;
