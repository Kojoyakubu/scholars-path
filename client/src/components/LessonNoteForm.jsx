import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button,
  TextField, CircularProgress, Stack, Box, Typography
} from '@mui/material';
import { useState, useEffect } from 'react';

function LessonNoteForm({ open, onClose, onSubmit, subStrandName, isLoading }) {
  const [formData, setFormData] = useState({
    objectives: '',
    aids: '',
    duration: '1hr 10 mins',
    // ✅ ADDED NEW FIELDS
    contentStandard: '',
    performanceIndicator: '',
    coreCompetencies: 'Critical Thinking, Problem Solving',
  });

  useEffect(() => {
    // Reset form when the modal is opened for a new note
    if (open) {
      setFormData({
        objectives: '',
        aids: '',
        duration: '1hr 10 mins',
        contentStandard: '',
        performanceIndicator: '',
        coreCompetencies: 'Critical Thinking, Problem Solving',
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
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" gutterBottom>Topic:</Typography>
              <Typography variant="body1">{subStrandName || 'N/A'}</Typography>
            </Box>
            <TextField
              name="contentStandard"
              label="Content Standard (e.g., B7.2.1.1)"
              value={formData.contentStandard}
              onChange={handleChange}
              required
            />
            <TextField
              name="performanceIndicator"
              label="Performance Indicator"
              value={formData.performanceIndicator}
              onChange={handleChange}
              multiline
              rows={2}
              required
            />
            <TextField
              name="objectives"
              label="Learning Objectives"
              value={formData.objectives}
              onChange={handleChange}
              multiline
              rows={3}
              required
              helperText="Clearly state what learners should be able to do by the end of the lesson."
            />
            <TextField
              name="coreCompetencies"
              label="Core Competencies"
              value={formData.coreCompetencies}
              onChange={handleChange}
              required
            />
            <TextField
              name="aids"
              label="Teaching/Learning Materials"
              value={formData.aids}
              onChange={handleChange}
              required
            />
            <TextField
              name="duration"
              label="Duration"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
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