import { useState, useEffect } from "react";
import { Box, Typography, Stack, ToggleButton, ToggleButtonGroup, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import MarketOverviewReport from "./MarketOverviewReport";
import NewsTable from "./Results/NewsTable";
import { useMarketIntelligence } from "../../context/MarketIntelligenceContext";
import SummaryCard from "./Summary/SummaryCard";
import SummaryDetailsModal from "./SummaryDetailsModal";
import PaginationControls from "../common/PaginationControls";

type Category = 'Settore' | 'Competitors' | 'Clienti' | 'Fornitori';

const CATEGORY_MAP: Record<string, string> = {
    "Settore": "sector",
    "Competitors": "competitor", // model values are singular
    "Clienti": "client",
    "Fornitori": "fornitori"
};

export default function MarketIntelligenceResults() {
    const messageOfDescription =
        "Market Intelligence raccoglie le notizie più rilevanti del settore e dei competitor e propone report sintetici con indicatori chiave. Una guida efficace per individuare trend emergenti, opportunità e rischi e prendere decisioni strategiche tempestive.";

    const {
        summaries, summariesLoading, loadSummaries, summariesTotal, summariesPageSize,
        newsArticles, newsLoading, loadNews
    } = useMarketIntelligence();
    const [error, setError] = useState<string | null>(null);

    const [category, setCategory] = useState<Category>("Settore");
    type TabKey = 'summary' | 'news' | 'overview';
    const [tab, setTab] = useState<TabKey>('summary');
    const [page, setPage] = useState<number>(1);
    const [columnCategoryFilter, setColumnCategoryFilter] = useState<string>("Tutte");

    const itemsPerPage = 9;
    const categories = ["Settore", "Competitors", "Clienti", "Fornitori"];

    // 🧠 Busca inicial de notícias e resumos via contexto
    useEffect(() => {
        setError(null);
        loadNews(category);
        loadSummaries({ type: CATEGORY_MAP[category] as any, page: 1, pageSize: 8 });
        setPage(1);
    }, [category]);

    const handleCategory = (_: React.MouseEvent<HTMLElement>, val: Category | null) => {
        if (val) {
            setCategory(val);
            setPage(1);
            setColumnCategoryFilter("Tutte");
        }
    };

    const handleTab = (_: React.MouseEvent<HTMLElement>, v: TabKey | null) => {
        if (v) setTab(v);
    };

    // 🔎 Filtros (cliente-side)
    const filteredByTop = newsArticles.filter((m) =>
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

    // Summary pagination uses backend totals
    const summaryTotalPages = Math.max(1, Math.ceil((summariesTotal || 0) / summariesPageSize));
    const handleSummaryPageChange = (p: number) => {
        setPage(p);
        loadSummaries({ type: CATEGORY_MAP[category] as any, page: p, pageSize: summariesPageSize });
    };

    const [summaryModal, setSummaryModal] = useState<{ open: boolean; title?: string; description?: string; category?: string; links: string[] }>({ open: false, links: [] });

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

            {/* Tabs-like segmented control + content box */}
            <Box sx={{ px: 4, mt: 1 }}>
                <Stack direction="row" alignItems="center">
                    <ToggleButtonGroup
                        value={tab}
                        exclusive
                        onChange={handleTab}
                        size="small"
                        sx={{
                            bgcolor: "transparent",
                            gap: 2,
                            '& .MuiToggleButtonGroup-grouped': {
                                borderRadius: 2,
                                border: 'none',
                                textTransform: 'none',
                                padding: '8px 18px',
                                fontSize: '16px',
                                backgroundColor: '#FFFFFF',
                                '&.Mui-selected': {
                                    border: '1px solid #E5E7EB',
                                    backgroundColor: '#FFFFFF',
                                    borderBottomColor: 'transparent',
                                    position: 'relative',
                                    zIndex: 1,
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        // Extend slightly beyond the button edges to cover any anti-aliasing gaps
                                        left: -3,
                                        right: -3,
                                        bottom: -1,
                                        height: 7,
                                        // Round the bottom corners to blend into the panel's top edge
                                        borderBottomLeftRadius: 12,
                                        borderBottomRightRadius: 12,
                                        backgroundColor: '#FFFFFF',
                                        pointerEvents: 'none'
                                    }
                                },
                            },
                        }}
                    >
                        <ToggleButton value="summary">Riassunti</ToggleButton>
                        <ToggleButton value="news">Notizie</ToggleButton>
                        <ToggleButton value="overview">Overview</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                {/* Content box visually attached to the selected tab */}
                <Box sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 3,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    p: 2,
                    bgcolor: '#fff',
                    position: 'relative',
                    mt: -1,
                }}>
                    {(newsLoading || summariesLoading) && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {tab === 'summary' && (
                        <Box sx={{ p: 2, width: "100%" }}>
                            <Grid container spacing={2}>
                                {summaries.map((s) => (
                                    <Grid key={s.id} size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 4 }}>
                                        <SummaryCard
                                            title={s.title}
                                            description={s.description}
                                            relevance={s.relevance}
                                            category={s.category}
                                            onViewLinks={() => setSummaryModal({ open: true, links: s.sources || [], title: s.title, description: s.description, category: s.category })}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            <PaginationControls
                                count={summaryTotalPages}
                                page={page}
                                onChange={handleSummaryPageChange}
                                containerSx={{ mt: 3 }}
                            />

                            <SummaryDetailsModal
                                open={summaryModal.open}
                                onClose={() => setSummaryModal({ open: false, links: [] })}
                                title={summaryModal.title || ""}
                                description={summaryModal.description || ""}
                                category={summaryModal.category || ""}
                                links={summaryModal.links}
                            />
                        </Box>
                    )}

                    {tab === 'news' && (
                        <Box sx={{ px: 2, width: "100%" }}>
                            {error && <Typography color="error">{error}</Typography>}
                            {!newsLoading && !error && (
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

                    {tab === 'overview' && (
                        <Box sx={{ px: 2, width: "100%" }}>
                            <p>development overview</p>
                        </Box>
                    )}
                </Box>
            </Box>



            <Box sx={{ display: "flex", p: 4 }}>
                <MarketOverviewReport />
            </Box>
        </Box>
    );
}
