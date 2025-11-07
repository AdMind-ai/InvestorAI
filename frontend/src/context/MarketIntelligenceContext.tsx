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
  // UI flow control across navigation
  step: number;
  open: boolean;
  setStep: (s: number) => void;
  setOpen: (v: boolean) => void;
  // When true, user is re-running the configuration while keeping results visible
  reconfigureMode: boolean;
  setReconfigureMode: (v: boolean) => void;
  initializingStep: boolean;
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
  // Orchestrated setup/tasks
  updateCompanySector: () => Promise<boolean>;
  startMarketTasksAndWait: () => Promise<{ sectorStatus: string; competitorsStatus: string }>;
  runPostEmailFlow: () => Promise<boolean>;
  // Summaries state
  summaries: SummaryItem[];
  summariesTotal: number;
  summariesPage: number;
  summariesPageSize: number;
  summariesLoading: boolean;
  loadSummaries: (params?: { type?: 'sector' | 'competitor' | 'client' | 'fornitori'; page?: number; pageSize?: number; category?: string; relevance?: 'high' | 'medium' | 'low' }) => Promise<void>;
  // News state (moved here)
  newsArticles: Array<{ title: string; url?: string; type?: string; category: string; relevance: 'high' | 'medium' | 'low' | ''; date_published: string; created_at?: string; }>;
  newsLoading: boolean;
  setNews: React.Dispatch<React.SetStateAction<MarketIntelligenceState['newsArticles']>>;
  setNewsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadNews: (category: 'Settore' | 'Competitors' | 'Clienti' | 'Fornitori') => Promise<void>;
  // Overview Report
  overviewReport?: string;
  citations: string[];
  // Loaders (used when reconfiguring to prefill forms)
  loadCompanySectorInfo?: () => Promise<void>;
  loadAlertPreferencesFromDB?: () => Promise<void>;
};

const defaultState: MarketIntelligenceState = {
  step: 0,
  open: true,
  setStep: () => { },
  setOpen: () => { },
  reconfigureMode: false,
  setReconfigureMode: () => { },
  initializingStep: true,
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
  updateCompanySector: async () => false,
  startMarketTasksAndWait: async () => ({ sectorStatus: 'PENDING', competitorsStatus: 'PENDING' }),
  runPostEmailFlow: async () => false,
  summaries: [],
  summariesTotal: 0,
  summariesPage: 1,
  summariesPageSize: 6,
  summariesLoading: false,
  loadSummaries: async () => { },
  newsArticles: [],
  newsLoading: false,
  setNews: () => { },
  setNewsLoading: () => { },
  loadNews: async () => { },
  overviewReport: "",
  citations: [],
  loadCompanySectorInfo: async () => { },
  loadAlertPreferencesFromDB: async () => { },
};

const MarketIntelligenceContext = createContext<MarketIntelligenceState>(defaultState);

export const MarketIntelligenceProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(true);
  const [reconfigureMode, setReconfigureMode] = useState<boolean>(false);
  const [initializingStep, setInitializingStep] = useState<boolean>(true);
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
  const [summariesPageSize, setSummariesPageSize] = useState<number>(6);
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
    // Skip any authenticated calls if there's no access token (e.g., on login page)
    const access = localStorage.getItem('access');
    if (!access) {
      setStep(0);
      setInitializingStep(false);
      return;
    }

    // Decide initial step based on backend setup flag
    (async () => {
      try {
        const res = await fetchWithAuth('/company-info/marketing-setup/', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          const configured = Boolean((data && (data.is_configured ?? data.isConfigured)) || false);
          setStep(configured ? 5 : 0);
        } else {
          setStep(0);
        }
      } catch {
        setStep(0);
      } finally {
        setInitializingStep(false);
      }
    })();

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
      // indicate loading and clear previous summaries immediately so UI doesn't show stale data
      setSummariesLoading(true);
      setSummaries([]);
      const apiParams = {
        type: params?.type,
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
    // indicate loading and clear previous news immediately to avoid showing stale articles
    setNewsLoading(true);
    setNews([]);
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

  // --- New: Load existing company sector info (for reconfiguration prefilling) ---
  const loadCompanySectorInfo = async () => {
    try {
      const res = await fetchWithAuth('/company-info/sector/', { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      // Serializer should expose these keys
      if (typeof data?.description === 'string') setSectorDescription(data.description);
      if (Array.isArray(data?.sector_keywords)) setKeywords(data.sector_keywords as string[]);
      if (Array.isArray(data?.sector_websites)) setLinks(data.sector_websites as string[]);
    } catch (e) {
      console.error('Erro ao carregar informações de setor', e);
    }
  };

  // --- New: Load saved alert preferences + email (for reconfiguration prefilling) ---
  const loadAlertPreferencesFromDB = async () => {
    try {
      const res = await fetchWithAuth('/market-alert-preferences/', { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      // API returns a list grouped by email or a single object if email filter provided
      const entry = Array.isArray(data) ? (data[0] || null) : (data ?? null);
      if (!entry) return;
      if (typeof entry.email === 'string') setEmail(entry.email);
      const prefs = entry.preferences;
      if (prefs && typeof prefs === 'object') {
        setPreferences((prev) => ({
          sector: { enabled: Boolean(prefs.sector?.enabled ?? prev.sector.enabled), relevance: (prefs.sector?.relevance ?? prev.sector.relevance) },
          competitor: { enabled: Boolean(prefs.competitor?.enabled ?? prev.competitor.enabled), relevance: (prefs.competitor?.relevance ?? prev.competitor.relevance) },
          client: { enabled: Boolean(prefs.client?.enabled ?? prev.client.enabled), relevance: (prefs.client?.relevance ?? prev.client.relevance) },
          fornitori: { enabled: Boolean(prefs.fornitori?.enabled ?? prev.fornitori.enabled), relevance: (prefs.fornitori?.relevance ?? prev.fornitori.relevance) },
        }));
      }
    } catch (e) {
      console.error('Erro ao carregar preferências de alerta', e);
    }
  };

  const saveAlertPreferences: MarketIntelligenceState['saveAlertPreferences'] = async (emailToSave, prefsToSave) => {
    try {
      const res = await fetchWithAuth('/market-alert-preferences/', {
        method: 'POST',
        body: JSON.stringify({ email: emailToSave, preferences: prefsToSave }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as Record<string, unknown>));
        toast.error(err?.detail || 'Errore durante il salvataggio delle preferenze');
        return false;
      }
      setEmail(emailToSave);
      setPreferences(prefsToSave);
      return true;
    } catch (e) {
      console.error(e);
      toast.error('Errore durante il salvataggio delle preferenze');
      return false;
    }
  };

  // helper to register that the setup is configured (or revert on error)
  const registerMarketingSetup = async (configured: boolean) => {
    try {
      const res = await fetchWithAuth('/company-info/marketing-setup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_configured: configured }),
      });
      return res.ok;
    } catch (e) {
      console.error('Erro ao registrar setup de marketing', e);
      return false;
    }
  };

  // --- New: Update company sector info on backend ---
  const updateCompanySector: MarketIntelligenceState['updateCompanySector'] = async () => {
    try {
      const res = await fetchWithAuth('/company-info/sector/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: sectorDescription,
          sector_keywords: keywords,
          sector_websites: links,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as Record<string, unknown>));
        toast.error(err?.detail || "Errore durante l'aggiornamento delle informazioni di settore");
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      toast.error("Errore durante l'aggiornamento delle informazioni di settore");
      return false;
    }
  };

  // --- New: Trigger Celery tasks and wait for completion ---
  const triggerTask = async (url: string): Promise<string> => {
    const r = await fetchWithAuth(url, { method: 'POST' });
    if (!r.ok) {
      const err = await r.json().catch(() => ({} as Record<string, unknown>));
      throw new Error(err?.detail || `Falha ao iniciar task em ${url}`);
    }
    const data = await r.json();
    if (!data?.task_id) throw new Error('task_id não retornado');
    return data.task_id as string;
  };

  const pollTaskStatus = async (statusUrl: string, { intervalMs = 3000, maxWaitMs = 3 * 60 * 1000 } = {}) => {
    const start = Date.now();
    // Keep polling until SUCCESS/FAILURE/REVOKED or timeout
    while (true) {
      const r = await fetchWithAuth(statusUrl, { method: 'GET' });
      if (r.ok) {
        const data = await r.json();
        const st = String(data?.status || '').toUpperCase();
        if (['SUCCESS', 'FAILURE', 'REVOKED'].includes(st)) return st;
      }
      if (Date.now() - start >= maxWaitMs) return 'TIMEOUT';
      await new Promise(res => setTimeout(res, intervalMs));
    }
  };

  const startMarketTasksAndWait: MarketIntelligenceState['startMarketTasksAndWait'] = async () => {
    try {
      // 1) Sector first
      const sectorTaskId = await triggerTask('/market-sector-news/company/');
      const sectorStatus = await pollTaskStatus(`/market-sector-news/status/${sectorTaskId}/`);

      // 2) Then competitors, only after sector finished (regardless of success)
      const competitorsTaskId = await triggerTask('/market-competitors-news/company/');
      const competitorsStatus = await pollTaskStatus(`/market-competitors-news/status/${competitorsTaskId}/`);

      return { sectorStatus, competitorsStatus };
    } catch (e) {
      console.error(e);
      toast.error("Errore durante l'avvio delle attività di raccolta notizie.");
      return { sectorStatus: 'ERROR', competitorsStatus: 'ERROR' };
    }
  };

  // --- New: Full flow after email preferences are saved ---
  const runPostEmailFlow: MarketIntelligenceState['runPostEmailFlow'] = async () => {
    // 0) mark setup as configured before starting tasks
    const registeredSetup = await registerMarketingSetup(true);

    try {
      if (reconfigureMode && registeredSetup) {
        toast.success('Configurazioni aggiornate. Le notizie si aggiorneranno a breve secondo le preferenze scelte.');
      } else {
        toast.info('Inizio raccolta notizie...');
      }

      // move UI to loading and persist
      if (!reconfigureMode) {
        setStep(4);
      }

      // 0.5) Capture current summaries baseline to ensure we wait for NEW summaries
      const getTotal = async (type: 'sector' | 'competitor') => {
        try {
          const res = await fetchMarketSummaries({ type, page: 1, page_size: 1 });
          return Number(res?.total || 0);
        } catch {
          return 0;
        }
      };
      const baseline = {
        sector: await getTotal('sector'),
        competitor: await getTotal('competitor'),
      };
      // 1) Update company sector info
      const updated = await updateCompanySector();
      if (!updated) throw new Error('Falha ao atualizar setor');

      // 2) Trigger tasks and wait
      const { sectorStatus, competitorsStatus } = await startMarketTasksAndWait();

      // If any task clearly failed, mark as not configured
      const success = sectorStatus === 'SUCCESS' && competitorsStatus === 'SUCCESS';
      if (!success && !reconfigureMode) {
        await registerMarketingSetup(false);
      } else {
        // 3) Wait for summaries (MI03) to be persisted after MI01/MI02
        // We'll poll for increases over the baseline for both sector and competitor.
        const deadline = Date.now() + 10 * 60 * 1000; // up to 10 minutes
        const intervalMs = 4000;
        let sectorOk = false;

        while (Date.now() < deadline) {
          try {
            const [nowSector] = await Promise.all([
              fetchMarketSummaries({ type: 'sector', page: 1, page_size: 1 }).then(r => Number(r?.total || 0)).catch(() => 0),
            ]);

            sectorOk = nowSector > baseline.sector || baseline.sector > 0; // if there were already summaries, consider OK

            if (sectorOk) break;
          } catch {/* ignore single failures */ }
          await new Promise(res => setTimeout(res, intervalMs));
        }

        // Preload summaries so the results page has data
        try { await loadSummaries(); } catch { /* ignore */ }

        setStep(5);
        toast.success('Raccolta di notizie completata con successo.');
        return true;
      }
    } catch (e) {
      console.error(e);
      if(!reconfigureMode){
        await registerMarketingSetup(false);
        setStep(3);
        toast.error('Impossibile avviare la raccolta delle notizie.');
      }

      return false;
    }
    return false;
  };

  return (
    <MarketIntelligenceContext.Provider
      value={{
        step,
        open,
        setStep,
        setOpen,
        reconfigureMode,
        setReconfigureMode,
        initializingStep,
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
        updateCompanySector,
        startMarketTasksAndWait,
        runPostEmailFlow,
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
        loadCompanySectorInfo,
        loadAlertPreferencesFromDB,
      }}
    >
      {children}
    </MarketIntelligenceContext.Provider>
  );
};

export const useMarketIntelligence = () => useContext(MarketIntelligenceContext);

export default MarketIntelligenceContext;
