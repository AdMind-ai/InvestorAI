import { Box, Breadcrumbs, Link } from "@mui/material";
import { LinkedinPostProvider, useLinkedinPost } from "../../../context/LinkedinPostContext";
import ContentInputCard from "./ContentInputCard";
import PostPreview from "./PostPreview";
import ProfileLogin from "./ProfileLogin";
import PostScheduleList from "./PostScheduleList"; // (novo componente futuro)

const StepRenderer = () => {
    const { step, steps, goToStep, maxStep, contentPost } = useLinkedinPost();

    // associa os componentes reais às etapas
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
                        <Box
                            sx={{
                                width: "100%",
                                maxHeight: "75vh",
                                px: 1,
                            }}
                        >
                            <PostScheduleList />
                        </Box>
                    ),
                };
            default:
                return s;
        }
    });

    const currentStepLabel = stepsWithComponents[step]?.label;
    const hideBreadcrumb = currentStepLabel === "Lista pianificazioni";


    return (
        <Box sx={{ width: "92%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Breadcrumbs dinâmicos */}
            {!hideBreadcrumb && (
                <Breadcrumbs separator="›" sx={{ alignSelf: "flex-start", p: 1, fontSize: '14px' }}>
                    {stepsWithComponents.slice(0, maxStep + 1).map((s, index) => (
                        <Link
                            key={index}
                            underline={"hover"}
                            color={index === step ? "primary" : "text.primary"}
                            sx={{ cursor: "pointer" }}
                            onClick={() => goToStep(index)}
                        >
                            {s.label}
                        </Link>
                    ))}
                </Breadcrumbs>
            )}

            {/* Renderiza etapa atual */}
            {stepsWithComponents[step]?.component}
        </Box>
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
