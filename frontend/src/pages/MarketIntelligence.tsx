import { useState } from "react";
import { MarketIntelligenceProvider } from "../context/MarketIntelligenceContext";
import WelcomeModal from "../components/MarketIntelligence/WelcomeModal";
import CustomizeSectorModal from "../components/MarketIntelligence/CustomizeSectorModal";
import CompaniesModal from "../components/MarketIntelligence/CompaniesModal";
import EmailModal from "../components/MarketIntelligence/EmailModal";
import Layout from "../layouts/Layout";

const MarketIntelligence = () => {
    // step: 0 = welcome, 1 = customize sector, 2 = companies, 3 = done
    const [step, setStep] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(true);

    const closeAll = () => {
        setOpen(false);
        setStep(4);
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
                        onNext={() => { closeAll(); }}
                        onBack={() => { setOpen(true); setStep(2); }}
                    />
                </>
            </MarketIntelligenceProvider>
        </Layout>
    );
}

export default MarketIntelligence;