import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchWithAuth } from "../api/fetchWithAuth";
import { toast } from "react-toastify";
import { RelatedCompany } from "../interfaces/market";
import { fetchCompetitors } from "../api/marketApi";

type Company = {
  name: string;
  stock?: string;
  website?: string;
  sectors?: string[];
};

type CompaniesShape = {
  competitors: RelatedCompany[];
  clients: RelatedCompany[];
  fornitori: RelatedCompany[];
};

const KIND_MAP: Record<string, string> = {
  competitors: "competitor",
  clients: "client",
  fornitori: "fornitori"
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
  removeCompany: (companyName: string | null, category: keyof CompaniesShape) => void;
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
  setSectorDescription: () => { },
  setKeywords: () => { },
  setLinks: () => { },
  setEmail: () => { },
  setPreferences: () => { },
  addCompany: () => false,
  removeCompany: () => { },
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

  const fetchRalatedCompanies = async () => {
    const companies = await fetchCompetitors();

    const companiesByKind: {
      competitors: RelatedCompany[];
      clients: RelatedCompany[];
      fornitori: RelatedCompany[];
    } = {
      competitors: [],
      clients: [],
      fornitori: [],
    };

    companies.forEach((c) => {
      if (c.kind === "competitor") companiesByKind.competitors.push(c);
      else if (c.kind === "client") companiesByKind.clients.push(c);
      else if (c.kind === "fornitori") companiesByKind.fornitori.push(c);
    });

    setCompanies(companiesByKind);
  };

  const addCompany = (category: keyof CompaniesShape, company: Company) => {
    if (!company?.name || totalCompanies() >= 20) return false;

    try {
      const formData = new FormData();
      formData.append('name', company.name);
      if (company.stock) formData.append('stock_symbol', company.stock);
      if (company.website) formData.append('website', company.website);
      if (company.sectors) formData.append('sectors', JSON.stringify(company.sectors));
      formData.append('kind', KIND_MAP[category]);

      fetchWithAuth('/openai/competitors-search/', {
        method: 'POST',
        body: formData,
      }).then(async (response) => {
        if (response.status === 200) {
          toast.success("Competitor aggiunto/aggiornato con successo!");
          fetchRalatedCompanies();

        } else {
          const resp = await response.json();
          toast.error(resp?.error ?? "Errore nell'aggiungere il concorrente");
          return false;
        }
      });

    } catch (e) {
      toast.error("Errore nell'aggiungere il concorrente");
      console.error(e);
      return false;
    }

    return true;
  };

  const removeCompany = async (companyName: string | null, category: keyof CompaniesShape) => {
    if (!companyName) return;

    try {
      const response = await fetchWithAuth("/openai/competitors-search/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          kind: KIND_MAP[category],
        }),
      });

      if (response.status === 200) {
        toast.success(`${category.slice(0, -1)} "${companyName}" eliminato con successo!`);
        fetchRalatedCompanies(); // atualiza lista
      } else {
        const resp = await response.json();
        toast.error(resp?.error ?? "Errore nella cancellazione");
      }
    } catch (e) {
      console.error(e);
      toast.error("Errore nella cancellazione");
    } finally {
    }
  };

  useEffect(() => {
    fetchRalatedCompanies();
  }, []);

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
