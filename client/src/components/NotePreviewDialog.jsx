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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Check,
  Download,
  ExpandMore,
  Palette,
} from '@mui/icons-material';
import DOMPurify from 'dompurify';
import { useMemo, useState } from 'react';
import DialogFullscreenTitle from './DialogFullscreenTitle';
import useContentProtection from '../hooks/useContentProtection';
import PreviewWatermarkOverlay from './PreviewWatermarkOverlay';
import { LESSON_NOTE_TEMPLATE_OPTIONS } from '../constants/lessonNoteTemplates';

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
  onChangeTemplate,
  isPdfExporting = false,
  isChargingDownload = false,
  isUpdatingTemplate = false,
  fullScreen = false,
  onToggleFullscreen,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const effectiveFullScreen = fullScreen || isMobile;
  const [templateMenuAnchorEl, setTemplateMenuAnchorEl] = useState(null);
  const { protectionProps, protectionSx } = useContentProtection({ enabled: open });
  const sanitizedSegments = useMemo(
    () => segments.map((segment) => (
      segment.type === 'text'
        ? { ...segment, safeHtml: DOMPurify.sanitize(segment.html || '') }
        : segment
    )),
    [segments]
  );
  const canChangeTemplate = Boolean(note?.teacher && onChangeTemplate);

  const handleOpenTemplateMenu = (event) => {
    setTemplateMenuAnchorEl(event.currentTarget);
  };

  const handleCloseTemplateMenu = () => {
    setTemplateMenuAnchorEl(null);
  };

  const handleSelectTemplate = (templateDesign) => {
    handleCloseTemplateMenu();
    if (templateDesign !== note?.templateDesign) {
      onChangeTemplate(templateDesign);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={effectiveFullScreen}
      scroll="paper"
      fullWidth
      maxWidth={effectiveFullScreen ? false : 'md'}
    >
      <DialogFullscreenTitle
        title="Preview Lesson Note"
        isFullscreen={fullScreen}
        onToggle={onToggleFullscreen}
      />
      <DialogContent
        tabIndex={0}
        {...protectionProps}
        sx={{
          position: 'relative',
          bgcolor: 'grey.50',
          overflowY: 'auto',
          px: { xs: 1, sm: 2.5 },
          py: { xs: 1, sm: 2 },
          ...protectionSx,
        }}
      >
        <PreviewWatermarkOverlay open={open} label="CONFIDENTIAL NOTE PREVIEW" />
        <Paper
          id={contentId}
          elevation={0}
          sx={{
            p: isPdfExporting ? 1 : { xs: 1.25, sm: 4 },
            width: isPdfExporting ? '790px' : '100%',
            maxWidth: isPdfExporting ? '790px' : 1000,
            mx: 'auto',
            overflowX: { xs: 'auto', sm: 'visible' },
          }}
        >
          <Box sx={isPdfExporting ? compactContentSx : contentSx}>
            {sanitizedSegments.map((seg, idx) => {
              if (seg.type === 'text') {
                return <Box key={idx} dangerouslySetInnerHTML={{ __html: seg.safeHtml }} />;
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
        {canChangeTemplate && (
          <>
            <Button
              variant="outlined"
              startIcon={<Palette />}
              endIcon={<ExpandMore />}
              onClick={handleOpenTemplateMenu}
              disabled={!note || isPdfExporting || isChargingDownload || isUpdatingTemplate}
            >
              {isUpdatingTemplate ? 'Updating design...' : 'Change design'}
            </Button>
            <Menu
              anchorEl={templateMenuAnchorEl}
              open={Boolean(templateMenuAnchorEl)}
              onClose={handleCloseTemplateMenu}
            >
              {LESSON_NOTE_TEMPLATE_OPTIONS.map((template) => (
                <MenuItem key={template.id} onClick={() => handleSelectTemplate(template.id)}>
                  <ListItemIcon>
                    {note?.templateDesign === template.id ? <Check fontSize="small" /> : <Box sx={{ width: 20 }} />}
                  </ListItemIcon>
                  <ListItemText primary={template.label} secondary={template.description} />
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
        <Button
          variant="outlined"
          startIcon={<Download />}
          endIcon={<ExpandMore />}
          onClick={onOpenDownloadMenu}
          disabled={!note || isPdfExporting || isChargingDownload}
        >
          {isChargingDownload ? 'Processing payment...' : 'Download (GHC 0.5 per option)'}
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
