import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchWithAuth } from "../api/fetchWithAuth";
import { toast } from "react-toastify";
import { RelatedCompany } from "../interfaces/market";
import { fetchCompetitors, fetchMarketOverview, fetchMarketSummaries, SummaryItem } from "../api/marketApi";

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
  competitor: Preference;
  client: Preference;
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
  saveAlertPreferences: (email: string, preferences: Preferences) => Promise<boolean>;
  addCompany: (category: keyof CompaniesShape, company: Company) => boolean; // returns true if added
  removeCompany: (companyName: string | null, category: keyof CompaniesShape) => void;
  totalCompanies: () => number;
  // Summaries state
  summaries: SummaryItem[];
  summariesTotal: number;
  summariesPage: number;
  summariesPageSize: number;
  summariesLoading: boolean;
  loadSummaries: (params?: { type?: keyof CompaniesShape | 'sector'; page?: number; pageSize?: number; category?: string; relevance?: 'high' | 'medium' | 'low' }) => Promise<void>;
  // News state (moved here)
  newsArticles: Array<{ title: string; url?: string; type?: string; category: string; relevance: 'high' | 'medium' | 'low' | ''; date_published: string; created_at?: string; }>;
  newsLoading: boolean;
  setNews: React.Dispatch<React.SetStateAction<MarketIntelligenceState['newsArticles']>>;
  setNewsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadNews: (category: 'Settore' | 'Competitors' | 'Clienti' | 'Fornitori') => Promise<void>;
  // Overview Report
  overviewReport?: string;
  citations: string[];
};

const defaultState: MarketIntelligenceState = {
  sectorDescription: "",
  keywords: [],
  links: [],
  companies: { competitors: [], clients: [], fornitori: [] },
  preferences: {
    sector: { enabled: true, relevance: 'high' },
    competitor: { enabled: true, relevance: 'high' },
    client: { enabled: true, relevance: 'high' },
    fornitori: { enabled: true, relevance: 'high' },
  },
  email: "",
  setSectorDescription: () => { },
  setKeywords: () => { },
  setLinks: () => { },
  setEmail: () => { },
  setPreferences: () => { },
  saveAlertPreferences: async () => false,
  addCompany: () => false,
  removeCompany: () => { },
  totalCompanies: () => 0,
  summaries: [],
  summariesTotal: 0,
  summariesPage: 1,
  summariesPageSize: 8,
  summariesLoading: false,
  loadSummaries: async () => { },
  newsArticles: [],
  newsLoading: false,
  setNews: () => { },
  setNewsLoading: () => { },
  loadNews: async () => { },
  overviewReport: "",
  citations: [],
};

const MarketIntelligenceContext = createContext<MarketIntelligenceState>(defaultState);

export const MarketIntelligenceProvider = ({ children }: { children: ReactNode }) => {
  const [sectorDescription, setSectorDescription] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [companies, setCompanies] = useState<CompaniesShape>({ competitors: [], clients: [], fornitori: [] });
  const [preferences, setPreferences] = useState<Preferences>({
    sector: { enabled: true, relevance: 'high' },
    competitor: { enabled: true, relevance: 'high' },
    client: { enabled: true, relevance: 'high' },
    fornitori: { enabled: true, relevance: 'high' },
  });
  const [email, setEmail] = useState<string>("");
  // Summaries
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);
  const [summariesTotal, setSummariesTotal] = useState<number>(0);
  const [summariesPage, setSummariesPage] = useState<number>(1);
  const [summariesPageSize, setSummariesPageSize] = useState<number>(8);
  const [summariesLoading, setSummariesLoading] = useState<boolean>(false);
  // News
  const [newsArticles, setNews] = useState<MarketIntelligenceState['newsArticles']>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(false);
  // Overview Report
  const [overviewReport, setOverviewReport] = useState<string>("");
  const [citations, setCitations] = useState<string[]>([]);


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

  function citeLinks(text: string, citations: string[]): string {
    return text.replace(/\[(\d+)\]/g, (match: string, num: string): string => {
      const citationIndex = parseInt(num, 10) - 1;
      if (citationIndex >= 0 && citationIndex < citations.length) {
        const citationLink: string = citations[citationIndex];
        return ` [[${num}]](${citationLink})`;
      }
      return match;
    });
  }

  useEffect(() => {
    fetchRalatedCompanies();
    fetchMarketOverview().then(({ report, citations }) => {
      const thinkTagMatch = /<think>[\s\S]*?<\/think>/g;
      let reportContent = report.replace(thinkTagMatch, '');
      reportContent = citeLinks(reportContent, citations);

      setOverviewReport(reportContent);
      setCitations(citations);
    });
  }, []);

  const loadSummaries: MarketIntelligenceState['loadSummaries'] = async (params) => {
    try {
      setSummariesLoading(true);
      const apiParams = {
        type: params?.type === 'sector' ? 'sector' : (params?.type ? String(params.type) as any : undefined),
        page: params?.page ?? summariesPage,
        page_size: params?.pageSize ?? summariesPageSize,
        category: params?.category,
        relevance: params?.relevance,
      };
      const res = await fetchMarketSummaries(apiParams);
      setSummaries(res.results);
      setSummariesTotal(res.total);
      setSummariesPage(res.page);
      setSummariesPageSize(res.page_size);
    } catch (e) {
      console.error('Erro ao carregar summaries', e);
      setSummaries([]);
      setSummariesTotal(0);
    } finally {
      setSummariesLoading(false);
    }
  };

  const CATEGORY_MAP: Record<string, string> = {
    "Settore": "sector",
    "Competitors": "competitor", // model values are singular for news
    "Clienti": "client",
    "Fornitori": "fornitori",
  };

  const loadNews: MarketIntelligenceState['loadNews'] = async (category) => {
    setNewsLoading(true);
    try {
      const params = new URLSearchParams({ type: CATEGORY_MAP[category] });
      const response = await fetchWithAuth(`/newsapi/market-news/?${params}`, { method: 'GET' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setNews(data.articles || []);
    } catch (e) {
      console.error('Erro ao carregar notícias', e);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const saveAlertPreferences: MarketIntelligenceState['saveAlertPreferences'] = async (emailToSave, prefsToSave) => {
    try {
      const res = await fetchWithAuth('/market-alert-preferences/', {
        method: 'POST',
        body: JSON.stringify({ email: emailToSave, preferences: prefsToSave }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        toast.error(err?.detail || 'Erro ao salvar preferenze');
        return false;
      }
      toast.success('Preferenze salvate');
      setEmail(emailToSave);
      setPreferences(prefsToSave);
      return true;
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar preferenze');
      return false;
    }
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
        saveAlertPreferences,
        addCompany,
        removeCompany,
        totalCompanies,
        summaries,
        summariesTotal,
        summariesPage,
        summariesPageSize,
        summariesLoading,
        loadSummaries,
        newsArticles,
        newsLoading,
        setNews,
        setNewsLoading,
        loadNews,
        overviewReport,
        citations,
      }}
    >
      {children}
    </MarketIntelligenceContext.Provider>
  );
};

export const useMarketIntelligence = () => useContext(MarketIntelligenceContext);

export default MarketIntelligenceContext;
