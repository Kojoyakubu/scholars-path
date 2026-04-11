import { Box } from '@mui/material';
import { useMemo } from 'react';

export default function PreviewWatermarkOverlay({
  open = false,
  label = 'CONFIDENTIAL PREVIEW',
}) {
  const timestamp = useMemo(() => new Date().toLocaleString(), [open]);

  const tiles = useMemo(
    () => Array.from({ length: 16 }, (_, index) => index),
    []
  );

  if (!open) return null;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        justifyItems: 'center',
        overflow: 'hidden',
      }}
    >
      {tiles.map((tile) => (
        <Box
          key={tile}
          sx={{
            transform: 'rotate(-24deg)',
            opacity: 0.12,
            color: 'text.primary',
            textAlign: 'center',
            fontWeight: 700,
            lineHeight: 1.35,
            fontSize: { xs: '0.6rem', sm: '0.72rem' },
            whiteSpace: 'pre-line',
            userSelect: 'none',
          }}
        >
          {`${label}\n${timestamp}`}
        </Box>
      ))}
    </Box>
  );
}
