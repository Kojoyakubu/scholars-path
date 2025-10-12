import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchItems,
  fetchChildren,
  clearChildren,
} from '../features/curriculum/curriculumSlice';
import {
  generateLessonNote,
  getMyLessonNotes,
  deleteLessonNote, // ✅ added
  resetTeacherState,
} from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import HTMLtoDOCX from 'html-docx-js-typescript';

import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Stack,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete'; // ✅

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands } = useSelector(
    (state) => state.curriculum
  );
  const { lessonNotes, isLoading, isSuccess } = useSelector(
    (state) => state.teacher
  );

  const [selections, setSelections] = useState({
    level: '',
    class: '',
    subject: '',
    strand: '',
    subStrand: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getMyLessonNotes());
    dispatch(fetchItems({ entity: 'levels' }));
    return () => {
      dispatch(resetTeacherState());
    };
  }, [dispatch]);

  const handleDeleteNote = useCallback(
    async (noteId) => {
      if (window.confirm('Are you sure you want to delete this lesson note?')) {
        try {
          await dispatch(deleteLessonNote(noteId));
          dispatch(getMyLessonNotes());
        } catch (err) {
          console.error('Failed to delete note:', err);
          alert('Could not delete the note. Please try again.');
        }
      }
    },
    [dispatch]
  );

  // (PDF and Word handlers stay the same as your last version)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        {/* ... existing top sections ... */}

        {/* Lesson Notes List */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            My Generated Lesson Notes
          </Typography>

          {isLoading && lessonNotes.length === 0 ? (
            <CircularProgress />
          ) : (
            <List>
              {lessonNotes.map((note) => (
                <ListItem key={note._id} disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={`/teacher/notes/${note._id}`}
                  >
                    <ArticleIcon sx={{ mr: 2, color: 'action.active' }} />
                    <ListItemText
                      primaryTypographyProps={{ noWrap: true, fontWeight: 500 }}
                      primary={
                        note.content.split('\n')[1] ||
                        `Note created on ${new Date(
                          note.createdAt
                        ).toLocaleDateString()}`
                      }
                      secondary={note.content.substring(0, 150) + '...'}
                    />
                  </ListItemButton>

                  <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
                    <Button
                      startIcon={<PictureAsPdfIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleDownloadPdf(note._id, 'lesson_note')}
                    >
                      PDF
                    </Button>
                    <Button
                      startIcon={<DescriptionIcon />}
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleDownloadWord(note._id, 'lesson_note')}
                    >
                      Word
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        {/* ... your LessonNoteForm component stays the same ... */}
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;
