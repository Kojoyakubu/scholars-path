// /client/src/pages/Dashboard.jsx
// 🎨 Modernized Student Dashboard - Following Design Blueprint
// Features: Enhanced hero, progress indicators, modern resource cards, improved layout
// ALL REDUX LOGIC AND API CALLS PRESERVED

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
  useTheme, alpha, Chip, Divider, LinearProgress
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Preserved imports
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

// 🎯 Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

// 🎨 Helper function for user display name (preserved)
const getDisplayName = (user) => {
  if (!user) return 'Student';
  const name = user.name || user.fullName || 'Student';
  return name.split(' ')[0];
};

// 🎨 Helper to safely get array length (preserved)
const getArrayLength = (arr) => {
  if (!arr) return 0;
  if (Array.isArray(arr)) return arr.length;
  if (typeof arr === 'object' && arr.length !== undefined) return arr.length;
  return 0;
};

// 🎴 Modern Section Card Component - Enhanced design
const SectionCard = ({ children, gradient, ...props }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      sx={{
        height: '100%',
        background: gradient || 'white',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
        ...props.sx,
      }}
    >
      {children}
    </Card>
  );
};

// 🎯 Quick Action Card Component
const QuickActionCard = ({ icon: Icon, title, description, color, onClick, to }) => {
  const theme = useTheme();
  const Component = to ? RouterLink : 'div';
  
  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      {...(to && { component: RouterLink, to })}
      sx={{
        p: 3,
        cursor: 'pointer',
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(color, 0.25)}`,
          border: `1px solid ${alpha(color, 0.4)}`,
        },
      }}
    >
      <Avatar
        sx={{
          width: 56,
          height: 56,
          bgcolor: color,
          mb: 2,
          boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Avatar>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Card>
  );
};

// 🏠 Main Student Dashboard Component
function Dashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state selectors (preserved)
  const { user } = useSelector((state) => state.auth);
  const curriculumState = useSelector((state) => state.curriculum);
  const studentState = useSelector((state) => state.student);
  
  // Safely destructure with defaults (preserved)
  const { 
    levels = [], 
    classes = [], 
    subjects = [], 
    strands = [], 
    subStrands = [], 
    isLoading: isCurriculumLoading = false 
  } = curriculumState || {};
  
  const { 
    notes = [], 
    quizzes = [], 
    resources = [], 
    isLoading: isStudentLoading = false, 
    aiInsights = null 
  } = studentState || {};
  
  const isLoading = isCurriculumLoading || isStudentLoading;

  // Component state (preserved)
  const [selections, setSelections] = useState({
    level: '', 
    class: '', 
    subject: '', 
    strand: '', 
    subStrand: '',
  });

  // Track if content has been loaded for a substrand (preserved)
  const [contentLoaded, setContentLoaded] = useState(false);

  // 🔄 Sync user and load initial data (preserved logic)
  useEffect(() => {
    dispatch(syncUserFromStorage());
    return () => {
      dispatch(resetCurriculumState());
    };
  }, [dispatch]);

  // 🔄 Navigate based on user role and fetch initial levels (preserved logic)
  useEffect(() => {
    if (!user) return;
    
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'teacher' || user.role === 'school_admin') {
      navigate('/teacher/dashboard');
    } else if (user.role === 'student') {
      dispatch(fetchItems({ entity: 'levels' }));
    }
  }, [dispatch, user, navigate]);

  // 🔄 Cascading fetches (preserved logic)
  useEffect(() => {
    if (selections.level && selections.level !== '') {
      dispatch(fetchChildren({ 
        entity: 'classes', 
        parentEntity: 'levels', 
        parentId: selections.level 
      }));
    }
  }, [selections.level, dispatch]);

  useEffect(() => {
    if (selections.class && selections.class !== '') {
      dispatch(fetchChildren({ 
        entity: 'subjects', 
        parentEntity: 'classes', 
        parentId: selections.class 
      }));
    }
  }, [selections.class, dispatch]);

  useEffect(() => {
    if (selections.subject && selections.subject !== '') {
      dispatch(fetchChildren({ 
        entity: 'strands', 
        parentEntity: 'subjects', 
        parentId: selections.subject 
      }));
    }
  }, [selections.subject, dispatch]);

  useEffect(() => {
    if (selections.strand && selections.strand !== '') {
      dispatch(fetchChildren({ 
        entity: 'subStrands', 
        parentEntity: 'strands', 
        parentId: selections.strand 
      }));
    }
  }, [selections.strand, dispatch]);

  // 🔄 Load content when substrand is selected (preserved logic)
  useEffect(() => {
    if (selections.subStrand && selections.subStrand !== '') {
      setContentLoaded(false);
      Promise.all([
        dispatch(getLearnerNotes(selections.subStrand)),
        dispatch(getQuizzes(selections.subStrand)),
        dispatch(getResources(selections.subStrand))
      ]).then(() => {
        setContentLoaded(true);
      }).catch((error) => {
        console.error('Error loading content:', error);
        setContentLoaded(true);
      });
    } else {
      setContentLoaded(false);
    }
  }, [selections.subStrand, dispatch]);

  // 📝 Form handlers (preserved logic)
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

  // 📥 Download handlers (preserved logic)
  const handleDownload = useCallback((type, noteId, noteTopic) => {
    try {
      dispatch(logNoteView(noteId));
      const elementId = `note-content-${noteId}`;
      const element = document.getElementById(elementId);
      if (!element) {
        console.error('Note content element not found');
        return;
      }
      const filename = noteTopic || 'lesson_note';
      if (type === 'pdf') {
        downloadAsPdf(element, filename);
      } else if (type === 'word') {
        downloadAsWord(element, filename);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  }, [dispatch]);

  // 📊 Calculate progress
  const calculateProgress = () => {
    const totalSteps = 5;
    const completedSteps = Object.values(selections).filter(Boolean).length;
    return (completedSteps / totalSteps) * 100;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* 🎨 Hero Section */}
      <Box
        sx={{
          background: theme.palette.background.gradient,
          color: 'white',
          py: 6,
          px: { xs: 2, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: alpha('#60A5FA', 0.1),
            top: '-200px',
            right: '-100px',
            animation: 'float 20s ease-in-out infinite',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
            '50%': { transform: 'translateY(-30px) rotate(10deg)' },
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                <motion.div variants={fadeInUp}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: alpha('#FFFFFF', 0.2),
                        border: '3px solid rgba(255,255,255,0.3)',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                      }}
                    >
                      {(user?.name || user?.fullName || 'S').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Welcome back, {getDisplayName(user)}! 👋
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                        Ready to continue your learning journey?
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Paper
                    sx={{
                      p: 2,
                      mt: 3,
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <TrendingUpIcon />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Learning Progress
                      </Typography>
                      <Chip
                        label={`${Math.round(calculateProgress())}%`}
                        size="small"
                        sx={{ bgcolor: alpha('#FFFFFF', 0.3), color: 'white', fontWeight: 700 }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress()}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha('#FFFFFF', 0.2),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#FFFFFF',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Paper>
                </motion.div>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: alpha('#FFFFFF', 0.15),
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Keep Learning!
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                    {getArrayLength(notes)} Notes • {getArrayLength(quizzes)} Quizzes Available
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 📚 Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Quick Actions */}
        {!selections.subStrand && (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={fadeInUp}>
                  <QuickActionCard
                    icon={MenuBookIcon}
                    title="Browse Curriculum"
                    description="Select your level and subject to start learning"
                    color={theme.palette.primary.main}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={fadeInUp}>
                  <QuickActionCard
                    icon={EmojiEventsIcon}
                    title="My Achievements"
                    description="View your badges and progress"
                    color={theme.palette.warning.main}
                    to="/my-badges"
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={fadeInUp}>
                  <QuickActionCard
                    icon={QuizIcon}
                    title="Practice Quizzes"
                    description="Test your knowledge with interactive quizzes"
                    color={theme.palette.success.main}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Curriculum Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionCard sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              📚 Select Your Learning Path
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small">
                  <InputLabel>Level</InputLabel>
                  <Select name="level" value={selections.level} onChange={handleSelectionChange} label="Level">
                    <MenuItem value=""><em>Select Level</em></MenuItem>
                    {Array.isArray(levels) && levels.map((lvl) => (
                      <MenuItem key={lvl._id} value={lvl._id}>{lvl.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small" disabled={!selections.level}>
                  <InputLabel>Class</InputLabel>
                  <Select name="class" value={selections.class} onChange={handleSelectionChange} label="Class">
                    <MenuItem value=""><em>Select Class</em></MenuItem>
                    {Array.isArray(classes) && classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small" disabled={!selections.class}>
                  <InputLabel>Subject</InputLabel>
                  <Select name="subject" value={selections.subject} onChange={handleSelectionChange} label="Subject">
                    <MenuItem value=""><em>Select Subject</em></MenuItem>
                    {Array.isArray(subjects) && subjects.map((subj) => (
                      <MenuItem key={subj._id} value={subj._id}>{subj.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small" disabled={!selections.subject}>
                  <InputLabel>Strand</InputLabel>
                  <Select name="strand" value={selections.strand} onChange={handleSelectionChange} label="Strand">
                    <MenuItem value=""><em>Select Strand</em></MenuItem>
                    {Array.isArray(strands) && strands.map((str) => (
                      <MenuItem key={str._id} value={str._id}>{str.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md>
                <FormControl fullWidth size="small" disabled={!selections.strand}>
                  <InputLabel>Sub-Strand</InputLabel>
                  <Select name="subStrand" value={selections.subStrand} onChange={handleSelectionChange} label="Sub-Strand">
                    <MenuItem value=""><em>Select Sub-Strand</em></MenuItem>
                    {Array.isArray(subStrands) && subStrands.map((ss) => (
                      <MenuItem key={ss._id} value={ss._id}>{ss.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SectionCard>
        </motion.div>

        {/* Content Area */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {!isLoading && selections.subStrand && contentLoaded && (
          <>
            {/* Lesson Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SectionCard sx={{ p: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: theme.palette.primary.main,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <MenuBookIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Lesson Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive learning materials
                    </Typography>
                  </Box>
                  {getArrayLength(notes) > 0 && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`${getArrayLength(notes)} Available`}
                      color="primary"
                    />
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {Array.isArray(notes) && notes.length > 0 ? (
                  notes.map((note) => (
                    <Paper
                      key={note._id}
                      sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {note.topic || 'Lesson Note'}
                      </Typography>

                      <Box
                        id={`note-content-${note._id}`}
                        sx={{
                          '& h1, & h2, & h3': { 
                            fontSize: '1.3em', 
                            fontWeight: 700, 
                            mb: 2, 
                            color: theme.palette.text.primary 
                          },
                          '& p': { mb: 1.5, lineHeight: 1.8, color: theme.palette.text.secondary },
                          '& a': { color: theme.palette.primary.main },
                          '& ul, & ol': { pl: 3, mb: 2 },
                        }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            p: ({ node, ...props }) => {
                              try {
                                const text = node?.children?.[0]?.value || '';
                                if (typeof text === 'string' && text.startsWith('[DIAGRAM:')) {
                                  return <AiImage text={text} />;
                                }
                                return <p {...props} />;
                              } catch (error) {
                                console.error('Markdown component error:', error);
                                return <p {...props} />;
                              }
                            },
                          }}
                        >
                          {note.content || ''}
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
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                    }}
                  >
                    <MenuBookIcon sx={{ fontSize: 48, color: theme.palette.info.main, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Notes Available Yet
                    </Typography>
                    <Typography color="text.secondary">
                      Check back later for learning materials
                    </Typography>
                  </Paper>
                )}
              </SectionCard>
            </motion.div>

            {/* Quizzes & Resources Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <SectionCard sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.warning.main,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                        }}
                      >
                        <QuizIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Quizzes
                        </Typography>
                        {getArrayLength(quizzes) > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {getArrayLength(quizzes)} quiz{getArrayLength(quizzes) > 1 ? 'zes' : ''} ready
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {Array.isArray(quizzes) && quizzes.length > 0 ? (
                      <Stack spacing={2}>
                        {quizzes.map((quiz) => (
                          <Button
                            key={quiz._id}
                            component={RouterLink}
                            to={`/quiz/${quiz._id}`}
                            variant="contained"
                            fullWidth
                            startIcon={<EmojiEventsIcon />}
                            sx={{
                              justifyContent: 'flex-start',
                              py: 1.5,
                              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                              '&:hover': {
                                transform: 'translateX(8px)',
                              },
                            }}
                          >
                            {quiz.title || 'Untitled Quiz'}
                          </Button>
                        ))}
                      </Stack>
                    ) : (
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                        }}
                      >
                        <QuizIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No quizzes available yet
                        </Typography>
                      </Paper>
                    )}
                  </SectionCard>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <SectionCard sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: theme.palette.success.main,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                        }}
                      >
                        <AttachFileIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Resources
                        </Typography>
                        {getArrayLength(resources) > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {getArrayLength(resources)} file{getArrayLength(resources) > 1 ? 's' : ''} available
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {Array.isArray(resources) && resources.length > 0 ? (
                      <List disablePadding>
                        {resources.map((res) => (
                          <ListItem
                            key={res._id}
                            button
                            component="a"
                            href={`/${res.filePath?.replace(/\\/g, '/') || '#'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              borderRadius: 2,
                              mb: 1,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                transform: 'translateX(8px)',
                                border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`,
                              },
                            }}
                          >
                            <ListItemIcon>
                              <AttachFileIcon sx={{ color: theme.palette.success.main }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={res.fileName || 'Unnamed File'}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                        }}
                      >
                        <AttachFileIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No resources available yet
                        </Typography>
                      </Paper>
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
                <SectionCard
                  sx={{
                    p: 4,
                    mt: 4,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: theme.palette.background.aiGradient,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: theme.palette.background.aiGradient,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        AI Study Tips
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Personalized recommendations for you
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      whiteSpace: 'pre-line',
                      color: theme.palette.text.primary,
                    }}
                  >
                    {aiInsights}
                  </Typography>
                </SectionCard>
              </motion.div>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;