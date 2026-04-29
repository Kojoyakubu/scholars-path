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
  Collapse,
  FormControlLabel,
  Switch,
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
  defaultSchoolName = '',
  defaultFacilitatorName = '',
  fullScreen = false,
  onToggleFullscreen,
}) {
  const defaultDuration = '1hr 10 mins / 2 Periods';
  const preferenceStorageKey = 'lernex:teacher-note-form-prefs';

  const [formData, setFormData] = useState({
    school: defaultSchoolName || '',
    facilitatorName: '',
    term: 'One',
    duration: defaultDuration,
    dayDate: '',
    class: '',
    classSize: '',
    week: '',
    contentStandardCode: '',
    indicatorCodes: '',
    reference: '',
    sessionsPerWeek: 1,
    sessionPlan: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (open) {
      let savedPrefs = {};
      try {
        savedPrefs = JSON.parse(localStorage.getItem(preferenceStorageKey) || '{}');
      } catch (_) {
        savedPrefs = {};
      }
      setFormData({
        school: defaultSchoolName || savedPrefs.school || '',
        facilitatorName: defaultFacilitatorName || savedPrefs.facilitatorName || '',
        term: savedPrefs.term || 'One',
        duration: savedPrefs.duration || defaultDuration,
        dayDate: '',
        class: '',
        classSize: savedPrefs.classSize || '',
        week: '',
        contentStandardCode: savedPrefs.contentStandardCode || '',
        indicatorCodes: savedPrefs.indicatorCodes || '',
        reference: savedPrefs.reference || '',
        sessionsPerWeek: savedPrefs.sessionsPerWeek || 1,
        sessionPlan: '',
      });
      setShowAdvanced(false);
    }
  }, [open, defaultFacilitatorName, defaultSchoolName]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitWithMode = (mode) => {
    const payload = { ...formData, subStrandId, generationMode: mode };
    try {
      localStorage.setItem(
        preferenceStorageKey,
        JSON.stringify({
          school: formData.school,
          facilitatorName: formData.facilitatorName,
          term: formData.term,
          duration: formData.duration,
          classSize: formData.classSize,
          contentStandardCode: formData.contentStandardCode,
          indicatorCodes: formData.indicatorCodes,
          reference: formData.reference,
          sessionsPerWeek: formData.sessionsPerWeek,
        })
      );
    } catch (_) {
      // Non-blocking: preference storage should not stop submission.
    }
    onSubmit(payload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmitWithMode(showAdvanced ? 'custom' : 'fast');
  };

  const sessionCount = Math.max(1, Number(formData.sessionsPerWeek) || 1);
  const isMultiSession = sessionCount >= 2;

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
                label="School Name"
                value={formData.school}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., Ghana International School"
              />

              <TextField
                name="facilitatorName"
                label="Facilitator Name"
                value={formData.facilitatorName}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., Mr. John Mensah"
              />

              <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1.5, border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Fast Mode uses smart defaults from your profile and curriculum. Fill only week, class size, and meetings per week.
                </Typography>
              </Box>

              {/* Term, Week, Date */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="term"
                  label="Term"
                  value={formData.term}
                  onChange={handleChange}
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

              {/* Duration and Class Size */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="duration"
                  label="Default Duration (Optional)"
                  value={formData.duration}
                  onChange={handleChange}
                  helperText={isMultiSession ? 'Optional fallback only. Add each session duration in the Weekly Session Plan field.' : ''}
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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  name="sessionsPerWeek"
                  label="Meetings Per Week *"
                  value={formData.sessionsPerWeek}
                  onChange={handleChange}
                  required
                  type="number"
                  inputProps={{ min: 1, max: 7 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  name="sessionPlan"
                  label="Weekly Session Plan (Optional)"
                  value={formData.sessionPlan}
                  onChange={handleChange}
                  sx={{ flex: 1 }}
                  multiline
                  rows={isMultiSession ? 3 : 2}
                  placeholder={isMultiSession ? 'One line per session: Monday, January 19, 2026 | 35 mins / 1 Period | Introduction to networking' : 'Optional: Monday, January 19, 2026 | 1hr 10 mins / 2 Periods | Introduction to networking'}
                  helperText={isMultiSession ? 'Use one line per meeting in this format: Date / Slot | Duration | Optional focus.' : 'Optional format: Date / Slot | Duration | Optional focus.'}
                />
              </Stack>

              <FormControlLabel
                control={(
                  <Switch
                    checked={showAdvanced}
                    onChange={(event) => setShowAdvanced(event.target.checked)}
                  />
                )}
                label="Customize details (advanced)"
              />

              <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
                <Stack spacing={2.5}>
                  <TextField
                    name="dayDate"
                    label="Day / Date"
                    placeholder="e.g., Monday, October 20, 2025"
                    value={formData.dayDate}
                    onChange={handleChange}
                    fullWidth
                  />

                  {/* Curriculum Standards */}
                  <TextField
                    name="contentStandardCode"
                    label="Content Standard Code"
                    value={formData.contentStandardCode}
                    onChange={handleChange}
                    fullWidth
                    placeholder="e.g., B7.1.2.3"
                  />

                  <TextField
                    name="indicatorCodes"
                    label="Official NaCCA Indicator(s)"
                    value={formData.indicatorCodes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    helperText="Optional. If empty, AI will infer suitable indicators from the selected topic."
                  />

                  <TextField
                    name="reference"
                    label="Reference"
                    value={formData.reference}
                    onChange={handleChange}
                    fullWidth
                    placeholder="e.g., NaCCA Computing Curriculum for Basic 7"
                  />
                </Stack>
              </Collapse>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outlined"
            disabled={isLoading}
            onClick={() => handleSubmitWithMode('fast')}
            sx={{ minWidth: 150 }}
          >
            Generate Fast
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{ minWidth: 200 }}
          >
            {isLoading ? 'Generating...' : 'Customize Then Generate'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LessonNoteForm;