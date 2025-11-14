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
} from '@mui/material';
import { useState, useEffect } from 'react';
import { AutoAwesome } from '@mui/icons-material';

/**
 * LessonBundleForm - Collects all curriculum inputs for AI bundle generation
 * Generates: Teacher Note + Learner Note + Quiz (all at once)
 */
function LessonBundleForm({ open, onClose, onSubmit, subStrandName, isLoading, subStrandId }) {
  const [formData, setFormData] = useState({
    school: '',
    term: 'One',
    duration: '1hr 10 mins / 2 Periods',
    dayDate: '',
    classSize: '',
    week: '',
    contentStandardCode: '',
    indicatorCodes: '',
    reference: '',
    numQuestions: 20,
  });

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData({
        school: '',
        term: 'One',
        duration: '1hr 10 mins / 2 Periods',
        dayDate: '',
        classSize: '',
        week: '',
        contentStandardCode: '',
        indicatorCodes: '',
        reference: '',
        numQuestions: 20,
      });
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Merge subStrandId with form data before submission
    onSubmit({ ...formData, subStrandId });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" disableEscapeKeyDown={isLoading}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          <Typography variant="h6">Generate Complete Lesson Bundle with AI</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          This will generate: Teacher Note + Learner Note + Quiz (4 types: MCQ, True/False, Short Answer, Essay)
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Loading state with progress */}
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Generating Your Lesson Bundle...
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This may take 30-90 seconds as we generate all three components.
              </Typography>
              <Stepper activeStep={-1} alternativeLabel sx={{ mt: 3 }}>
                <Step><StepLabel>Teacher Note</StepLabel></Step>
                <Step><StepLabel>Learner Note</StepLabel></Step>
                <Step><StepLabel>Quiz (4 Types)</StepLabel></Step>
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
                placeholder="e.g., Monday, November 13, 2025"
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

              {/* Quiz Settings */}
              <TextField
                name="numQuestions"
                label="Number of MCQ Questions"
                value={formData.numQuestions}
                onChange={handleChange}
                type="number"
                inputProps={{ min: 5, max: 30 }}
                helperText="Note: True/False (5-10), Short Answer (5-10), Essay (3-5) are auto-generated"
                fullWidth
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
            startIcon={isLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
            sx={{ minWidth: 200 }}
          >
            {isLoading ? 'Generating...' : 'Generate Bundle with AI'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LessonBundleForm;