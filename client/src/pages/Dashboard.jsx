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
  CircularProgress, Stack, ListItemText, Avatar, Card, CardContent,
  useTheme, alpha, Chip
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { syncUserFromStorage } from '../features/auth/authSlice';
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

// Helper function for user display name
const getDisplayName = (user) => {
  if (!user) return 'Student';
  const name = user.name || user.fullName || 'Student';
  return name.split(' ')[0];
};

// Modern Section Card Component
const SectionCard = ({ children, ...props }) => (
  <Card
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.2 }}
    transition={{ duration: 0.5 }}
    sx={{
      height: '100%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: 3,
      border: '1px solid rgba(103, 126, 234, 0.2)',
      boxShadow: '0 8px 32px rgba(103, 126, 234, 0.15)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(103, 126, 234, 0.25)',
      },
      ...props.sx,
    }}
  >
    {children}
  </Card>
);

function Dashboard() {
  const theme = useTheme();
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

  // Sync user and load initial data
  useEffect(() => {
    dispatch(syncUserFromStorage());
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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', pb: 6 }}>
      {/* Hero Header */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              {getDisplayName(user).charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                  mb: 0.5,
                }}
              >
                Welcome back, {getDisplayName(user)}! 🎓
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
                Your personalized learning journey starts here
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* Topic Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionCard sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <SchoolIcon />
              </Avatar>
              <Typography variant="h5" fontWeight={700} color="primary">
                Choose Your Topic
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                {renderDropdown('level', 'Level', selections.level, levels)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderDropdown('class', 'Class', selections.class, classes, !selections.level)}
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                {renderDropdown('subject', 'Subject', selections.subject, subjects, !selections.class)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderDropdown('strand', 'Strand', selections.strand, strands, !selections.subject)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderDropdown('subStrand', 'Sub-Strand', selections.subStrand, subStrands, !selections.strand)}
              </Grid>
            </Grid>
          </SectionCard>
        </motion.div>

        {/* Content Display */}
        {selections.subStrand && (
          isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress size={60} sx={{ color: 'white' }} />
            </Box>
          ) : (
            <>
              {/* Lesson Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <SectionCard sx={{ p: 4, mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#2196F3' }}>
                      <MenuBookIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      Lesson Notes
                    </Typography>
                    {notes.length > 0 && (
                      <Chip label={`${notes.length} Available`} color="primary" size="small" />
                    )}
                  </Box>

                  {notes.length > 0 ? (
                    notes.map((note, index) => (
                      <Paper
                        key={note._id}
                        component={motion.div}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        sx={{
                          mb: 3,
                          p: 3,
                          border: '1px solid',
                          borderColor: alpha('#2196F3', 0.2),
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: alpha('#2196F3', 0.4),
                            boxShadow: `0 4px 20px ${alpha('#2196F3', 0.2)}`,
                          },
                        }}
                      >
                        <Box
                          id={`note-content-${note._id}`}
                          sx={{
                            '& h1, & h2, & h3': { fontSize: '1.3em', fontWeight: 700, mb: 2, color: '#333' },
                            '& p': { mb: 1.5, lineHeight: 1.8, color: '#555' },
                            '& a': { color: '#2196F3' },
                            '& ul, & ol': { pl: 3, mb: 2 },
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

                        <Stack direction="row" spacing={1} sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Button
                            startIcon={<PictureAsPdfIcon />}
                            onClick={() => handleDownload('pdf', note._id, 'lesson_note')}
                            size="small"
                            variant="outlined"
                          >
                            PDF
                          </Button>
                          <Button
                            startIcon={<DescriptionIcon />}
                            onClick={() => handleDownload('word', note._id, 'lesson_note')}
                            size="small"
                            variant="outlined"
                          >
                            Word
                          </Button>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      📚 No notes available yet. Check back later!
                    </Typography>
                  )}
                </SectionCard>
              </motion.div>

              <Grid container spacing={3}>
                {/* Quizzes */}
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <SectionCard sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar sx={{ bgcolor: '#FF9800' }}>
                          <QuizIcon />
                        </Avatar>
                        <Typography variant="h5" fontWeight={700} color="primary">
                          Quizzes
                        </Typography>
                        {quizzes.length > 0 && (
                          <Chip label={`${quizzes.length} Ready`} sx={{ bgcolor: '#FF9800', color: 'white' }} size="small" />
                        )}
                      </Box>

                      {quizzes.length > 0 ? (
                        <Box display="flex" gap={1.5} flexWrap="wrap">
                          {quizzes.map((quiz) => (
                            <Button
                              key={quiz._id}
                              component={RouterLink}
                              to={`/quiz/${quiz._id}`}
                              variant="contained"
                              startIcon={<EmojiEventsIcon />}
                              sx={{
                                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                                '&:hover': {
                                  boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              {quiz.title}
                            </Button>
                          ))}
                        </Box>
                      ) : (
                        <Typography color="text.secondary">
                          🎯 No quizzes available yet
                        </Typography>
                      )}
                    </SectionCard>
                  </motion.div>
                </Grid>

                {/* Resources */}
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <SectionCard sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar sx={{ bgcolor: '#4CAF50' }}>
                          <AttachFileIcon />
                        </Avatar>
                        <Typography variant="h5" fontWeight={700} color="primary">
                          Resources
                        </Typography>
                        {resources.length > 0 && (
                          <Chip label={`${resources.length} Files`} color="success" size="small" />
                        )}
                      </Box>

                      {resources.length > 0 ? (
                        <List disablePadding>
                          {resources.map((res) => (
                            <ListItem
                              key={res._id}
                              button
                              component="a"
                              href={`/${res.filePath.replace(/\\/g, '/')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                borderRadius: 1,
                                mb: 1,
                                '&:hover': {
                                  bgcolor: alpha('#4CAF50', 0.1),
                                },
                              }}
                            >
                              <ListItemIcon>
                                <AttachFileIcon sx={{ color: '#4CAF50' }} />
                              </ListItemIcon>
                              <ListItemText primary={res.fileName} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography color="text.secondary">
                          📎 No resources available yet
                        </Typography>
                      )}
                    </SectionCard>
                  </motion.div>
                </Grid>
              </Grid>

              {/* AI Insights */}
              {aiInsights && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <SectionCard sx={{ p: 4, mt: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: '#9C27B0' }}>
                        <AutoAwesomeIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700} color="primary">
                        AI Study Tips
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', color: 'text.secondary' }}>
                      {aiInsights}
                    </Typography>
                  </SectionCard>
                </motion.div>
              )}
            </>
          )
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;