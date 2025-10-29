// /client/src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Box, Typography, Container, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, List, ListItem, ListItemIcon,
  CircularProgress, Stack, ListItemText
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
import { downloadAsPdf, downloadAsWord } from '../utils/downloadHelper';
import AiImage from '../components/AiImage';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.55, delay } },
  viewport: { once: false, amount: 0.2 }, // ← replays on scroll
});

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const curriculumState = useSelector((state) => state.curriculum);
  const studentState = useSelector((state) => state.student);
  const { levels, classes, subjects, strands, subStrands, isLoading: isCurriculumLoading } = curriculumState;
  const { notes, quizzes, resources, isLoading: isStudentLoading, aiInsights } = studentState;
  const isLoading = isCurriculumLoading || isStudentLoading;

  const [selections, setSelections] = useState({
    level: '', class: '', subject: '', strand: '', subStrand: '',
  });

  // Role redirects + initial load
  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') navigate('/admin');
    if (user.role === 'teacher' || user.role === 'school_admin') navigate('/teacher/dashboard');
    if (user.role === 'student') dispatch(fetchItems({ entity: 'levels' }));
    return () => dispatch(resetCurriculumState());
  }, [dispatch, user, navigate]);

  // Cascading fetches
  useEffect(() => {
    if (selections.level)
      dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level }));
  }, [selections.level, dispatch]);

  useEffect(() => {
    if (selections.class)
      dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class }));
  }, [selections.class, dispatch]);

  useEffect(() => {
    if (selections.subject)
      dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject }));
  }, [selections.subject, dispatch]);

  useEffect(() => {
    if (selections.strand)
      dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand }));
  }, [selections.strand, dispatch]);

  useEffect(() => {
    if (selections.subStrand) {
      dispatch(getLearnerNotes(selections.subStrand));
      dispatch(getQuizzes(selections.subStrand));
      dispatch(getResources(selections.subStrand));
    }
  }, [selections.subStrand, dispatch]);

  // Selection handler
  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections((prev) => {
      const next = { ...prev, [name]: value };
      const resetMap = {
        level: ['class', 'subject', 'strand', 'subStrand'],
        class: ['subject', 'strand', 'subStrand'],
        subject: ['strand', 'subStrand'],
        strand: ['subStrand'],
      };
      if (resetMap[name]) {
        resetMap[name].forEach((k) => (next[k] = ''));
        dispatch(clearChildren({ entities: resetMap[name] }));
      }
      return next;
    });
  }, [dispatch]);

  // Downloads
  const handleDownload = useCallback((type, noteId, noteTopic) => {
    dispatch(logNoteView(noteId));
    const elementId = `note-content-${noteId}`;
    type === 'pdf' ? downloadAsPdf(elementId, noteTopic) : downloadAsWord(elementId, noteTopic);
  }, [dispatch]);

  const renderDropdown = (name, label, value, items, disabled = false) => (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select name={name} value={value} label={label} onChange={handleSelectionChange}>
        {items.map((item) => (
          <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box
        textAlign="center"
        my={5}
        component={motion.div}
        {...fadeUp(0)}
        style={{
          backgroundColor: '#145A32',
          padding: '32px 16px',
          borderRadius: 12,
          color: '#E8F5E9',
          boxShadow: '0 8px 20px rgba(20,90,50,0.4)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Your Learning Journey, {user?.fullName?.split(' ')[0]} 🌿
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Choose a topic to explore AI-powered notes, quizzes, and resources.
        </Typography>
      </Box>

      {/* Curriculum Selection */}
      <Paper
        elevation={4}
        component={motion.div}
        {...fadeUp(0.05)}
        sx={{ p: 3, mb: 5, borderLeft: '6px solid #1E8449', borderRadius: 3 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            {renderDropdown('level', 'Level', selections.level, levels)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderDropdown('class', 'Class', selections.class, classes, !selections.level)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderDropdown('subject', 'Subject', selections.subject, subjects, !selections.class)}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderDropdown('strand', 'Strand', selections.strand, strands, !selections.subject)}
          </Grid>
          <Grid item xs={12}>
            {renderDropdown('subStrand', 'Sub-Strand', selections.subStrand, subStrands, !selections.strand)}
          </Grid>
        </Grid>
      </Paper>

      {/* Content */}
      {selections.subStrand && (
        isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress color="success" />
          </Box>
        ) : (
          <>
            {/* Lesson Notes */}
            <Paper
              elevation={3}
              component={motion.div}
              {...fadeUp(0.1)}
              sx={{
                p: 3,
                mb: 3,
                borderLeft: '6px solid #1E8449',
                borderRadius: 3,
                bgcolor: '#F1F8E9',
              }}
            >
              <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
                Lesson Notes
              </Typography>
              {notes.length > 0 ? (
                notes.map((note) => (
                  <Paper
                    key={note._id}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      p: 2,
                      borderColor: '#C8E6C9',
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                    }}
                    component={motion.div}
                    {...fadeUp(0.12)}
                  >
                    <Box
                      id={`note-content-${note._id}`}
                      sx={{
                        '& h1, & h2, & h3': { fontSize: '1.2em', fontWeight: 'bold', mb: 1 },
                        '& p': { mb: 1 },
                        '& a': { color: '#1E8449' },
                      }}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({ node, ...props }) => {
                            const text = node?.children?.[0]?.value || '';
                            if (typeof text === 'string' && text.startsWith('[DIAGRAM:')) {
                              return <AiImage text={text} />;
                            }
                            return <p {...props} />;
                          },
                        }}
                      >
                        {note.content}
                      </ReactMarkdown>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: '#A9DFBF' }}>
                      <Button
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleDownload('pdf', note._id, 'lesson_note')}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: '#145A32',
                          borderColor: '#28B463',
                          '&:hover': { bgcolor: '#E8F5E9' },
                        }}
                      >
                        PDF
                      </Button>
                      <Button
                        startIcon={<DescriptionIcon />}
                        onClick={() => handleDownload('word', note._id, 'lesson_note')}
                        size="small"
                        variant="outlined"
                        sx={{
                          color: '#1E8449',
                          borderColor: '#1E8449',
                          '&:hover': { bgcolor: '#E8F5E9' },
                        }}
                      >
                        Word
                      </Button>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary">No notes found for this topic.</Typography>
              )}
            </Paper>

            <Grid container spacing={3}>
              {/* Quizzes */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  component={motion.div}
                  {...fadeUp(0.25)}
                  sx={{ p: 3, borderLeft: '6px solid #28B463', borderRadius: 3 }}
                >
                  <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
                    Quizzes
                  </Typography>
                  {quizzes.length > 0 ? (
                    <Box display="flex" gap={1.5} flexWrap="wrap">
                      {quizzes.map((quiz, i) => (
                        <motion.div
                          key={quiz._id}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.45, delay: 0.27 + i * 0.05 },
                          }}
                          viewport={{ once: false, amount: 0.2 }}
                        >
                          <Button
                            component={RouterLink}
                            to={`/quiz/${quiz._id}`}
                            variant="contained"
                            startIcon={<QuizIcon />}
                            sx={{
                              bgcolor: '#28B463',
                              '&:hover': { bgcolor: '#1D8348' },
                            }}
                          >
                            {quiz.title}
                          </Button>
                        </motion.div>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No quizzes found for this topic.</Typography>
                  )}
                </Paper>
              </Grid>

              {/* Resources */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={3}
                  component={motion.div}
                  {...fadeUp(0.4)}
                  sx={{ p: 3, borderLeft: '6px solid #1E8449', borderRadius: 3 }}
                >
                  <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
                    Resources
                  </Typography>
                  {resources.length > 0 ? (
                    <List>
                      {resources.map((res, i) => (
                        <motion.div
                          key={res._id}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.45, delay: 0.42 + i * 0.05 },
                          }}
                          viewport={{ once: false, amount: 0.2 }}
                        >
                          <ListItem
                            button
                            component="a"
                            href={`/${res.filePath.replace(/\\/g, '/')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ListItemIcon><AttachFileIcon sx={{ color: '#145A32' }} /></ListItemIcon>
                            <ListItemText primary={res.fileName} />
                          </ListItem>
                        </motion.div>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">No resources found for this topic.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* AI Insights */}
            {aiInsights && (
              <Paper
                elevation={3}
                component={motion.div}
                {...fadeUp(0.55)}
                sx={{
                  p: 3, mt: 3,
                  borderLeft: '6px solid #145A32',
                  borderRadius: 3,
                  bgcolor: '#F1F8E9',
                }}
              >
                <Typography variant="h6" gutterBottom color="primary" fontWeight={700}>
                  Personalized AI Insights
                </Typography>
                <Typography variant="body1" color="text.secondary" whiteSpace="pre-line">
                  {aiInsights}
                </Typography>
              </Paper>
            )}
          </>
        )
      )}
    </Container>
  );
}

export default Dashboard;
