import { Box, Pagination, PaginationItem, Typography, SxProps, Theme } from '@mui/material';

export type PaginationControlsProps = {
  count: number;
  page: number;
  onChange: (page: number) => void;
  containerSx?: SxProps<Theme>;
  paginationSx?: SxProps<Theme>;
};

export default function PaginationControls({ count, page, onChange, containerSx, paginationSx }: PaginationControlsProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, ...(containerSx as unknown as Record<string, unknown> || {}) }}>
      <Pagination
        count={count}
        page={page}
        onChange={(_, v) => onChange(v)}
        shape="rounded"
        variant="outlined"
        renderItem={(item) => (
          <PaginationItem
            components={{ previous: Typography, next: Typography }}
            slots={{
              previous: () => (
                <Typography sx={{ textTransform: 'none', fontSize: '16px' }}>
                  ← Precedente
                </Typography>
              ),
              next: () => (
                <Typography sx={{ textTransform: 'none', fontSize: '16px' }}>
                  Successivo →
                </Typography>
              ),
            }}
            {...item}
          />
        )}
        sx={{
          '& .MuiPaginationItem-root': {
            color: 'text.primary',
            borderRadius: '12px',
            border: '1px solid #ddd',
            margin: '0 4px',
            height: '40px',
            minWidth: '40px',
            '&.Mui-selected': {
              backgroundColor: '#f1f1f1',
              borderColor: '#bbb',
            },
            '&:hover': {
              backgroundColor: '#f1f1f1',
            },
            '&.MuiPaginationItem-previousNext': {
              padding: '0px 12px',
            },
          },
          ...(paginationSx as unknown as Record<string, unknown> || {}),
        }}
      />
    </Box>
  );
}
