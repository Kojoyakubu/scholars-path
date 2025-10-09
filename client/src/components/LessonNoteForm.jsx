import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
} from '@mui/material';

const LessonNoteForm = ({ open, onClose, onSubmit, subStrandName }) => {
  const [formData, setFormData] = useState({
    objectives: '',
    aids: '',
    duration: '',
  });

  const { objectives, aids, duration } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose(); // Close the modal after submitting
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Lesson Note</DialogTitle>
      <DialogContent>
        <Box component="form" id="lesson-note-form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Selected Sub-Strand"
            value={subStrandName}
            disabled
          />
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={3}
            name="objectives"
            label="Learning Objectives"
            value={objectives}
            onChange={onChange}
            autoFocus
          />
          <TextField
            margin="normal"
            fullWidth
            name="aids"
            label="Teaching Aids (e.g., videos, charts)"
            value={aids}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            fullWidth
            name="duration"
            label="Lesson Duration (e.g., 45 minutes)"
            value={duration}
            onChange={onChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="lesson-note-form" variant="contained">
          Generate Note
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LessonNoteForm;