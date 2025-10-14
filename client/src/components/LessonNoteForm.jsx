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
} from '@mui/material';
import { useState, useEffect } from 'react';

function LessonNoteForm({ open, onClose, onSubmit, subStrandName, isLoading }) {
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
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Generate AI Lesson Note</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Topic (from selection):
              </Typography>
              <Typography variant="body1">{subStrandName || 'N/A'}</Typography>
            </Box>

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
              label="Indicator Code(s)"
              value={formData.indicatorCodes}
              onChange={handleChange}
              required
              helperText="Enter one or more indicator codes separated by commas."
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
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Generate Note'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LessonNoteForm;
