/**
 * Note preview dialog with image rendering and download menu.
 * Extracted from TeacherDashboard.
 */
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Download,
  ExpandMore,
  OpenInFull,
  CloseFullscreen,
} from '@mui/icons-material';

function FullscreenTitle({ title, isFullscreen, onToggle }) {
  return (
    <DialogTitle sx={{ pb: 1.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
          <IconButton size="small" onClick={onToggle}>
            {isFullscreen ? <CloseFullscreen fontSize="small" /> : <OpenInFull fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </DialogTitle>
  );
}

const contentSx = {
  '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 3, mb: 2 },
  '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    my: 2,
    '& td, & th': { border: '1px solid #ddd', padding: '12px' },
    '& th': { backgroundColor: '#f5f5f5', fontWeight: 600 },
  },
  '& p': { lineHeight: 1.7, mb: 1 },
  '& ul, & ol': { pl: 3, mb: 2 },
};

const compactContentSx = {
  '& *': { boxSizing: 'border-box' },
  '& h2': { fontSize: '1.3rem', fontWeight: 600, mt: 1.5, mb: 1 },
  '& h3': { fontSize: '1.1rem', fontWeight: 600, mt: 1.25, mb: 0.75 },
  '& table': {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
    my: 1,
    fontSize: '0.9rem',
    '& td, & th': {
      border: '1px solid #ddd',
      padding: '6px 7px',
      verticalAlign: 'top',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
    },
    '& th': { backgroundColor: '#f5f5f5', fontWeight: 600 },
  },
  '& p': { lineHeight: 1.5, mb: 0.6, fontSize: '0.95rem', wordBreak: 'break-word', overflowWrap: 'anywhere' },
  '& li': { wordBreak: 'break-word', overflowWrap: 'anywhere' },
  '& ul, & ol': { pl: 2.5, mb: 1 },
  '& figure': { pageBreakInside: 'avoid', breakInside: 'avoid', my: 1 },
  '& > :first-child': { marginTop: '0 !important', paddingTop: 0 },
};

export default function NotePreviewDialog({
  open,
  onClose,
  note,
  segments = [],
  contentId,
  downloadMenuAnchorEl,
  onOpenDownloadMenu,
  onCloseDownloadMenu,
  onDownload,
  isPdfExporting = false,
  fullScreen = false,
  onToggleFullscreen,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      scroll="paper"
      fullWidth
      maxWidth={fullScreen ? false : 'md'}
    >
      <FullscreenTitle
        title="Preview Lesson Note"
        isFullscreen={fullScreen}
        onToggle={onToggleFullscreen}
      />
      <DialogContent tabIndex={0} sx={{ bgcolor: 'grey.50', overflowY: 'auto' }}>
        <Paper
          id={contentId}
          elevation={0}
          sx={{
            p: isPdfExporting ? 1 : 4,
            width: isPdfExporting ? '790px' : 'auto',
            maxWidth: isPdfExporting ? '790px' : 1000,
            mx: 'auto',
          }}
        >
          <Box sx={isPdfExporting ? compactContentSx : contentSx}>
            {segments.map((seg, idx) => {
              if (seg.type === 'text') {
                return <Box key={idx} dangerouslySetInnerHTML={{ __html: seg.html }} />;
              }
              if (seg.type === 'image') {
                if (seg.imgUrl === undefined) {
                  return (
                    <Typography key={idx} variant="caption" color="text.secondary">
                      Loading image...
                    </Typography>
                  );
                }
                if (!seg.imgUrl) return null;
                return (
                  <Box key={idx} sx={{ my: 2, textAlign: 'center' }}>
                    <img
                      src={seg.imgUrl}
                      alt={seg.meta?.title || ''}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    {seg.meta?.title && (
                      <Typography variant="caption" display="block">
                        {seg.meta.title}
                      </Typography>
                    )}
                  </Box>
                );
              }
              return null;
            })}
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          startIcon={<Download />}
          endIcon={<ExpandMore />}
          onClick={onOpenDownloadMenu}
          disabled={!note}
        >
          Download
        </Button>
        <Menu
          anchorEl={downloadMenuAnchorEl}
          open={Boolean(downloadMenuAnchorEl)}
          onClose={onCloseDownloadMenu}
        >
          <MenuItem onClick={() => onDownload('pdf')}>Download as PDF (.pdf)</MenuItem>
          <MenuItem onClick={() => onDownload('html')}>Download as HTML (.html)</MenuItem>
          <MenuItem onClick={() => onDownload('doc')}>Download as Word (.doc)</MenuItem>
          <MenuItem onClick={() => onDownload('txt')}>Download as Text (.txt)</MenuItem>
        </Menu>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
