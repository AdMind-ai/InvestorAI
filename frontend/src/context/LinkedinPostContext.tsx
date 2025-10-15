import React, { createContext, useContext, useState, ReactNode } from "react";
import ProfileLogin from "../components/EarningsPage/newSocialMedia/ProfileLogin";
import PostScheduleList from "../components/EarningsPage/newSocialMedia/PostScheduleList";

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
    selectedFile: File | null;
    setSelectedFile: (f: File | null) => void;
    steps: Step[];
    resetFlow: () => void;
}

interface Step {
    label: string;
    component: React.ReactNode;
}

const LinkedinPostContext = createContext<LinkedinPostContextProps | undefined>(undefined);

export const LinkedinPostProvider = ({ children }: { children: ReactNode }) => {
    const [step, setStep] = useState(0);
    const [maxStep, setMaxStep] = useState(0);
    const [contentPost, setContentPost] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [steps, setSteps] = useState<Step[]>([]);

    // fluxo padrão inicial
    const baseSteps: Step[] = [
        { label: "Definisci contenuto", component: null },
        { label: "Visualizza post", component: null },
    ];

    // inicializa o fluxo base ao montar
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
        setStep(baseSteps.length); // vai direto para o novo step
        setMaxStep(baseSteps.length);
    };

    const setFlowToPlan = () => {
        setSteps([
            ...baseSteps,
            { label: "Lista pianificazioni", component: <PostScheduleList /> },
        ]);
        setStep(baseSteps.length);
        setMaxStep(baseSteps.length);
    };

    const resetFlow = () => {
        setStep(0);
        setMaxStep(0);
        setContentPost("");
        setSelectedFile(null);
        setSteps(baseSteps); // reinicia com os steps iniciais
    }

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
                selectedFile,
                setSelectedFile,
                steps,
                resetFlow
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
