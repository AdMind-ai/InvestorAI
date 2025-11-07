import { useEffect } from "react";
import WelcomeCard from "../components/MarketIntelligence/WelcomeCard";
import CustomizeSectorModal from "../components/MarketIntelligence/CustomizeSectorModal";
import CompaniesModal from "../components/MarketIntelligence/CompaniesModal";
import EmailModal from "../components/MarketIntelligence/EmailModal";
import MarketIntelligenceLoading from "../components/MarketIntelligence/MarketIntelligenceLoading";
import MarketIntelligenceResults from "../components/MarketIntelligence/MarketIntelligenceResults";
import Layout from "../layouts/Layout";
import { useMarketIntelligence } from "../context/MarketIntelligenceContext";
import { Box, CircularProgress } from "@mui/material";

const FlowContent = () => {
    // step: 0=welcome,1=customize,2=companies,3=email,4=loading,5=results
    const { step, initializingStep, setStep, open, setOpen, runPostEmailFlow, reconfigureMode, setReconfigureMode, } = useMarketIntelligence();

    useEffect(() => {
        if (Number.isNaN(step)) setStep(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (initializingStep) {
        return (
            <Box sx={{ width: '100%', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            {/* Initial onboarding flow only shown before first configuration (step < 5 and not reconfiguring) */}
            {!reconfigureMode && step === 0 && (
                <Box>
                    <WelcomeCard onStart={() => { setOpen(true); setStep(1); }} />
                </Box>
            )}
            <CustomizeSectorModal
                open={open && step === 1}
                onClose={() => { setOpen(false); setReconfigureMode(false); setStep(5); }}
                onNext={() => { setOpen(true); setStep(2); }}
                onBack={() => { setOpen(true); setStep(0); }}
            />
            <CompaniesModal
                open={open && step === 2}
                onClose={() => { setOpen(false); setReconfigureMode(false); setStep(5); }}
                onNext={() => { setOpen(true); setStep(3); }}
                onBack={() => { setOpen(true); setStep(1); }}
            />
            <EmailModal
                open={open && step === 3}
                onClose={() => { setOpen(false); setReconfigureMode(false); setStep(5); }}
                onNext={async () => {
                    // Go to loading and run the full flow (update sector + trigger tasks + wait)
                    
                    // Normal flow
                    if(!reconfigureMode){
                        setOpen(true);
                        setStep(4);
                    } else {
                        setStep(5);
                    }
                    const ok = await runPostEmailFlow();
                    if (ok) {
                        setOpen(true);
                        setReconfigureMode(false);
                        setStep(5);
                    } else if(!reconfigureMode) {
                        // On any error: return to step 3
                        setOpen(true);
                        setStep(3);
                    }
                }}
                onBack={() => { setOpen(true); setStep(2); }}
            />

            {/* Loading screen that simulates backend search */}
            <MarketIntelligenceLoading open={open && step === 4} auto={false} onComplete={() => { }} />

            {/* Results screen is always visible once the user reached step 5; stays visible during reconfiguration */}
            {(step === 5 || reconfigureMode) && (
                <MarketIntelligenceResults />
            )}
        </>
    );
};

const MarketIntelligence = () => {
    return (
        <Layout>
            <FlowContent />
        </Layout>
    );
}

export default MarketIntelligence;