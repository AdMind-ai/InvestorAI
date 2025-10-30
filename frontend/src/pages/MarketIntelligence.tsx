import { useState } from "react";
import { MarketIntelligenceProvider } from "../context/MarketIntelligenceContext";
import WelcomeModal from "../components/MarketIntelligence/WelcomeModal";
import CustomizeSectorModal from "../components/MarketIntelligence/CustomizeSectorModal";
import CompaniesModal from "../components/MarketIntelligence/CompaniesModal";
import EmailModal from "../components/MarketIntelligence/EmailModal";
import MarketIntelligenceLoading from "../components/MarketIntelligence/MarketIntelligenceLoading";
import MarketIntelligenceResults from "../components/MarketIntelligence/MarketIntelligenceResults";
import Layout from "../layouts/Layout";

const MarketIntelligence = () => {
    // step: 0=welcome,1=customize,2=companies,3=email,4=loading,5=results,6=closed
    const [step, setStep] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(true);

    const closeAll = () => {
        setOpen(false);
        setStep(6);
    };

    return (
        <Layout>
            <MarketIntelligenceProvider>
                <>
                    <WelcomeModal open={open && step === 0} onClose={() => setOpen(false)} onNext={() => { setOpen(true); setStep(1); }} />
                    <CustomizeSectorModal
                        open={open && step === 1}
                        onClose={() => setOpen(false)}
                        onNext={() => { setOpen(true); setStep(2); }}
                        onBack={() => { setOpen(true); setStep(0); }}
                    />
                    <CompaniesModal
                        open={open && step === 2}
                        onClose={() => setOpen(false)}
                        onNext={() => { setOpen(true); setStep(3); }}
                        onBack={() => { setOpen(true); setStep(1); }}
                    />
                    <EmailModal
                        open={open && step === 3}
                        onClose={() => setOpen(false)}
                        onNext={() => { setOpen(true); setStep(4); }}
                        onBack={() => { setOpen(true); setStep(2); }}
                    />

                    {/* Loading screen that simulates backend search */}
                    <MarketIntelligenceLoading
                        open={open && step === 4}
                        onComplete={() => { setOpen(true); setStep(5); }}
                    />

                    {/* Results screen (mock for now) */}
                    {step === 5 && (
                        <MarketIntelligenceResults />
                    )}
                </>
            </MarketIntelligenceProvider>
        </Layout>
    );
}

export default MarketIntelligence;