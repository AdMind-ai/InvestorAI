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
  isNewFunctionalities: boolean;
  setIsNewFunctionalities: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ApiMessage {
  id: number|string;
  conversation: string;
  content: string;
  file: string | null;
  created_at: string;
  is_user: boolean;
  citations?: string[];
}

interface AwaitingDeepResponseType {
  conversationId: string | number;
  messageId: string | number;
  placeholderText: string;
  chatName: string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNewFunctionalities, setIsNewFunctionalities] = useState<boolean>(false);
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
        const messages: ApiMessage[] = data.messages || [];
        const msg = messages.find((m) => String(m.id) === String(awaitingDeepResponse.messageId));
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
      } catch {console.error("Error fetching deep research response");}
    }, 3000);
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [awaitingDeepResponse]);

  useEffect(() => {
    if (!isNewFunctionalities) return;
  }, [isNewFunctionalities]);

  return (
    <GlobalContext.Provider 
      value={{ 
        companyInfoAdm, 
        awaitingDeepResponse, 
        setAwaitingDeepResponse,
        isNewFunctionalities,
        setIsNewFunctionalities 
      }}>
      {children}
    </GlobalContext.Provider>
  );
};

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside GlobalProvider");
  return ctx;
}