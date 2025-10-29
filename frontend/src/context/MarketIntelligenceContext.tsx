import { createContext, useContext, useState, ReactNode } from "react";

type Company = {
  name: string;
  stock?: string;
  website?: string;
  sectors?: string[];
};

type CompaniesShape = {
  competitors: Company[];
  clients: Company[];
  fornitori: Company[];
};

type Preference = { enabled: boolean; relevance: "high" | "medium" | "low" };
type Preferences = {
  sector: Preference;
  competitors: Preference;
  clients: Preference;
  fornitori: Preference;
};

type MarketIntelligenceState = {
  sectorDescription: string;
  keywords: string[];
  links: string[];
  companies: CompaniesShape;
  preferences: Preferences;
  email: string;
  setSectorDescription: (v: string) => void;
  setKeywords: (v: string[]) => void;
  setLinks: (v: string[]) => void;
  setEmail: (v: string) => void;
  setPreferences: (p: Preferences) => void;
  addCompany: (category: keyof CompaniesShape, company: Company) => boolean; // returns true if added
  removeCompany: (category: keyof CompaniesShape, index: number) => void;
  totalCompanies: () => number;
};

const defaultState: MarketIntelligenceState = {
  sectorDescription: "",
  keywords: [],
  links: [],
  companies: { competitors: [], clients: [], fornitori: [] },
  preferences: {
    sector: { enabled: true, relevance: 'high' },
    competitors: { enabled: true, relevance: 'high' },
    clients: { enabled: true, relevance: 'high' },
    fornitori: { enabled: true, relevance: 'high' },
  },
  email: "",
  setSectorDescription: () => {},
  setKeywords: () => {},
  setLinks: () => {},
  setEmail: () => {},
  setPreferences: () => {},
  addCompany: () => false,
  removeCompany: () => {},
  totalCompanies: () => 0,
};

const MarketIntelligenceContext = createContext<MarketIntelligenceState>(defaultState);

export const MarketIntelligenceProvider = ({ children }: { children: ReactNode }) => {
  const [sectorDescription, setSectorDescription] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [companies, setCompanies] = useState<CompaniesShape>({ competitors: [], clients: [], fornitori: [] });
  const [preferences, setPreferences] = useState<Preferences>({
    sector: { enabled: true, relevance: 'high' },
    competitors: { enabled: true, relevance: 'high' },
    clients: { enabled: true, relevance: 'high' },
    fornitori: { enabled: true, relevance: 'high' },
  });
  const [email, setEmail] = useState<string>("");

  const totalCompanies = () => companies.competitors.length + companies.clients.length + companies.fornitori.length;

  const addCompany = (category: keyof CompaniesShape, company: Company) => {
    if (!company?.name || totalCompanies() >= 20) return false;
    setCompanies((prev) => ({ ...prev, [category]: [...prev[category], company] }));
    return true;
  };

  const removeCompany = (category: keyof CompaniesShape, index: number) => {
    setCompanies((prev) => ({ ...prev, [category]: prev[category].filter((_, i) => i !== index) }));
  };

  return (
    <MarketIntelligenceContext.Provider
      value={{
        sectorDescription,
        keywords,
        links,
        companies,
        preferences,
        email,
        setSectorDescription,
        setKeywords,
        setLinks,
        setEmail,
        setPreferences,
        addCompany,
        removeCompany,
        totalCompanies,
      }}
    >
      {children}
    </MarketIntelligenceContext.Provider>
  );
};

export const useMarketIntelligence = () => useContext(MarketIntelligenceContext);

export default MarketIntelligenceContext;
