import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Stack, CircularProgress, Box, Typography, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';

const AiQuizForm = ({ open, onClose, onSubmit, isLoading, curriculum }) => {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    subjectId: '',
    numQuestions: 5,
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedSubject = curriculum.subjects.find(s => s._id === formData.subjectId);
    const selectedClass = curriculum.classes.find(c => c._id === selectedSubject.class);

    onSubmit({
      ...formData,
      subjectName: selectedSubject?.name || '',
      className: selectedClass?.name || '',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Generate AI Quiz (WAEC Standard)</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField name="title" label="Quiz Title" value={formData.title} onChange={handleChange} required />
            <TextField name="topic" label="Specific Topic (Optional)" value={formData.topic} onChange={handleChange} helperText="Leave blank to use the Quiz Title as the topic." />
            <FormControl fullWidth required>
              <InputLabel>Subject</InputLabel>
              <Select name="subjectId" value={formData.subjectId} label="Subject" onChange={handleChange}>
                {curriculum.subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name} ({curriculum.classes.find(c => c._id === s.class)?.name})</MenuItem>)}
              </Select>
            </FormControl>
            <TextField name="numQuestions" label="Number of Questions" type="number" value={formData.numQuestions} onChange={handleChange} required InputProps={{ inputProps: { min: 3, max: 20 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Generate Quiz'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AiQuizForm;