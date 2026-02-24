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

// 💡 Fix 1: Add subStrandId to the props
function LessonNoteForm({ open, onClose, onSubmit, subStrandName, isLoading, subStrandId }) {
  const [formData, setFormData] = useState({
    school: '',
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
  }, [open]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 💡 Fix 1: Merge the subStrandId with the form data before submission
    onSubmit({ ...formData, subStrandId });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" disableEscapeKeyDown={isLoading}>
      <DialogTitle>Generate AI Lesson Note</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
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
                <Step>
                  <StepLabel>Teacher Note</StepLabel>
                </Step>
              </Stepper>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Topic (from selection):
                </Typography>
                <Typography variant="body1">{subStrandName || 'N/A'}</Typography>
              </Box>

              {/* Note: subStrandId is not visible here but is passed to onSubmit */}

              <TextField
                name="school"
                label="School Name"
                value={formData.school}
                onChange={handleChange}
                required
              />
              <TextField
                name="term"
                label="Term"
                value={formData.term}
                onChange={handleChange}
                required
                helperText="e.g., One, Two, or Three"
              />
              <TextField
                name="dayDate"
                label="Day / Date"
                placeholder="e.g., Monday, October 20, 2025"
                value={formData.dayDate}
                onChange={handleChange}
                required
              />
              <TextField
                name="duration"
                label="Time / Duration"
                value={formData.duration}
                onChange={handleChange}
                required
              />
              <TextField
                name="class"
                label="Class Name (Optional)"
                value={formData.class}
                onChange={handleChange}
                helperText="Leave blank to use the class from your topic selection."
              />
              <TextField
                name="classSize"
                label="Class Size"
                value={formData.classSize}
                onChange={handleChange}
                required
              />
              <TextField
                name="week"
                label="Week Number"
                value={formData.week}
                onChange={handleChange}
                required
              />
              <TextField
                name="contentStandardCode"
                label="Content Standard Code"
                value={formData.contentStandardCode}
                onChange={handleChange}
                required
              />
              <TextField
                name="indicatorCodes"
                label="Official NaCCA Indicator(s)"
                value={formData.indicatorCodes}
                onChange={handleChange}
                required
                multiline
                rows={3}
                helperText="Copy and paste the full indicator text from the curriculum here (e.g., 'Discuss the fourth-generation computers')."
              />
              <TextField
                name="reference"
                label="Reference"
                value={formData.reference}
                onChange={handleChange}
                required
                helperText="E.g., NaCCA Computing Curriculum for JHS 1"
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : null}>
            {isLoading ? 'Generating...' : 'Generate Lesson Note'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LessonNoteForm;