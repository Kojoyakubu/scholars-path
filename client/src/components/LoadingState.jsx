// /client/src/components/LoadingState.jsx
// Consistent loading states for all dashboards

import { Box, CircularProgress, Typography, Skeleton, Stack } from '@mui/material';

// For full-page loads
export const FullPageLoading = ({ message = "Loading..." }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 2,
    }}
  >
    <CircularProgress size={60} thickness={4} />
    <Typography variant="body1" color="text.secondary" fontWeight={500}>
      {message}
    </Typography>
  </Box>
);

// For content sections
export const ContentLoading = ({ rows = 3 }) => (
  <Stack spacing={2}>
    {Array.from({ length: rows }).map((_, idx) => (
      <Skeleton 
        key={idx}
        variant="rectangular" 
        height={idx === 0 ? 120 : 80} 
        sx={{ borderRadius: 2 }} 
      />
    ))}
  </Stack>
);

// For card grids
export const CardGridLoading = ({ count = 3 }) => (
  <Stack direction="row" spacing={2} flexWrap="wrap">
    {Array.from({ length: count }).map((_, idx) => (
      <Box key={idx} sx={{ flex: '1 1 300px' }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 1 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </Box>
    ))}
  </Stack>
);

// For inline actions (buttons)
export const InlineLoading = ({ size = 20 }) => (
  <CircularProgress size={size} sx={{ ml: 1 }} thickness={5} />
);

// For tables
export const TableLoading = ({ rows = 5, columns = 4 }) => (
  <Stack spacing={1}>
    {/* Header */}
    <Stack direction="row" spacing={2}>
      {Array.from({ length: columns }).map((_, idx) => (
        <Skeleton key={idx} variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} />
      ))}
    </Stack>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <Stack key={rowIdx} direction="row" spacing={2}>
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton key={colIdx} variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 1 }} />
        ))}
      </Stack>
    ))}
  </Stack>
);

export default {
  FullPageLoading,
  ContentLoading,
  CardGridLoading,
  InlineLoading,
  TableLoading,
};