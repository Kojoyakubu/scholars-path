import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Article, OpenInFull, CloseFullscreen } from '@mui/icons-material';
import { useState, useEffect } from 'react';

// 💡 Fix 1: Add subStrandId to the props
function LessonNoteForm({
  open,
  onClose,
  onSubmit,
  subStrandName,
  isLoading,
  subStrandId,
  defaultFacilitatorName = '',
  fullScreen = false,
  onToggleFullscreen,
}) {
  const [formData, setFormData] = useState({
    school: '',
    facilitatorName: '',
    term: 'One',
    duration: '1hr 10 mins / 2 Periods',
    dayDate: '',
    class: '',
    classSize: '',
    week: '',
    contentStandardCode: '',
    indicatorCodes: '',
    reference: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        school: '',
        facilitatorName: defaultFacilitatorName || '',
        term: 'One',
        duration: '1hr 10 mins / 2 Periods',
        dayDate: '',
        class: '',
        classSize: '',
        week: '',
        contentStandardCode: '',
        indicatorCodes: '',
        reference: '',
      });
    }
  }, [open, defaultFacilitatorName]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 💡 Fix 1: Merge the subStrandId with the form data before submission
    onSubmit({ ...formData, subStrandId });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      scroll="paper"
      fullWidth
      maxWidth={fullScreen ? false : 'md'}
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Article color="primary" />
            <Typography variant="h6">Generate AI Lesson Note</Typography>
          </Box>
          {onToggleFullscreen && (
            <Tooltip title={fullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              <IconButton
                size="small"
                aria-label={fullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                onClick={onToggleFullscreen}
              >
                {fullScreen ? <CloseFullscreen fontSize="small" /> : <OpenInFull fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          This will generate a teacher lesson note based on the selected topic.
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent tabIndex={0} sx={{ overflowY: 'auto' }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Generating Your Lesson Note...
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This may take 30–60 seconds.
              </Typography>
              <Stepper activeStep={0} alternativeLabel sx={{ mt: 3 }}>
                <Step><StepLabel>Teacher Note</StepLabel></Step>
              </Stepper>
            </Box>
          ) : (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {/* Topic Display */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'primary.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.200',
                }}
              >
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Selected Topic:
                </Typography>
                <Typography variant="h6">{subStrandName || 'N/A'}</Typography>
              </Box>

              {/* School Information */}
              <TextField
                name="school"
                label="School Name *"
                value={formData.school}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., Ghana International School"
              />

              <TextField
                name="facilitatorName"
                label="Facilitator Name *"
                value={formData.facilitatorName}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., Mr. John Mensah"
              />

              {/* Term, Week, Date */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="term"
                  label="Term *"
                  value={formData.term}
                  onChange={handleChange}
                  required
                  helperText="One, Two, or Three"
                  sx={{ flex: 1 }}
                />
                <TextField
                  name="week"
                  label="Week Number *"
                  value={formData.week}
                  onChange={handleChange}
                  required
                  type="number"
                  inputProps={{ min: 1, max: 20 }}
                  sx={{ flex: 1 }}
                />
              </Stack>

              <TextField
                name="dayDate"
                label="Day / Date *"
                placeholder="e.g., Monday, October 20, 2025"
                value={formData.dayDate}
                onChange={handleChange}
                required
                fullWidth
              />

              {/* Duration and Class Size */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="duration"
                  label="Duration *"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  sx={{ flex: 1 }}
                />
                <TextField
                  name="classSize"
                  label="Class Size *"
                  value={formData.classSize}
                  onChange={handleChange}
                  required
                  type="number"
                  inputProps={{ min: 1, max: 200 }}
                  sx={{ flex: 1 }}
                />
              </Stack>

              {/* Curriculum Standards */}
              <TextField
                name="contentStandardCode"
                label="Content Standard Code *"
                value={formData.contentStandardCode}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., B7.1.2.3"
              />

              <TextField
                name="indicatorCodes"
                label="Official NaCCA Indicator(s) *"
                value={formData.indicatorCodes}
                onChange={handleChange}
                required
                fullWidth
                multiline
                rows={3}
                helperText="Copy and paste the full indicator text from the curriculum (e.g., 'Discuss the fourth-generation computers')"
              />

              <TextField
                name="reference"
                label="Reference *"
                value={formData.reference}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., NaCCA Computing Curriculum for Basic 7"
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 200 }}
          >
            {isLoading ? 'Generating...' : 'Generate Lesson Note'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LessonNoteForm;