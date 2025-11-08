// /client/src/pages/TeacherDashboard.jsx
// 🎨 Modernized Teacher Dashboard - Following Design Blueprint
// Features: Enhanced hero, improved stat cards, modern action panels, better layout
// ALL REDUX LOGIC AND API CALLS PRESERVED

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// Redux & Components (all preserved)
import { syncUserFromStorage } from '../features/auth/authSlice';
import {
  fetchItems,
  fetchChildren,
  clearChildren,
} from '../features/curriculum/curriculumSlice';
import {
  generateLessonNote,
  getMyLessonNotes,
  deleteLessonNote,
  generateLearnerNote,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote as deleteDraftLearnerNote,
  resetTeacherState,
  generateAiQuiz,
  getTeacherAnalytics,
} from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import AiQuizForm from '../components/AiQuizForm';

// MUI Imports
import {
  Box,
  Typography,
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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Avatar,
  useTheme,
  alpha,
  Container,
  Chip,
} from '@mui/material';

// Icon Imports
import {
  Article,
  Delete,
  FaceRetouchingNatural,
  CheckCircle,
  Visibility,
  AddCircle,
  Quiz,
  BarChart,
  Preview,
  Assessment,
  AutoAwesome,
  TrendingUp,
  School,
} from '@mui/icons-material';

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
  if (!user) return 'Teacher';
  const name = user.name || user.fullName || 'Teacher';
  return name.split(' ')[0];
};

// 🎴 Modern Section Card Component
const SectionCard = ({ title, icon, children, color }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: color || theme.palette.primary.main }}>
            {icon}
          </Avatar>
        }
        title={title}
        titleTypographyProps={{
          variant: 'h6',
          fontWeight: 700,
        }}
      />
      <Divider />
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// 📊 Enhanced Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} lg={4}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
            border: `1px solid ${alpha(color, 0.15)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 40px ${alpha(color, 0.25)}`,
              border: `1px solid ${alpha(color, 0.3)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: `radial-gradient(circle at top right, ${alpha(color, 0.15)}, transparent)`,
              pointerEvents: 'none',
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 700,
                    display: 'block',
                    mb: 1,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {value}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

// 📝 Dropdown Component (preserved)
const renderDropdown = (
  name,
  label,
  value,
  items,
  onChange,
  disabled = false
) => (
  <FormControl fullWidth disabled={disabled}>
    <InputLabel>{label}</InputLabel>
    <Select name={name} value={value} label={label} onChange={onChange}>
      {items.map((item) => (
        <MenuItem key={item._id} value={item._id}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

// 🏠 Main Teacher Dashboard Component
function TeacherDashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state selectors (preserved)
  const { user } = useSelector((state) => state.auth || {});
  const { levels, classes, subjects, strands, subStrands } = useSelector(
    (state) => state.curriculum
  );
  const {
    lessonNotes,
    draftLearnerNotes,
    isLoading,
    teacherAnalytics,
  } = useSelector((state) => state.teacher);

  // Component state (preserved)
  const [selections, setSelections] = useState({
    level: '',
    class: '',
    subject: '',
    strand: '',
    subStrand: '',
  });
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [generatingNoteId, setGeneratingNoteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // 🔄 Initialize and fetch data (preserved logic)
  useEffect(() => {
    dispatch(syncUserFromStorage());
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
    dispatch(getTeacherAnalytics());
    return () => dispatch(resetTeacherState());
  }, [dispatch]);

  // 🔄 Cascading fetches (preserved logic)
  useEffect(() => {
    if (selections.level) {
      dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level }));
    }
  }, [selections.level, dispatch]);

  useEffect(() => {
    if (selections.class) {
      dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class }));
    }
  }, [selections.class, dispatch]);

  useEffect(() => {
    if (selections.subject) {
      dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject }));
    }
  }, [selections.subject, dispatch]);

  useEffect(() => {
    if (selections.strand) {
      dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand }));
    }
  }, [selections.strand, dispatch]);

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

  // 📤 Action handlers (preserved logic)
  const handleGenerateNoteSubmit = useCallback((data) => {
    dispatch(generateLessonNote(data))
      .unwrap()
      .then(() => {
        setIsNoteModalOpen(false);
        setSnackbar({ open: true, message: 'Lesson note generated!', severity: 'success' });
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err.message || 'Error generating note', severity: 'error' });
      });
  }, [dispatch]);

  const handleGenerateAiQuizSubmit = useCallback((data) => {
    dispatch(generateAiQuiz(data))
      .unwrap()
      .then(() => {
        setIsAiQuizModalOpen(false);
        setSnackbar({ open: true, message: 'AI Quiz generated!', severity: 'success' });
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err.message || 'Error generating quiz', severity: 'error' });
      });
  }, [dispatch]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

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
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: alpha('#FFFFFF', 0.2),
                    border: '3px solid rgba(255,255,255,0.3)',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                  }}
                >
                  {(user?.name || user?.fullName || 'T').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    Welcome, {getDisplayName(user)}! 👨‍🏫
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                    Create engaging lessons and track your impact
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <School sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {teacherAnalytics?.totalNotes || lessonNotes?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                      Lesson Notes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <Preview sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {teacherAnalytics?.draftCount || draftLearnerNotes?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                      Drafts Pending
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      textAlign: 'center',
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {teacherAnalytics?.totalPublished || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                      Published
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      {/* 📚 Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Analytics Stats */}
        {teacherAnalytics && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Your Impact
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <StatCard
                icon={Article}
                label="Total Lessons"
                value={teacherAnalytics.totalNotes || 0}
                color={theme.palette.primary.main}
                delay={0}
              />
              <StatCard
                icon={CheckCircle}
                label="Published Notes"
                value={teacherAnalytics.totalPublished || 0}
                color={theme.palette.success.main}
                delay={0.1}
              />
              <StatCard
                icon={Assessment}
                label="Total Views"
                value={teacherAnalytics.totalViews || 0}
                color={theme.palette.info.main}
                delay={0.2}
              />
            </Grid>
          </motion.div>
        )}

        {/* Curriculum Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              📚 Select Curriculum
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md>
                {renderDropdown('level', 'Level', selections.level, levels || [], handleSelectionChange)}
              </Grid>
              <Grid item xs={12} sm={6} md>
                {renderDropdown('class', 'Class', selections.class, classes || [], handleSelectionChange, !selections.level)}
              </Grid>
              <Grid item xs={12} sm={6} md>
                {renderDropdown('subject', 'Subject', selections.subject, subjects || [], handleSelectionChange, !selections.class)}
              </Grid>
              <Grid item xs={12} sm={6} md>
                {renderDropdown('strand', 'Strand', selections.strand, strands || [], handleSelectionChange, !selections.subject)}
              </Grid>
              <Grid item xs={12} sm={6} md>
                {renderDropdown('subStrand', 'Sub-Strand', selections.subStrand, subStrands || [], handleSelectionChange, !selections.strand)}
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Action Panels & Lists */}
        <Grid container spacing={4}>
          {/* Left Column - Actions */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={4}>
              {/* Lesson Note Generation */}
              <SectionCard
                title="Generate Lesson Note"
                icon={<Article />}
                color={theme.palette.primary.main}
              >
                {!selections.subStrand ? (
                  <Alert severity="info">
                    Select a curriculum path above to generate lesson notes
                  </Alert>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Generate a detailed lesson note for the selected sub-strand using AI.
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setIsNoteModalOpen(true)}
                      startIcon={<AddCircle />}
                      size="large"
                      sx={{ 
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      }}
                    >
                      Generate with AI
                    </Button>
                  </Box>
                )}
              </SectionCard>

              {/* AI Quiz Generation */}
              <SectionCard
                title="Generate AI Quiz"
                icon={<Quiz />}
                color={theme.palette.warning.main}
              >
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create interactive quizzes for your students on any topic of your choice.
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setIsAiQuizModalOpen(true)}
                    startIcon={<AutoAwesome />}
                    size="large"
                    sx={{ 
                      background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                    }}
                  >
                    Generate with AI
                  </Button>
                  <Button variant="outlined" fullWidth disabled>
                    Create Manually (Coming Soon)
                  </Button>
                </Stack>
              </SectionCard>
            </Stack>
          </Grid>

          {/* Right Column - Lists */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={4}>
              {/* Lesson Notes List */}
              <SectionCard
                title="My Generated Lesson Notes"
                icon={<Article />}
                color={theme.palette.primary.main}
              >
                {isLoading && !lessonNotes.length ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List disablePadding>
                    {lessonNotes.length > 0 ? (
                      lessonNotes.map((note) => (
                        <ListItem
                          key={note._id}
                          disablePadding
                          sx={{
                            mb: 1,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                          }}
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Generate Learner's Version">
                                <IconButton
                                  onClick={() => {
                                    setGeneratingNoteId(note._id);
                                    dispatch(generateLearnerNote(note._id))
                                      .finally(() => setGeneratingNoteId(null));
                                  }}
                                  disabled={generatingNoteId === note._id}
                                  size="small"
                                >
                                  {generatingNoteId === note._id ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <FaceRetouchingNatural color="primary" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Note">
                                <IconButton
                                  onClick={() => setNoteToDelete(note)}
                                  size="small"
                                >
                                  <Delete color="error" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          }
                        >
                          <ListItemButton
                            component={RouterLink}
                            to={`/teacher/notes/${note._id}`}
                          >
                            <ListItemText
                              primary={`Note for ${note.subStrand?.name || '...'}`}
                              secondary={`Created on ${new Date(note.createdAt).toLocaleDateString()}`}
                              primaryTypographyProps={{ fontWeight: 600 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))
                    ) : (
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                        }}
                      >
                        <Article sx={{ fontSize: 48, color: theme.palette.info.main, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          You haven't generated any lesson notes yet.
                        </Typography>
                      </Paper>
                    )}
                  </List>
                )}
              </SectionCard>

              {/* Draft Learner Notes */}
              <SectionCard
                title="Draft Learner Notes (For Review)"
                icon={<Visibility />}
                color={theme.palette.secondary.main}
              >
                {isLoading && !draftLearnerNotes.length ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List disablePadding>
                    {draftLearnerNotes.length > 0 ? (
                      draftLearnerNotes.map((note) => (
                        <ListItem
                          key={note._id}
                          disablePadding
                          sx={{
                            mb: 1,
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.secondary.main, 0.05),
                            },
                          }}
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Preview">
                                <IconButton
                                  onClick={() => setViewingNote(note)}
                                  size="small"
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Publish to Students">
                                <IconButton
                                  onClick={() => dispatch(publishLearnerNote(note._id))}
                                  size="small"
                                >
                                  <CheckCircle color="success" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Draft">
                                <IconButton
                                  onClick={() => dispatch(deleteDraftLearnerNote(note._id))}
                                  size="small"
                                >
                                  <Delete color="error" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          }
                        >
                          <ListItemText
                            primary={`Draft for: ${note.subStrand?.name || 'N/A'}`}
                            secondary={`Generated on ${new Date(note.createdAt).toLocaleDateString()}`}
                            primaryTypographyProps={{ fontWeight: 600 }}
                            sx={{ pl: 2, py: 1.5 }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Paper
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                        }}
                      >
                        <Visibility sx={{ fontSize: 48, color: theme.palette.info.main, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No draft learner notes pending review.
                        </Typography>
                      </Paper>
                    )}
                  </List>
                )}
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>

        {/* Modals & Snackbars (all preserved) */}
        <LessonNoteForm
          open={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSubmit={(data) =>
            handleGenerateNoteSubmit({
              ...data,
              subStrandId: selections.subStrand,
            })
          }
          subStrandName={
            subStrands.find((s) => s._id === selections.subStrand)?.name || ''
          }
          isLoading={isLoading}
        />
        
        <AiQuizForm
          open={isAiQuizModalOpen}
          onClose={() => setIsAiQuizModalOpen(false)}
          onSubmit={handleGenerateAiQuizSubmit}
          isLoading={isLoading}
          curriculum={{ subjects, classes }}
        />
        
        <Dialog open={!!noteToDelete} onClose={() => setNoteToDelete(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this lesson note?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteToDelete(null)}>Cancel</Button>
            <Button
              onClick={() => {
                dispatch(deleteLessonNote(noteToDelete._id));
                setNoteToDelete(null);
              }}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        <Dialog
          open={!!viewingNote}
          onClose={() => setViewingNote(null)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Preview Learner Note</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                '& h2, & h3': { fontSize: '1.2em', fontWeight: 'bold', mb: 2 },
                '& p': { fontSize: '1em', mb: 1.5, lineHeight: 1.7 },
              }}
            >
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {viewingNote?.content || ''}
              </ReactMarkdown>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewingNote(null)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default TeacherDashboard;