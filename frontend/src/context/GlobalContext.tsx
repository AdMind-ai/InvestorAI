// GlobalContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef  } from "react";
import { fetchCompanyInfo } from "../api/companyInfo"; 
import type { CompanyInfoAdm } from "../interfaces/companyInfoInterface";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../api/fetchWithAuth";

interface GlobalContextType {
  companyInfoAdm: CompanyInfoAdm | null;
  awaitingDeepResponse: AwaitingDeepResponseType | null;
  setAwaitingDeepResponse: React.Dispatch<React.SetStateAction<AwaitingDeepResponseType | null>>;
}

interface AwaitingDeepResponseType {
  conversationId: string | number;
  messageId: string | number;
  placeholderText: string;
  chatName: string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyInfoAdm, setCompanyInfoAdm] = useState<CompanyInfoAdm | null>(null);
  const [awaitingDeepResponse, setAwaitingDeepResponse] = useState<AwaitingDeepResponseType | null>(null);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCompanyInfo().then(setCompanyInfoAdm);
  }, []);

  // Polling para Deep Research
  useEffect(() => {
    if (!awaitingDeepResponse) return;
    pollingInterval.current = setInterval(async () => {
      try {
        const resp = await fetchWithAuth(`/openai/chat/${awaitingDeepResponse.conversationId}/`);
        if (!resp.ok) return;
        const data = await resp.json();
        const messages = data.messages || [];
        const msg = messages.find(
          (m: any) => String(m.id) === String(awaitingDeepResponse.messageId)
        );
        if (msg && msg.content && msg.content !== awaitingDeepResponse.placeholderText) {
          toast.success("La tua deep research è pronta! Chat: " + awaitingDeepResponse.chatName);
          window.dispatchEvent(
            new CustomEvent("deepResearchReady", {
              detail: {
                conversationId: awaitingDeepResponse.conversationId,
                messageId: awaitingDeepResponse.messageId,
                chatName: awaitingDeepResponse.chatName,
                content: msg.content,
                citations: msg.citations || [],
              },
            })
          );
          setAwaitingDeepResponse(null);
          if (pollingInterval.current) clearInterval(pollingInterval.current);
        }
      } catch {}
    }, 3000);
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [awaitingDeepResponse]);

  return (
    <GlobalContext.Provider value={{ companyInfoAdm, awaitingDeepResponse, setAwaitingDeepResponse }}>
      {children}
    </GlobalContext.Provider>
  );
};

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside GlobalProvider");
  return ctx;
}