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
  deleteLessonNote,
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

  // --- Load user’s lesson notes and base levels ---
  useEffect(() => {
    dispatch(getMyLessonNotes());
    dispatch(fetchItems({ entity: 'levels' }));
    return () => {
      dispatch(resetTeacherState());
    };
  }, [dispatch]);

  // --- Handle dropdown changes and fetch children ---
  const handleSelectionChange = useCallback(
    async (e) => {
      const { name, value } = e.target;
      setSelections((prev) => ({
        ...prev,
        [name]: value,
      }));

      switch (name) {
        case 'level':
          dispatch(fetchChildren({ parentId: value, entity: 'classes' }));
          dispatch(clearChildren({ entities: ['subjects', 'strands', 'subStrands'] }));
          break;
        case 'class':
          dispatch(fetchChildren({ parentId: value, entity: 'subjects' }));
          dispatch(clearChildren({ entities: ['strands', 'subStrands'] }));
          break;
        case 'subject':
          dispatch(fetchChildren({ parentId: value, entity: 'strands' }));
          dispatch(clearChildren({ entities: ['subStrands'] }));
          break;
        case 'strand':
          dispatch(fetchChildren({ parentId: value, entity: 'subStrands' }));
          break;
        default:
          break;
      }
    },
    [dispatch]
  );

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // --- Generate lesson note ---
  const handleGenerateNote = useCallback(
    (formData) => {
      const noteData = { ...formData, subStrandId: selections.subStrand };
      dispatch(generateLessonNote(noteData));
    },
    [dispatch, selections.subStrand]
  );

  // --- Close modal after success ---
  useEffect(() => {
    if (isSuccess && isModalOpen) {
      handleCloseModal();
    }
  }, [isSuccess, isModalOpen]);

  // --- PDF DOWNLOAD ---
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
      console.error('html2pdf library not loaded!');
      alert('Could not generate PDF. Please refresh the page.');
    }
  }, []);

  // --- WORD DOWNLOAD ---
  const handleDownloadWord = useCallback((noteId, noteTopic) => {
    try {
      const element = document.getElementById(`note-content-${noteId}`);
      if (!element) {
        alert('Note content not found.');
        return;
      }

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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Word generation failed:', err);
      alert('Could not generate Word document. Please try again.');
    }
  }, []);

  // --- DELETE NOTE ---
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1">
            Teacher Dashboard
          </Typography>
        </Box>

        {/* --- Note Generator --- */}
        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <Typography variant="h6" gutterBottom>
            Select Topic to Generate Note
          </Typography>

          <Grid container spacing={2}>
            {[
              { label: 'Level', name: 'level', items: levels },
              { label: 'Class', name: 'class', items: classes, disabled: !selections.level },
              { label: 'Subject', name: 'subject', items: subjects, disabled: !selections.class },
              { label: 'Strand', name: 'strand', items: strands, disabled: !selections.subject },
            ].map(({ label, name, items, disabled }) => (
              <Grid item xs={12} sm={6} md={3} key={name}>
                <FormControl fullWidth disabled={disabled}>
                  <InputLabel>{label}</InputLabel>
                  <Select
                    name={name}
                    value={selections[name]}
                    label={label}
                    onChange={handleSelectionChange}
                  >
                    {items.map((i) => (
                      <MenuItem key={i._id} value={i._id}>
                        {i.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12}>
              <FormControl fullWidth disabled={!selections.strand}>
                <InputLabel>Sub-Strand</InputLabel>
                <Select
                  name="subStrand"
                  value={selections.subStrand}
                  label="Sub-Strand"
                  onChange={handleSelectionChange}
                >
                  {subStrands.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={handleOpenModal}
            disabled={!selections.subStrand || isLoading}
            sx={{ mt: 2 }}
          >
            Generate AI Lesson Note
          </Button>
        </Paper>

        {/* --- Lesson Notes --- */}
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
                  <ListItemButton component={RouterLink} to={`/teacher/notes/${note._id}`}>
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

        <LessonNoteForm
          open={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleGenerateNote}
          subStrandName={
            subStrands.find((s) => s._id === selections.subStrand)?.name || ''
          }
          isLoading={isLoading}
        />
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;
