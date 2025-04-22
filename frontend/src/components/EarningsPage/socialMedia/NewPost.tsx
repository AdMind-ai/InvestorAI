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
            flexDirection: "row",
            width: "100%",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <UploadableTextArea
              text={states.postText.value}
              setText={states.postText.set}
              onFileUpload={handleFileUpload}
              placeholder="Scrivi il tuo testo oppure"
              documentPlaceHolder="Carica un comunicato stampa o trascinalo qui"
            />
          </Box>
        </Box>
        <Divider sx={{ width: "105%" }} />
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
            color="primary"
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
    );
  }

  /****************************
   * Layout for publish view  *
   ****************************/
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Typography variant="h4" sx={{ mr: 2 }}>
          Anteprima del tuo post LinkedIn
        </Typography>
        {states.aiSubmit.value && <CircularProgress size={20} />}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "70%",
            p: 1,
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
            width: "30%",
            p: 1,
          }}
        >
          <DragDropImage
            onFileUpload={handleImageUpload}
            image={states.postPublishImage.value}
          />
        </Box>
      </Box>

      <Divider sx={{ width: "105%" }} />

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
