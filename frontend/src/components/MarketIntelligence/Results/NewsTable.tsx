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
};

const NewsTable: React.FC<Props> = ({ articles, page, onPageChange, pageCount = 3, categories = [], columnFilter = 'Tutte', onColumnFilterChange, cellFontSize = '14px' }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleSelect = (val: string) => {
        if (onColumnFilterChange) onColumnFilterChange(val);
        handleClose();
    }

    return (
        <Paper variant="outlined" sx={{ mt: 2, mx: 0, p: 4, pb: 4, borderRadius: 2, backgroundColor: '#fff', width: '100%' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 120, bgcolor: '#F5F5F7', fontWeight: 600 }}>Data</TableCell>
                        <TableCell sx={{ bgcolor: '#F5F5F7', fontWeight: 600 }}>Titolo</TableCell>
                        <TableCell sx={{ width: 140, bgcolor: '#F5F5F7', fontWeight: 600 }}>Rilevanza</TableCell>
                        <TableCell sx={{ width: 240, bgcolor: '#F5F5F7', fontWeight: 600 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography sx={{ fontWeight: 600, fontSize: '19px' }}>Categoria</Typography>
                                <IconButton size="small" onClick={handleOpen} aria-label="filtro-categoria" disableRipple>
                                    <ArrowDropDownIcon />
                                </IconButton>
                                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                                    <MenuItem onClick={() => handleSelect('Tutte')}>
                                        <Typography sx={{ fontSize: '16px' }}>Tutte</Typography>
                                    </MenuItem>
                                    {categories.map(c => (
                                        <MenuItem key={c} onClick={() => handleSelect(c)}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <Typography sx={{ fontSize: '16px' }}>{c}</Typography>
                                                {columnFilter === c && <CheckIcon fontSize="small" />}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Stack>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {articles.map((a) => (
                        <TableRow key={a.id} hover sx={{ backgroundColor: '#fff' }}>
                            <TableCell sx={{ verticalAlign: 'middle', fontSize: cellFontSize }}>{format(new Date(a.date_published))}</TableCell>
                            <TableCell>
                                <a href={a.url || '#'} style={{ color: '#1976d2', textDecoration: 'underline', fontSize: cellFontSize as any }}>{a.title}</a>
                            </TableCell>
                            <TableCell><RelevanceChip r={a.relevance} cellFontSize={cellFontSize} /></TableCell>
                            <TableCell sx={{ fontSize: cellFontSize }}>{a.category}</TableCell>
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
