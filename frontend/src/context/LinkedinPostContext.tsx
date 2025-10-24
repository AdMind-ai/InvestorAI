import React, { createContext, useContext, useState, ReactNode } from "react";
import ProfileLogin from "../components/EarningsPage/newSocialMedia/ProfileLogin";
import PostScheduleList from "../components/EarningsPage/newSocialMedia/PostScheduleList";
import { toast } from "react-toastify";

interface LinkedinPostContextProps {
    step: number;
    maxStep: number;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;
    setFlowToPublish: () => void;
    setFlowToPlan: () => void;
    contentPost: string;
    setContentPost: (v: string) => void;
    generatePost: (text?: string, file?: File | null) => Promise<void>;
    selectedFile: File | null;
    setSelectedFile: (f: File | null) => void;
    loading: boolean;
    error?: string | null;
    steps: Step[];
    resetFlow: () => void;
    flowType: FlowType;
    setFlowType: (t: FlowType) => void;
}

interface Step {
    label: string;
    component: React.ReactNode;
}

type FlowType = "base" | "publish" | "plan";

const LinkedinPostContext = createContext<LinkedinPostContextProps | undefined>(undefined);

export const LinkedinPostProvider = ({ children }: { children: ReactNode }) => {
    const [step, setStep] = useState(0);
    const [maxStep, setMaxStep] = useState(0);
    const [contentPost, setContentPost] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);
    const [flowType, setFlowType] = useState<FlowType>("base");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // fluxo padrão inicial
    const baseSteps: Step[] = [
        { label: "Contenuto", component: null },
        { label: "Visualizza post", component: null },
    ];

    React.useEffect(() => {
        setSteps(baseSteps);
    }, []);

    const nextStep = () => {
        setStep((prev) => {
            const newStep = prev + 1;
            if (newStep > maxStep) setMaxStep(newStep);
            return newStep;
        });
    };

    const prevStep = () => setStep((prev) => Math.max(0, prev - 1));

    const goToStep = (index: number) => {
        if (index <= maxStep + 1) {
            setStep(index);
            if (index > maxStep) setMaxStep(index);
        }
    };

    const setFlowToPublish = () => {
        setSteps([
            ...baseSteps,
            { label: "Connetti LinkedIn", component: <ProfileLogin /> },
        ]);
        setStep(baseSteps.length);
        setMaxStep(baseSteps.length);
        setFlowType("publish");
    };

    const setFlowToPlan = () => {
        setSteps([
            ...baseSteps,
            { label: "Lista pianificazioni", component: <PostScheduleList /> },
        ]);
        setStep(baseSteps.length);
        setMaxStep(baseSteps.length);
        setFlowType("plan");
    };

    const resetFlow = () => {
        setStep(0);
        setMaxStep(0);
        setContentPost("");
        setSelectedFile(null);
        setSteps(baseSteps);
        setFlowType("base");
    };

    // Calls backend to generate a LinkedIn post. Accepts optional text and/or file.
    // Ensures at least one of text/file is provided. Sets contentPost with the
    // returned text so it can be shown in PostPreview and persists across steps.
    const generatePost = async (text?: string, file?: File | null) => {
        setError(null);

        if ((!text || text.trim() === "") && !file) {
            setError("Devi fornire almeno un testo o un file.");
            return Promise.reject(new Error("missing_input"));
        }

        try {
            setLoading(true);
            toast.info("Contenuto generato dall'intelligenza artificiale");

            const formData = new FormData();
            if (text) formData.append("text", text);
            if (file) formData.append("file", file);

            const { api } = await import("../api/api");
            const res = await api.post("/openai/linkedin-post/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // 🔹 Se o backend retorna JSON como string, fazemos parse
            let data;
            try {
                data = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
            } catch {
                data = {};
            }

            const finalText = data?.description || "";

            setContentPost(finalText);

            toast.success("Contenuto generato con successo!");
            return finalText;
        } catch (err) {
            const message = "Errore nella generazione del contenuto";
            setError(typeof message === "string" ? message : JSON.stringify(message));
            return Promise.reject(err);
        } finally {
            setLoading(false);
        }
    };



    return (
        <LinkedinPostContext.Provider
            value={{
                step,
                maxStep,
                nextStep,
                prevStep,
                goToStep,
                setFlowToPublish,
                setFlowToPlan,
                contentPost,
                setContentPost,
                generatePost,
                selectedFile,
                setSelectedFile,
                steps,
                resetFlow,
                flowType,
                setFlowType,
                loading,
                error,
            }}
        >
            {children}
        </LinkedinPostContext.Provider>
    );
};

export const useLinkedinPost = () => {
    const ctx = useContext(LinkedinPostContext);
    if (!ctx) throw new Error("useLinkedinPost deve essere usato dentro un LinkedinPostProvider");
    return ctx;
};
