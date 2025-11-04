import { useState, useEffect } from "react";
import { Box, Typography, Stack, ToggleButton, ToggleButtonGroup, Tabs, Tab, CircularProgress } from "@mui/material";
import MarketOverviewReport from "./MarketOverviewReport";
import NewsTable from "./Results/NewsTable";
import { fetchWithAuth } from "../../api/fetchWithAuth";

type Article = {
    id?: number;
    company?: string;
    type?: string;
    title: string;
    url?: string;
    category: string;
    relevance: 'high' | 'medium' | 'low' | '';
    date_published: string; // ISO
    created_at?: string;
};

const CATEGORY_MAP: Record<string, string> = {
    "Settore": "sector",
    "Competitors": "competitor",
    "Clienti": "client",
    "Fornitori": "fornitori"
};

export default function MarketIntelligenceResults() {
    const messageOfDescription =
        "Market Intelligence raccoglie le notizie più rilevanti del settore e dei competitor e propone report sintetici con indicatori chiave. Una guida efficace per individuare trend emergenti, opportunità e rischi e prendere decisioni strategiche tempestive.";

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [category, setCategory] = useState<string>("Settore");
    const [tab, setTab] = useState<number>(1);
    const [page, setPage] = useState<number>(1);
    const [columnCategoryFilter, setColumnCategoryFilter] = useState<string>("Tutte");

    const itemsPerPage = 9;
    const categories = ["Settore", "Competitors", "Clienti", "Fornitori"];

    // 🧠 Busca inicial de notícias
    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    type: CATEGORY_MAP[category],
                });
                const response = await fetchWithAuth(`/newsapi/market-news/?${params}`, {
                    method: "GET"
                });

                if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
                const data = await response.json();

                setArticles(data.articles || []);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error("Erro ao buscar notícias:", err);
                    setError("Erro ao carregar notícias.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [category]);

    const handleCategory = (_: React.MouseEvent<HTMLElement>, val: string | null) => {
        if (val) {
            setCategory(val);
            setPage(1);
            setColumnCategoryFilter("Tutte");
        }
    };

    const handleTab = (_: React.SyntheticEvent, v: number) => {
        setTab(v);
    };

    // 🔎 Filtros (cliente-side)
    const filteredByTop = articles.filter((m) =>
        category === "Settore"
            ? true
            : m.type?.toLowerCase() === CATEGORY_MAP[category]?.toLowerCase()
    );


    const filtered = filteredByTop.filter((m) =>
        columnCategoryFilter === "Tutte" ? true : m.category === columnCategoryFilter
    );

    const distinctCategories = Array.from(new Set(filteredByTop.map((f) => f.category)));

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages]);

    const pagedArticles = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", overflow: "auto", height: "100%", width: "100%" }}>
            {/* Title */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: "0.2vw", p: "calc(3vh)" }}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Typography variant="h2" sx={{ mb: "0.2vw", ml: "1vw" }}>
                        Market Intelligence
                    </Typography>
                </Box>
            </Box>

            <Typography variant="subtitle1" sx={{ px: 4.8, fontSize: "14px" }}>
                {messageOfDescription}
            </Typography>

            {/* category toggles */}
            <Box sx={{ display: "flex", alignItems: "center", m: 3 }}>
                <ToggleButtonGroup
                    value={category}
                    exclusive
                    onChange={handleCategory}
                    size="small"
                    sx={{
                        bgcolor: "transparent",
                        "& .MuiToggleButtonGroup-grouped": {
                            margin: "0 8px",
                            borderRadius: 16,
                            border: "1px solid #E5E7EB",
                            textTransform: "none",
                            padding: "6px 14px",
                            color: "#111827",
                            "&.Mui-selected": {
                                backgroundColor: "#E6F0FF",
                                boxShadow: "0 6px 14px rgba(11,95,255,0.12)",
                                color: "#0B5FFF",
                            },
                        },
                    }}
                >
                    {categories.map((c) => (
                        <ToggleButton key={c} value={c} sx={{ textTransform: "none", borderRadius: 16 }}>
                            {c}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 4 }}>
                <Stack direction="row" alignItems="center">
                    <Tabs value={tab} onChange={handleTab} aria-label="mi-tabs">
                        <Tab label="Riassunti" />
                        <Tab label="Notizie" />
                        <Tab label="Overview" />
                    </Tabs>
                </Stack>
            </Box>

            {loading &&
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 5
                }}>
                    <CircularProgress></CircularProgress>
                </Box>
            }

            {tab === 1 && (
                <Box sx={{ px: 4, width: "100%" }}>
                    {error && <Typography color="error">{error}</Typography>}
                    {!loading && !error && (
                        <NewsTable
                            articles={pagedArticles}
                            page={page}
                            onPageChange={(v) => setPage(v)}
                            pageCount={totalPages}
                            categories={distinctCategories}
                            columnFilter={columnCategoryFilter}
                            onColumnFilterChange={(v) => {
                                setColumnCategoryFilter(v);
                                setPage(1);
                            }}
                            cellFontSize={"17px"}
                        />
                    )}
                </Box>
            )}

            {tab === 0 && (
                <Box sx={{ px: 4, width: "100%" }}>
                    <p>development summary</p>
                </Box>
            )}
            {tab === 2 && (
                <Box sx={{ px: 4, width: "100%" }}>
                    <p>development overview</p>
                </Box>
            )}

            <Box sx={{ display: "flex", p: 4 }}>
                <MarketOverviewReport />
            </Box>
        </Box>
    );
}
