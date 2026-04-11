import { Box } from '@mui/material';
import { useMemo } from 'react';

export default function PreviewWatermarkOverlay({
  open = false,
  label = 'CONFIDENTIAL PREVIEW',
}) {
  const timestamp = useMemo(() => new Date().toLocaleString(), [open]);

  const tiles = useMemo(() => {
    const columns = 4;
    const rows = 9;
    const result = [];

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        result.push({
          id: `${row}-${col}`,
          left: `${(col + 0.5) * (100 / columns)}%`,
          top: `${(row + 0.5) * (100 / rows)}%`,
        });
      }
    }

    return result;
  }, []);

  if (!open) return null;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {tiles.map((tile) => (
        <Box
          key={tile.id}
          sx={{
            position: 'absolute',
            left: tile.left,
            top: tile.top,
            transform: 'translate(-50%, -50%) rotate(-24deg)',
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
