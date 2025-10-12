import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  fetchItems,
  fetchChildren,
  clearChildren,
  resetCurriculumState,
} from '../features/curriculum/curriculumSlice';
import {
  getLearnerNotes,
  getQuizzes,
  getResources,
  logNoteView,
} from '../features/student/studentSlice';

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
  ListItemIcon,
  CircularProgress,
  Stack,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import HTMLtoDOCX from 'html-docx-js-typescript';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const curriculumState = useSelector((state) => state.curriculum);
  const studentState = useSelector((state) => state.student);

  const { levels, classes, subjects, strands, subStrands } = curriculumState;
  const { notes, quizzes, resources } = studentState;
  const isLoading = curriculumState.isLoading || studentState.isLoading;

  const [selections, setSelections] = useState({
    level: '',
    class: '',
    subject: '',
    strand: '',
    subStrand: '',
  });

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin');
    if (user.role === 'teacher' || user.role === 'school_admin')
      navigate('/teacher/dashboard');
    if (user.role === 'student') {
      dispatch(fetchItems({ entity: 'levels' }));
    }
    return () => {
      dispatch(resetCurriculumState());
    };
  }, [dispatch, user, navigate]);

  // Chain dropdowns
  useEffect(() => {
    if (selections.level)
      dispatch(
        fetchChildren({
          entity: 'classes',
          parentEntity: 'levels',
          parentId: selections.level,
        })
      );
  }, [selections.level, dispatch]);

  useEffect(() => {
    if (selections.class)
      dispatch(
        fetchChildren({
          entity: 'subjects',
          parentEntity: 'classes',
          parentId: selections.class,
        })
      );
  }, [selections.class, dispatch]);

  useEffect(() => {
    if (selections.subject)
      dispatch(
        fetchChildren({
          entity: 'strands',
          parentEntity: 'subjects',
          parentId: selections.subject,
        })
      );
  }, [selections.subject, dispatch]);

  useEffect(() => {
    if (selections.strand)
      dispatch(
        fetchChildren({
          entity: 'subStrands',
          parentEntity: 'strands',
          parentId: selections.strand,
        })
      );
  }, [selections.strand, dispatch]);

  useEffect(() => {
    if (selections.subStrand) {
      dispatch(getLearnerNotes(selections.subStrand));
      dispatch(getQuizzes(selections.subStrand));
      dispatch(getResources(selections.subStrand));
    }
  }, [selections.subStrand, dispatch]);

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

  const handleNoteView = useCallback(
    (noteId) => {
      dispatch(logNoteView(noteId));
    },
    [dispatch]
  );

  // --- PDF Download ---
  const handleDownloadPdf = useCallback(
    (noteId, noteTopic) => {
      handleNoteView(noteId);
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
        alert('PDF generation failed. Please refresh and try again.');
      }
    },
    [handleNoteView]
  );

  // --- WORD Download ---
  const handleDownloadWord = useCallback((noteId, noteTopic) => {
    try {
      const element = document.getElementById(`note-content-${noteId}`);
      if (!element) {
        alert('Note content not found.');
        return;
      }

      // Create a full HTML structure for better compatibility
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `;

      const blob = HTMLtoDOCX(html); // Use the imported function
      const safeName = (noteTopic || 'lesson_note').replace(/[^a-zA-Z0-9]/g, '_');

      // This part remains the same
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${safeName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error('Error generating Word document:', err);
      alert('Failed to generate Word file. Please try again.');
    }
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user?.fullName}!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Select your topics to find learning materials.
          </Typography>
        </Box>

        {/* Curriculum selectors */}
        <Paper elevation={3} sx={{ padding: 3, mb: 5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  name="level"
                  value={selections.level}
                  label="Level"
                  onChange={handleSelectionChange}
                >
                  {levels.map((l) => (
                    <MenuItem key={l._id} value={l._id}>
                      {l.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth disabled={!selections.level}>
                <InputLabel>Class</InputLabel>
                <Select
                  name="class"
                  value={selections.class}
                  label="Class"
                  onChange={handleSelectionChange}
                >
                  {classes.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth disabled={!selections.class}>
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subject"
                  value={selections.subject}
                  label="Subject"
                  onChange={handleSelectionChange}
                >
                  {subjects.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth disabled={!selections.subject}>
                <InputLabel>Strand</InputLabel>
                <Select
                  name="strand"
                  value={selections.strand}
                  label="Strand"
                  onChange={handleSelectionChange}
                >
                  {strands.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
        </Paper>

        {/* Notes, Quizzes, Resources */}
        {selections.subStrand &&
          (isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h5" gutterBottom>
                      Lesson Notes
                    </Typography>
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <Paper
                          key={note._id}
                          variant="outlined"
                          sx={{ mb: 2, p: 2 }}
                        >
                          <div
                            onClick={() => handleNoteView(note._id)}
                            id={`note-content-${note._id}`}
                            dangerouslySetInnerHTML={{ __html: note.content }}
                          />
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Button
                              startIcon={<PictureAsPdfIcon />}
                              onClick={() =>
                                handleDownloadPdf(note._id, 'lesson_note')
                              }
                              size="small"
                              variant="contained"
                            >
                              PDF
                            </Button>
                            <Button
                              startIcon={<DescriptionIcon />}
                              onClick={() =>
                                handleDownloadWord(note._id, 'lesson_note')
                              }
                              size="small"
                              variant="contained"
                              color="secondary"
                            >
                              Word
                            </Button>
                          </Stack>
                        </Paper>
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        No notes found for this topic.
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      Quizzes
                    </Typography>
                    {quizzes.length > 0 ? (
                      <Box display="flex" gap={1.5} flexWrap="wrap">
                        {quizzes.map((quiz) => (
                          <Button
                            key={quiz._id}
                            component={RouterLink}
                            to={`/quiz/${quiz._id}`}
                            variant="contained"
                            startIcon={<QuizIcon />}
                          >
                            {quiz.title}
                          </Button>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        No quizzes found for this topic.
                      </Typography>
                    )}
                  </Paper>

                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      Resources
                    </Typography>
                    {resources.length > 0 ? (
                      <List>
                        {resources.map((res) => (
                          <ListItem
                            key={res._id}
                            button
                            component="a"
                            href={`/${res.filePath.replace(/\\/g, '/')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ListItemIcon>
                              <AttachFileIcon />
                            </ListItemIcon>
                            <ListItemText primary={res.fileName} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">
                        No resources found for this topic.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          ))}
      </Container>
    </motion.div>
  );
}

export default Dashboard;
