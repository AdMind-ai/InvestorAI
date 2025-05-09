// GlobalContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchCompanyInfo } from "../api/companyInfo"; 
import type { CompanyInfoAdm } from "../interfaces/companyInfoInterface";

interface GlobalContextType {
  companyInfoAdm: CompanyInfoAdm | null;
  // setCompanyInfoAdm: React.Dispatch<React.SetStateAction<CompanyInfoAdm | null>>;
  // ...global data
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyInfoAdm, setCompanyInfoAdm] = useState<CompanyInfoAdm | null>(null);

  useEffect(() => {
    fetchCompanyInfo().then(setCompanyInfoAdm);
  }, []);

  return (
    <GlobalContext.Provider value={{ companyInfoAdm }}>
      {children}
    </GlobalContext.Provider>
  );
};

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside GlobalProvider");
  return ctx;
}