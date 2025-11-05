// /client/src/pages/TeacherDashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// Redux & Components
import { syncUserFromStorage } from '../features/auth/authSlice'; // ✅ 1. Added for Hero Header
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
  Avatar, // ✅ 2. Added for Hero Header
  useTheme, // ✅ 3. Added for new components
  alpha, // ✅ 4. Added for new components
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
} from '@mui/icons-material';

// --- Reusable Sub-Components ---

// ✅ 5. Upgraded SectionCard with "glassmorphism" style
const SectionCard = ({ title, icon, children }) => (
  <Card
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    sx={{
      height: '100%',
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: 3,
      border: '1px solid rgba(103, 126, 234, 0.2)',
      boxShadow: '0 8px 32px rgba(103, 126, 234, 0.15)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <CardHeader
      avatar={icon}
      title={title}
      titleTypographyProps={{
        variant: 'h6',
        fontWeight: 700,
        color: 'primary.main',
      }}
    />
    <CardContent>{children}</CardContent>
  </Card>
);

// ✅ 6. Upgraded StatCard from AdminDashboard (with "Active" text removed)
const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} lg={4}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              color,
              0.1
            )} 0%, ${alpha(color, 0.05)} 100%)`,
            border: `1px solid ${alpha(color, 0.1)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 40px ${alpha(color, 0.2)}`,
              border: `1px solid ${alpha(color, 0.3)}`,
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
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    mb: 1,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(
                      color,
                      0.7
                    )} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  {value}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${color} 0%, ${alpha(
                    color,
                    0.8
                  )} 100%)`,
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

// --- Dropdown Component (Unchanged) ---
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

// ✅ 7. Helper function for Hero Header
const getDisplayName = (user) => {
  if (!user) return 'Teacher';
  const name = user.name || user.fullName || 'Teacher';
  return name.split(' ')[0]; // Get first name
};

// --- Main Component ---
function TeacherDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {}); // ✅ 8. Get user for Hero
  const { levels, classes, subjects, strands, subStrands } = useSelector(
    (state) => state.curriculum
  );
  const {
    lessonNotes,
    draftLearnerNotes,
    analytics,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.teacher);

  // All state hooks from your file (unchanged)
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [generatingNoteId, setGeneratingNoteId] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);

  // All useEffect hooks from your file (unchanged)
  useEffect(() => {
    dispatch(syncUserFromStorage()); // ✅ 9. Sync user on load
    dispatch(fetchLevels());
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
    dispatch(getTeacherAnalytics());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      setSnackbar({
        open: true,
        message,
        severity: isError ? 'error' : 'success',
      });
      dispatch(resetTeacherState());
    }
  }, [message, isError, dispatch]);

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

  // All callback hooks from your file (unchanged)
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

  const handleGenerateNoteSubmit = useCallback(
    (formData) => {
      dispatch(generateLessonNote(formData))
        .unwrap()
        .then(() => setIsNoteModalOpen(false))
        .catch(() => {});
    },
    [dispatch]
  );

  const handleGenerateAiQuizSubmit = useCallback(
    (formData) => {
      dispatch(generateAiQuiz(formData))
        .unwrap()
        .then(() => setIsAiQuizModalOpen(false))
        .catch(() => {});
    },
    [dispatch]
  );

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    // ✅ 10. Main gradient background
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pb: 6,
      }}
    >
      {/* ✅ 11. Hero Header from AdminDashboard */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
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
                Welcome back, {getDisplayName(user)}! 👩‍🏫
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                }}
              >
                Here are your tools and performance insights.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ✅ 12. Main Content Wrapper */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, mt: 3 }}>
        {/* Analytics Insights Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: 'white', fontWeight: 700, mb: 3 }}
          >
            Analytics & Insights
          </Typography>
          <Grid container spacing={3}>
            {isLoading && !analytics.totalNoteViews ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  mt: 3,
                }}
              >
                <CircularProgress sx={{ color: 'white' }} />
              </Box>
            ) : (
              <>
                {/* ✅ 13. Using the new, upgraded StatCard */}
                <StatCard
                  label="Total Note Views"
                  value={analytics.totalNoteViews ?? 0}
                  icon={Preview}
                  color="#2196F3"
                  delay={0.1}
                />
                <StatCard
                  label="Total Quiz Attempts"
                  value={analytics.totalQuizAttempts ?? 0}
                  icon={Assessment}
                  color="#FF9800"
                  delay={0.2}
                />
                <StatCard
                  label="Average Quiz Score"
                  value={`${Math.round(analytics.averageScore ?? 0)}%`}
                  icon={BarChart}
                  color="#4CAF50"
                  delay={0.3}
                />
              </>
            )}
          </Grid>
        </Box>

        {/* ✅ 14. Your functional components, now styled with SectionCard */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <SectionCard
              title="Content Generators"
              icon={<AddCircle color="primary" />}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" component="h3">
                    Lesson Note Generator
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select a topic from the curriculum to generate a new
                    AI-powered lesson note.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      {renderDropdown(
                        'level',
                        'Level',
                        selections.level,
                        levels,
                        handleSelectionChange
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {renderDropdown(
                        'class',
                        'Class',
                        selections.class,
                        classes,
                        handleSelectionChange,
                        !selections.level
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {renderDropdown(
                        'subject',
                        'Subject',
                        selections.subject,
                        subjects,
                        handleSelectionChange,
                        !selections.class
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {renderDropdown(
                        'strand',
                        'Strand',
                        selections.strand,
                        strands,
                        handleSelectionChange,
                        !selections.subject
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      {renderDropdown(
                        'subStrand',
                        'Sub-Strand',
                        selections.subStrand,
                        subStrands,
                        handleSelectionChange,
                        !selections.strand
                      )}
                    </Grid>
                  </Grid>
                  <Button
                    variant="contained"
                    onClick={() => setIsNoteModalOpen(true)}
                    disabled={!selections.subStrand || isLoading}
                    sx={{ mt: 2 }}
                  >
                    Generate Lesson Note
                  </Button>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="h6" component="h3">
                    Quiz Generator
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Automatically create a WAEC-standard quiz on a subject of
                    your choice.
                  </Typography>
                  <Stack spacing={2} direction="row">
                    <Button
                      variant="contained"
                      onClick={() => setIsAiQuizModalOpen(true)}
                      startIcon={<Quiz />}
                    >
                      Generate with AI
                    </Button>
                    <Button variant="outlined" disabled>
                      Create Manually (Soon)
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </SectionCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Stack spacing={4}>
              <SectionCard
                title="My Generated Lesson Notes"
                icon={<Article color="action" />}
              >
                {isLoading && !lessonNotes.length ? (
                  <CircularProgress />
                ) : (
                  <List disablePadding>
                    {lessonNotes.length > 0 ? (
                      lessonNotes.map((note) => (
                        <ListItem
                          key={note._id}
                          disablePadding
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Generate Learner's Version">
                                <IconButton
                                  onClick={() => {
                                    setGeneratingNoteId(note._id);
                                    dispatch(generateLearnerNote(note._id))
                                      .finally(() =>
                                        setGeneratingNoteId(null)
                                      );
                                  }}
                                  disabled={generatingNoteId === note._id}
                                >
                                  {generatingNoteId === note._id ? (
                                    <CircularProgress size={22} />
                                  ) : (
                                    <FaceRetouchingNatural color="primary" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Note">
                                <IconButton
                                  onClick={() => setNoteToDelete(note)}
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
                              primary={`Note for ${
                                note.subStrand?.name || '...'
                              }`}
                              secondary={`Created on ${new Date(
                                note.createdAt
                              ).toLocaleDateString()}`}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        You haven't generated any lesson notes yet.
                      </Typography>
                    )}
                  </List>
                )}
              </SectionCard>

              <SectionCard
                title="Draft Learner Notes (For Review)"
                icon={<Visibility color="action" />}
              >
                {isLoading && !draftLearnerNotes.length ? (
                  <CircularProgress />
                ) : (
                  <List disablePadding>
                    {draftLearnerNotes.length > 0 ? (
                      draftLearnerNotes.map((note) => (
                        <ListItem
                          key={note._id}
                          disablePadding
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Preview">
                                <IconButton
                                  onClick={() => setViewingNote(note)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Publish to Students">
                                <IconButton
                                  onClick={() =>
                                    dispatch(publishLearnerNote(note._id))
                                  }
                                >
                                  <CheckCircle color="success" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Draft">
                                <IconButton
                                  onClick={() =>
                                    dispatch(deleteDraftLearnerNote(note._id))
                                  }
                                >
                                  <Delete color="error" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          }
                        >
                          <ListItemText
                            primary={`Draft for: ${
                              note.subStrand?.name || 'N/A'
                            }`}
                            secondary={`Generated on ${new Date(
                              note.createdAt
                            ).toLocaleDateString()}`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        No draft learner notes pending review.
                      </Typography>
                    )}
                  </List>
                )}
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>

        {/* --- Modals & Snackbars (Unchanged) --- */}
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
                '& h2, & h3': { fontSize: '1.2em', fontWeight: 'bold' },
                '& p': { fontSize: '1em' },
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
      </Box>
    </Box>
  );
}

export default TeacherDashboard;