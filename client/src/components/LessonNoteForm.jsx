import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  CircularProgress, // For loading state
} from '@mui/material';

const LessonNoteForm = ({ open, onClose, onSubmit, subStrandName, isLoading }) => {
  const [formData, setFormData] = useState({
    objectives: '',
    aids: '',
    duration: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const { objectives, aids, duration } = formData;
  
  // Validate the form whenever formData changes
  useEffect(() => {
    // Basic validation: ensure required fields are not empty
    if (objectives.trim() !== '' && duration.trim() !== '') {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [objectives, duration]);


  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return; // Prevent submission if form is invalid
    onSubmit(formData);
    // Let the parent component handle closing the dialog on success
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Generate AI Lesson Note</DialogTitle>
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
            helperText="Required"
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
            required
            fullWidth
            name="duration"
            label="Lesson Duration (e.g., 45 minutes)"
            value={duration}
            onChange={onChange}
            helperText="Required"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Box sx={{ position: 'relative' }}>
          <Button 
            type="submit" 
            form="lesson-note-form" 
            variant="contained"
            disabled={!isFormValid || isLoading} // Disable button if form is invalid or submitting
          >
            Generate Note
          </Button>
          {isLoading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default LessonNoteForm;