import { useState, useEffect } from "react";
import { Box, Typography, Stack, ToggleButton, ToggleButtonGroup, Tabs, Tab } from "@mui/material";
import MarketOverviewReport from "./MarketOverviewReport";
import NewsTable from "./Results/NewsTable";

type Article = {
    id: number;
    date: string; // ISO
    title: string;
    relevance: 'high' | 'medium' | 'low';
    category: string;
    url?: string;
};

const MOCK: Article[] = [
    { id: 1, date: '2025-11-10', title: 'Luigi Farris Rivoluziona il Settore Tecnologico: "Il Futuro è Ora"', relevance: 'high', category: 'Categoria 1' },
    { id: 2, date: '2025-11-10', title: 'Luigi Farris Nominato CEO dell\'Anno', relevance: 'medium', category: 'Categoria 1' },
    { id: 3, date: '2025-11-10', title: 'Investimenti Record per Luigi Farris', relevance: 'medium', category: 'Categoria 2' },
    { id: 4, date: '2025-11-10', title: 'Green Revolution: Nuovo Progetto Milionario', relevance: 'high', category: 'Categoria 2' },
    { id: 5, date: '2025-11-10', title: 'Crisi Aziendale? Prospettive e Rischi', relevance: 'low', category: 'Categoria 7' },
    { id: 6, date: '2025-11-10', title: 'Crisi Aziendale? Prospettive e Rischi', relevance: 'low', category: 'Categoria 7' },
    { id: 7, date: '2025-11-10', title: 'Crisi Aziendale? Prospettive e Rischi', relevance: 'low', category: 'Categoria 7' },
    { id: 8, date: '2025-11-10', title: 'Crisi Aziendale? Prospettive e Rischi', relevance: 'low', category: 'Categoria 7' },
    { id: 9, date: '2025-11-10', title: 'Crisi Aziendale? Prospettive e Rischi', relevance: 'low', category: 'Categoria 7' },
    { id: 10, date: '2025-11-10', title: 'Crisi Aziendale? Prospettive e Rischi', relevance: 'low', category: 'Categoria 7' },
];

// RelevanceChip and formatting are implemented inside NewsTable to keep this file focused on layout and state

export default function MarketIntelligenceResults() {
    const messageOfDescription = "Market Intelligence raccoglie le notizie più rilevanti del settore e dei competitor e propone report sintetici con indicatori chiave. Una guida efficace per individuare trend emergenti, opportunità e rischi e prendere decisioni strategiche tempestive."
    const [category, setCategory] = useState<string>('Settore');
    const [tab, setTab] = useState<number>(1); // 0: Riassunti, 1: Notizie, 2: Overview
    const [page, setPage] = useState<number>(1);
    const [columnCategoryFilter, setColumnCategoryFilter] = useState<string>('Tutte');
    const itemsPerPage = 9;

    const categories = ['Settore', 'Competitors', 'Clienti', 'Fornitori'];

    const handleCategory = (_: React.MouseEvent<HTMLElement>, val: string | null) => {
        if (val) {
            setCategory(val);
            setPage(1);
            // reset column filter when switching the main category context
            setColumnCategoryFilter('Tutte');
        }
    };

    const handleTab = (_: React.SyntheticEvent, v: number) => {
        setTab(v);
    };

    // simple client-side filter for now: match category substring (top-level) and the column filter (categoria)
    const filteredByTop = MOCK.filter(m => category === 'Settore' ? true : m.category.toLowerCase().includes(category.toLowerCase()));
    const filtered = filteredByTop.filter(m => columnCategoryFilter === 'Tutte' ? true : m.category === columnCategoryFilter);

    // distinct categories for the column filter (based on top-level filtered set)
    const distinctCategories = Array.from(new Set(filteredByTop.map(f => f.category)));

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    // ensure current page is within bounds when filtered changes
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages]);

    const pagedArticles = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                height: '100%',
                width: '100%',
            }}
        >
            {/* Title */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.2vw',
                    padding: 'calc(3vh) calc(3vh) 0 calc(3vh)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Typography variant="h2" sx={{ marginBottom: '0.2vw', marginLeft: '1vw' }}>
                        Market Intelligence
                    </Typography>
                </Box>
            </Box>

            <Typography variant='subtitle1' sx={{ px: 4.8, fontSize: '14px' }}>
                {messageOfDescription}
            </Typography>

            {/* category toggles */}
            <Box sx={{ display: 'flex', alignItems: 'center', m: 3 }}>
                <ToggleButtonGroup
                    value={category}
                    exclusive
                    onChange={handleCategory}
                    size="small"
                    sx={{
                        bgcolor: 'transparent',
                        '& .MuiToggleButtonGroup-grouped': {
                            margin: '0 8px',
                            borderRadius: 16,
                            border: '1px solid #E5E7EB',
                            textTransform: 'none',
                            padding: '6px 14px',
                            color: '#111827',
                            '&.Mui-selected': {
                                backgroundColor: '#E6F0FF',
                                boxShadow: '0 6px 14px rgba(11,95,255,0.12)',
                                color: '#0B5FFF',
                            },
                        },
                    }}
                >
                    {categories.map(c => (
                        <ToggleButton key={c} value={c} sx={{ textTransform: 'none', borderRadius: 16 }}>
                            {c}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4 }}>
                <Stack direction="row" alignItems="center">
                    <Tabs value={tab} onChange={handleTab} aria-label="mi-tabs">
                        <Tab label="Riassunti" />
                        <Tab label="Notizie" />
                        <Tab label="Overview" />
                    </Tabs>
                </Stack>
                {/* <Button
                    size="small"
                    variant="outlined"
                    aria-label="impostazioni"
                    startIcon={
                        <Box sx={{
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#fff',
                            border: 'none'
                        }}>
                            <SettingsIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                        </Box>
                    }
                    sx={{
                        textTransform: 'none',
                        borderColor: '#E5E7EB',
                        color: '#374151',
                        boxShadow: '0 6px 14px rgba(11,95,255,0.06)',
                        '&:hover': {
                            backgroundColor: '#FBFDFF',
                            borderColor: '#D1D5DB'
                        }
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontSize: '13px' }}>
                        Impostazioni settore
                    </Typography>
                </Button> */}
            </Box>
            {tab === 0 && (
                <Box sx={{ px: 4, width: '100%' }}>
                    <p>development</p>
                </Box>
            )}
            {tab === 1 && (
                <Box sx={{ px: 4, width: '100%' }}>
                    <NewsTable
                        articles={pagedArticles}
                        page={page}
                        onPageChange={(v) => setPage(v)}
                        pageCount={totalPages}
                        categories={distinctCategories}
                        columnFilter={columnCategoryFilter}
                        onColumnFilterChange={(v) => { setColumnCategoryFilter(v); setPage(1); }}
                        cellFontSize={'17px'}
                    />
                </Box>
            )}
            {tab === 2 && (
                <Box sx={{ px: 4, width: '100%' }}>
                    <p>development overview</p>
                </Box>
            )}

            <Box sx={{ display: 'flex', p: 4 }}>
                <MarketOverviewReport />
            </Box>
        </Box>
    );
}
