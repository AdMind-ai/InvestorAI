import { Box, Breadcrumbs, Link, Tooltip } from "@mui/material";
import { LinkedinPostProvider, useLinkedinPost } from "../../../context/LinkedinPostContext";
import ContentInputCard from "./ContentInputCard";
import PostPreview from "./PostPreview";
import ProfileLogin from "./ProfileLogin";
import PostScheduleList from "./PostScheduleList";

const StepRenderer = () => {
    const { step, steps, goToStep, maxStep, contentPost, flowType } = useLinkedinPost();

    const stepsWithComponents = steps.map((s) => {
        switch (s.label) {
            case "Definisci contenuto":
                return { ...s, component: <ContentInputCard /> };
            case "Visualizza post":
                return { ...s, component: <PostPreview post={contentPost} /> };
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
        "Definisci contenuto": currentStepLabel !== 'Definisci contenuto' ? `Ridefinisci il contenuto che l'intelligenza artificiale dovrebbe 
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
                mt: currentStepLabel == 'Definisci contenuto' ? 3 : 0
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
                                onClick={() => goToStep(index)}
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
        </Box >
    );
};

const LinkedinPost = () => (
    <LinkedinPostProvider>
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
    </LinkedinPostProvider>
);

export default LinkedinPost;
