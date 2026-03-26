/**
 * Shared lesson-note picker dialog used by:
 *   • Generate Learner Note from Lesson Note
 *   • Generate Quiz from Lesson Note
 *
 * Props:
 *   open, onClose, title, description, lessonNotes, selectedId, onSelect,
 *   onConfirm, confirmLabel, isLoading, fullScreen, onToggleFullscreen
 */
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { removeImageBlocks } from '../utils/imageExtractor';
import DialogFullscreenTitle from './DialogFullscreenTitle';

const selectableListItemSx = {
  alignItems: 'flex-start',
  borderRadius: 1.5,
  mx: 0.75,
  my: 0.4,
  '&.Mui-selected': { bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.main' },
  '&.Mui-selected:hover': { bgcolor: 'primary.100' },
};

const dialogBodySx = {
  overflowY: 'auto',
  bgcolor: 'background.default',
  py: 2,
};

export default function LessonNotePickerDialog({
  open,
  onClose,
  title,
  description,
  lessonNotes = [],
  selectedId,
  onSelect,
  onConfirm,
  confirmLabel = 'Confirm',
  isLoading = false,
  fullScreen = false,
  onToggleFullscreen,
}) {
  const selectedNote = (lessonNotes || []).find((n) => n._id === selectedId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      scroll="paper"
      fullWidth
      maxWidth={fullScreen ? false : 'md'}
    >
      <DialogFullscreenTitle
        title={title}
        isFullscreen={fullScreen}
        onToggle={onToggleFullscreen}
      />

      <DialogContent tabIndex={0} sx={dialogBodySx}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {description}
        </Typography>

        <Grid container spacing={2}>
          {/* Left panel – selectable list */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                maxHeight: 420,
                overflow: 'auto',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <List>
                {(lessonNotes || []).map((ln) => (
                  <ListItemButton
                    key={ln._id}
                    selected={selectedId === ln._id}
                    onClick={() => onSelect(ln._id)}
                    sx={selectableListItemSx}
                  >
                    <ListItemText
                      primary={ln.subStrand?.name || ln.title || 'Lesson Note'}
                      secondary={new Date(ln.createdAt).toLocaleString()}
                    />
                  </ListItemButton>
                ))}
                {(!lessonNotes || lessonNotes.length === 0) && (
                  <ListItem>
                    <ListItemText primary="No lesson notes found" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Right panel – preview */}
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                p: 2,
                maxHeight: 520,
                overflow: 'auto',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {!selectedNote ? (
                <Typography variant="body2" color="text.secondary">
                  Select a lesson note to preview its content here.
                </Typography>
              ) : (
                <Box>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Topic: {selectedNote.subStrand?.name || selectedNote.subStrand}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    dangerouslySetInnerHTML={{
                      __html: removeImageBlocks(selectedNote.content || ''),
                    }}
                    sx={{ '& p': { lineHeight: 1.7 } }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!selectedId || isLoading}
          onClick={onConfirm}
        >
          {isLoading ? <CircularProgress size={18} /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
