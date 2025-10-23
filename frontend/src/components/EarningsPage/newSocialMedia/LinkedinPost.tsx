import { Box, Breadcrumbs, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Tooltip, Typography } from "@mui/material";
import { useLinkedinPost } from "../../../context/LinkedinPostContext";
import ContentInputCard from "./ContentInputCard";
import PostPreview from "./PostPreview";
import ProfileLogin from "./ProfileLogin";
import PostScheduleList from "./PostScheduleList";
import { useState } from "react";

const StepRenderer = () => {
    const { step, steps, goToStep, maxStep, flowType } = useLinkedinPost();
    const [openModalResetContent, setOpenModalResetContent] = useState<boolean>(false)

    const stepsWithComponents = steps.map((s) => {
        switch (s.label) {
            case "Contenuto":
                return { ...s, component: <ContentInputCard /> };
            case "Visualizza post":
                return { ...s, component: <PostPreview /> };
            case "Connetti LinkedIn":
                return { ...s, component: <ProfileLogin /> };
            case "Lista pianificazioni":
                return {
                    ...s,
                    component: (
                        <Box sx={{ width: "100%", maxHeight: "75vh" }}>
                            <PostScheduleList />
                        </Box>
                    ),
                };
            default:
                return s;
        }
    });

    const currentStepLabel = stepsWithComponents[step]?.label;

    // breadcrumb aparece apenas em "Visualizza post" e "Connetti LinkedIn"
    const showBreadcrumb = ["Visualizza post", "Connetti LinkedIn"].includes(currentStepLabel);

    // mensagens para o tooltip
    const tooltipMessages: Record<string, string> = {
        "Contenuto": currentStepLabel !== 'Contenuto' ? `Ridefinisci il contenuto che l'intelligenza artificiale dovrebbe 
        generare per il tuo post` : `Definisci il contenuto che l'IA deve generare per il tuo post`,
        "Visualizza post": "Visualizza in anteprima il tuo post prima di pubblicarlo",
        "Connetti LinkedIn": "Collega il tuo account LinkedIn per pubblicare il tuo post",
    };

    return (
        <Box
            sx={{
                width: flowType === "plan" ? "97.5%" : "92%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: currentStepLabel == 'Contenuto' ? 3 : 0
            }}
        >
            {showBreadcrumb && (
                <Breadcrumbs separator="›" sx={{ alignSelf: "flex-start", p: 1, fontSize: "14px" }}>
                    {stepsWithComponents.slice(0, maxStep + 1).map((s, index) => (
                        <Tooltip
                            key={index}
                            title={tooltipMessages[s.label] || ""}
                            arrow
                            slotProps={{
                                tooltip: {
                                    sx: { fontSize: "13px" }
                                }
                            }}
                        >
                            <Link
                                underline="hover"
                                color={index === step ? "primary" : "text.primary"}
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                    if (s.label === 'Contenuto') {
                                        setOpenModalResetContent(true);
                                    } else {
                                        goToStep(index);
                                    }
                                }}
                            >
                                {s.label}
                            </Link>
                        </Tooltip>
                    ))}
                </Breadcrumbs>
            )
            }

            {/* Renderiza etapa atual */}
            {stepsWithComponents[step]?.component}

            <Dialog
                open={openModalResetContent}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle variant="h5" sx={{ textAlign: 'center', position: 'relative' }}>
                    Conferma il ripristino del contenuto
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        Se confermi, perderai sicuramente il contenuto che hai creato.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1, mt: 1 }}>
                    <Button
                        onClick={() => setOpenModalResetContent(false)}
                        variant="outlined"
                        sx={{
                            '&:hover': {
                                backgroundColor: 'red',
                            },
                        }}
                    >
                        Anulla
                    </Button>
                    <Button
                        onClick={() => {
                            goToStep(0);
                            setOpenModalResetContent(false);
                        }}
                        variant="contained"
                        sx={{
                            color: 'white',
                        }}
                    >
                        Conferma
                    </Button>


                </DialogActions>
            </Dialog>
        </Box >
    );
};

const LinkedinPost = () => (
    <Box
        sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
            flexDirection: "column",
        }}
    >
        <StepRenderer />
    </Box>
);

export default LinkedinPost;
