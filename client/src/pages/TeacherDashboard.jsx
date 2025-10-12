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
  deleteLessonNote, // ✅ Import delete action
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
import DeleteIcon from '@mui/icons-material/Delete';

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

  const handleSelectionChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setSelections((prev) => {
        const newSelections = { ...prev, [name]: value };
        const resetMap = {
          level: ['class', 'subject', 'strand', 'subStrand'],
          class: ['subject', 'strand', 'subStrand'],
          subject: ['strand', 'subStrand'],
          strand: ['subStrand'],
        };
        if (resetMap[name]) {
          resetMap[name].forEach((key) => (newSelections[key] = ''));
          dispatch(clearChildren({ entities: resetMap[name] }));
        }
        return newSelections;
      });
    },
    [dispatch]
  );

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleGenerateNote = useCallback(
    (formData) => {
      const noteData = { ...formData, subStrandId: selections.subStrand };
      dispatch(generateLessonNote(noteData));
    },
    [dispatch, selections.subStrand]
  );

  useEffect(() => {
    if (isSuccess && isModalOpen) {
      handleCloseModal();
    }
  }, [isSuccess, isModalOpen]);

  const handleDownloadPdf = useCallback((noteId, noteTopic) => {
    const element = document.getElementById(`note-content-${noteId}`);
    if (!element) return;

    const filename = `${noteTopic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert('Could not generate PDF.');
    }
  }, []);

  const handleDownloadWord = useCallback((noteId, noteTopic) => {
    try {
      const element = document.getElementById(`note-content-${noteId}`);
      if (!element) return;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              h1, h2, h3 { color: #2e7d32; }
              p { margin-bottom: 8px; }
              h1, h2 { page-break-before: always; }
            </style>
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `;
      const blob = HTMLtoDOCX(html);
      const safeName = (noteTopic || 'lesson-note').replace(/[^a-zA-Z0-9]/g, '_');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${safeName}.docx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Word generation failed:', err);
    }
  }, []);

  // ✅ DELETE NOTE HANDLER
  const handleDeleteNote = useCallback(
    async (noteId) => {
      if (window.confirm('Are you sure you want to delete this lesson note?')) {
        await dispatch(deleteLessonNote(noteId));
        dispatch(getMyLessonNotes());
      }
    },
    [dispatch]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1">
            Teacher Dashboard
          </Typography>
        </Box>

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
                        `Note created on ${new Date(note.createdAt).toLocaleDateString()}`
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
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;
