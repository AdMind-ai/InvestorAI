import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Stack, Paper, Menu, MenuItem, IconButton } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import PaginationControls from '../../common/PaginationControls';

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

function format(d: Date) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function RelevanceChip({ r, cellFontSize = '14px' }: { r: Article['relevance']; cellFontSize?: string | number }) {
    const map: Record<Article['relevance'], { label: string; color: string }> = {
        high: { label: 'Alta', color: '#D32F2F' },
        medium: { label: 'Media', color: '#F57C00' },
        low: { label: 'Bassa', color: '#0288D1' },
        '': { label: 'N/A', color: '#757575' },
    };
    const m = map[r];
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: m.color }} />
            <Typography sx={{ color: m.color, fontSize: cellFontSize }}>{m.label}</Typography>
        </Stack>
    );
}

type Props = {
    articles: Article[];
    page: number;
    onPageChange: (page: number) => void;
    pageCount?: number;
    categories?: string[]; // available category values for column filter
    columnFilter?: string;
    onColumnFilterChange?: (c: string) => void;
    cellFontSize?: string | number;
    // Relevance filter (Rilevanza)
    relevances?: Array<Article['relevance']>;
    relevanceFilter?: Article['relevance'] | 'Tutte';
    onRelevanceFilterChange?: (r: Article['relevance'] | 'Tutte') => void;
};

const NewsTable: React.FC<Props> = ({
    articles,
    page,
    onPageChange,
    pageCount = 3,
    categories = [],
    columnFilter = 'Tutte',
    onColumnFilterChange,
    cellFontSize = '14px',
    relevances = ['high', 'medium', 'low', ''],
    relevanceFilter = 'Tutte',
    onRelevanceFilterChange,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [anchorElRel, setAnchorElRel] = React.useState<null | HTMLElement>(null);
    const openRel = Boolean(anchorElRel);

    // Local fallback state when parent doesn't control filters
    const [localCategory, setLocalCategory] = React.useState<string>(columnFilter);
    const [localRelevance, setLocalRelevance] = React.useState<Article['relevance'] | 'Tutte'>(relevanceFilter);

    // Keep local state in sync if props change (controlled -> uncontrolled switch safety)
    React.useEffect(() => {
        setLocalCategory(columnFilter);
    }, [columnFilter]);
    React.useEffect(() => {
        setLocalRelevance(relevanceFilter);
    }, [relevanceFilter]);

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleOpenRel = (e: React.MouseEvent<HTMLElement>) => setAnchorElRel(e.currentTarget);
    const handleCloseRel = () => setAnchorElRel(null);

    const handleSelect = (val: string) => {
        // Update local when uncontrolled
        if (!onColumnFilterChange) setLocalCategory(val);
        if (onColumnFilterChange) onColumnFilterChange(val);
        handleClose();
    }

    const relevanceLabel = (r: Article['relevance'] | 'Tutte') => {
        const map: Record<Article['relevance'] | 'Tutte', string> = {
            high: 'Alta',
            medium: 'Media',
            low: 'Bassa',
            '': 'N/A',
            'Tutte': 'Tutte',
        };
        return map[r];
    };

    const handleSelectRel = (val: Article['relevance'] | 'Tutte') => {
        if (!onRelevanceFilterChange) setLocalRelevance(val);
        if (onRelevanceFilterChange) onRelevanceFilterChange(val);
        handleCloseRel();
    };

    const normalize = (s?: string) => (s || '').trim().toLowerCase();
    const currentCategory = onColumnFilterChange ? columnFilter : localCategory;
    const currentRelevance = onRelevanceFilterChange ? relevanceFilter : localRelevance;

    // Derive available options from articles (show only existing values)
    const derivedCategories = React.useMemo(() => {
        const m = new Map<string, string>();
        for (const a of articles) {
            const key = normalize(a.category);
            if (key && !m.has(key)) m.set(key, a.category || '');
        }
        return Array.from(m.values());
    }, [articles]);

    const derivedRelevances = React.useMemo(() => {
        const allowed: Array<Article['relevance']> = ['high', 'medium', 'low', ''];
        const set = new Set<Article['relevance']>();
        for (const a of articles) {
            if (allowed.includes(a.relevance)) set.add(a.relevance);
        }
        return Array.from(set);
    }, [articles]);

    // Restrict to existing options, even if parent passes wider lists
    const availableCategories = React.useMemo(() => {
        const base = categories && categories.length ? categories : derivedCategories;
        const seen = new Set<string>();
        const out: string[] = [];
        for (const c of base) {
            const key = normalize(c);
            if (key && !seen.has(key)) { seen.add(key); out.push(c); }
        }
        return out;
    }, [categories, derivedCategories]);

    const availableRelevances = React.useMemo(() => {
        const base = (relevances && relevances.length ? relevances : ['high', 'medium', 'low', '']) as Array<Article['relevance']>;
        return base.filter(r => derivedRelevances.includes(r));
    }, [relevances, derivedRelevances]);

    // If current selections become invalid, reset to 'Tutte'
    React.useEffect(() => {
        if (currentCategory !== 'Tutte' && !availableCategories.some(c => normalize(c) === normalize(currentCategory))) {
            if (onColumnFilterChange) onColumnFilterChange('Tutte'); else setLocalCategory('Tutte');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableCategories]);

    React.useEffect(() => {
        if (currentRelevance !== 'Tutte' && !availableRelevances.includes(currentRelevance as Article['relevance'])) {
            if (onRelevanceFilterChange) onRelevanceFilterChange('Tutte'); else setLocalRelevance('Tutte');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableRelevances]);

    const filteredArticles = articles.filter((a) => {
        const catOk = currentCategory === 'Tutte' || normalize(a.category) === normalize(currentCategory);
        const relOk = currentRelevance === 'Tutte' || a.relevance === currentRelevance;
        return catOk && relOk;
    });

    return (
        <Paper variant="outlined" sx={{ mt: 2, mx: 0, p: 4, pb: 4, borderRadius: 2, backgroundColor: '#fff', width: '100%' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 120, bgcolor: '#F5F5F7', fontWeight: 600 }}>Data</TableCell>
                        <TableCell sx={{ bgcolor: '#F5F5F7', fontWeight: 600 }}>Titolo</TableCell>
                        <TableCell sx={{ width: 140, bgcolor: '#F5F5F7', fontWeight: 600 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ fontWeight: 600, fontSize: '19px' }}>Rilevanza</Typography>
                                <IconButton size="small" onClick={handleOpenRel} aria-label="filtro-rilevanza" disableRipple>
                                    <ArrowDropDownIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorElRel}
                                    open={openRel}
                                    onClose={handleCloseRel}
                                    MenuListProps={{ sx: { p: 0 } }}
                                    PaperProps={{
                                        elevation: 4,
                                        sx: { borderRadius: 2, minWidth: 140, overflow: 'hidden' }
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => handleSelectRel('Tutte')}
                                        selected={currentRelevance === 'Tutte'}
                                        sx={{ px: 2, py: 1.25 }}
                                    >
                                        <Typography sx={{ fontSize: 15 }}>
                                            Tutte
                                        </Typography>
                                        {currentRelevance === 'Tutte' && <CheckIcon fontSize="small" sx={{ ml: 'auto', color: 'primary.main' }} />}
                                    </MenuItem>

                                    <Box sx={{ height: 1, bgcolor: 'divider', mx: 1 }} />

                                    {availableRelevances.map((r) => (
                                        <MenuItem
                                            key={r === '' ? 'na' : r}
                                            onClick={() => handleSelectRel(r)}
                                            selected={currentRelevance === r}
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                '&.Mui-selected': { bgcolor: 'action.selected' },
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    color: currentRelevance === r ? 'text.primary' : 'text.secondary',
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {relevanceLabel(r)}
                                            </Typography>
                                            {currentRelevance === r && <CheckIcon fontSize="small" sx={{ ml: 'auto', color: 'primary.main' }} />}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Stack>
                        </TableCell>
                        <TableCell sx={{ width: 240, bgcolor: '#F5F5F7', fontWeight: 600 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ fontWeight: 600, fontSize: '19px' }}>Categoria</Typography>
                                <IconButton size="small" onClick={handleOpen} aria-label="filtro-categoria" disableRipple>
                                    <ArrowDropDownIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    MenuListProps={{ sx: { p: 0 } }}
                                    PaperProps={{
                                        elevation: 4,
                                        sx: { borderRadius: 2, minWidth: 120, overflow: 'hidden' }
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => handleSelect('Tutte')}
                                        selected={currentCategory === 'Tutte'}
                                        sx={{ px: 2, py: 1.25 }}
                                    >
                                        <Typography sx={{ fontSize: 15 }}>
                                            Tutte
                                        </Typography>
                                        {currentCategory === 'Tutte' && <CheckIcon fontSize="small" sx={{ ml: 'auto', color: 'primary.main' }} />}
                                    </MenuItem>

                                    <Box sx={{ height: 1, bgcolor: 'divider', mx: 1 }} />

                                    {availableCategories.map((c) => (
                                        <MenuItem
                                            key={c}
                                            onClick={() => handleSelect(c)}
                                            selected={normalize(currentCategory) === normalize(c)}
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                '&.Mui-selected': { bgcolor: 'action.selected' },
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    color: normalize(currentCategory) === normalize(c) ? 'text.primary' : 'text.secondary',
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {((c || '').trim().charAt(0).toUpperCase() + (c || '').trim().slice(1).toLowerCase())}
                                            </Typography>
                                            {normalize(currentCategory) === normalize(c) && <CheckIcon fontSize="small" sx={{ ml: 'auto', color: 'primary.main' }} />}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Stack>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredArticles.map((a) => (
                        <TableRow key={a.id} hover sx={{ backgroundColor: '#fff' }}>
                            <TableCell sx={{ verticalAlign: 'middle', fontSize: cellFontSize }}>{format(new Date(a.date_published))}</TableCell>
                            <TableCell>
                                <a href={a.url || '#'} style={{ color: '#1976d2', textDecoration: 'underline', fontSize: cellFontSize }}>{a.title}</a>
                            </TableCell>
                            <TableCell><RelevanceChip r={a.relevance} cellFontSize={cellFontSize} /></TableCell>
                            <TableCell sx={{ fontSize: cellFontSize }}>
                                {((a.category || '').trim().charAt(0).toUpperCase() + (a.category || '').trim().slice(1).toLowerCase())}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <PaginationControls
                count={pageCount}
                page={page}
                onChange={onPageChange}
            />
        </Paper>
    );
};

export default NewsTable;
