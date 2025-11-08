// /client/src/pages/TeacherDashboard.jsx
// 🎨 Modernized Teacher Dashboard - Improved Layout & Organization
// Features: Tab-based navigation, grid layout, search/filter, better spacing
// ALL REDUX LOGIC AND API CALLS PRESERVED

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Badge,
  CardActions,
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
  Search,
  FilterList,
  ViewModule,
  ViewList,
  CalendarToday,
  Edit,
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

// 🎨 Helper function for user display name (preserved)
const getDisplayName = (user) => {
  if (!user) return 'Teacher';
  const name = user.name || user.fullName || 'Teacher';
  return name.split(' ')[0];
};

// 🎴 Modern Section Card Component
const SectionCard = ({ title, icon, children, color, action }) => {
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
        action={action}
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

// 📝 Lesson Note Card Component (NEW - Grid Item)
const LessonNoteCard = ({ note, onGenerateLearner, onDelete, onView, isGenerating }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start" mb={2}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 40,
                height: 40,
              }}
            >
              <Article />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1rem',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {note.subStrand?.name || 'Untitled Note'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {note.subStrand?.strand?.name && (
            <Chip
              label={note.subStrand.strand.name}
              size="small"
              sx={{
                mb: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            />
          )}
        </CardContent>

        <Divider />

        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Button
            component={RouterLink}
            to={`/teacher/notes/${note._id}`}
            size="small"
            startIcon={<Visibility />}
            sx={{ fontWeight: 600 }}
          >
            View
          </Button>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Generate Learner Note">
              <span>
                <IconButton
                  onClick={onGenerateLearner}
                  disabled={isGenerating}
                  size="small"
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  {isGenerating ? (
                    <CircularProgress size={20} />
                  ) : (
                    <FaceRetouchingNatural color="primary" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete Note">
              <IconButton
                onClick={onDelete}
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                <Delete color="error" />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardActions>
      </Card>
    </motion.div>
  );
};

// 📋 Draft Note Card Component (NEW)
const DraftNoteCard = ({ note, onPreview, onPublish, onDelete }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
          bgcolor: alpha(theme.palette.secondary.main, 0.02),
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.2)}`,
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start" mb={2}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                width: 40,
                height: 40,
              }}
            >
              <Preview />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1rem',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {note.subStrand?.name || 'Draft Note'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Chip
            label="Draft"
            size="small"
            color="secondary"
            sx={{ fontWeight: 600 }}
          />
        </CardContent>

        <Divider />

        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Button
            onClick={onPreview}
            size="small"
            startIcon={<Visibility />}
            sx={{ fontWeight: 600 }}
          >
            Preview
          </Button>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Publish to Students">
              <IconButton
                onClick={onPublish}
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                  },
                }}
              >
                <CheckCircle color="success" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Draft">
              <IconButton
                onClick={onDelete}
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                <Delete color="error" />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardActions>
      </Card>
    </motion.div>
  );
};

// 📋 Lesson Note List Item Component (NEW - for list view)
const LessonNoteListItem = ({ note, onGenerateLearner, onDelete, isGenerating }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <ListItem
        disablePadding
        sx={{
          mb: 1,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 2,
          bgcolor: 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
        secondaryAction={
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Generate Learner Note">
              <span>
                <IconButton
                  onClick={onGenerateLearner}
                  disabled={isGenerating}
                  size="small"
                >
                  {isGenerating ? (
                    <CircularProgress size={20} />
                  ) : (
                    <FaceRetouchingNatural color="primary" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete Note">
              <IconButton onClick={onDelete} size="small">
                <Delete color="error" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      >
        <ListItemButton
          component={RouterLink}
          to={`/teacher/notes/${note._id}`}
          sx={{ py: 2 }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 10 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Article />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {note.subStrand?.name || 'Untitled Note'}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CalendarToday sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                </Stack>
                {note.subStrand?.strand?.name && (
                  <Chip
                    label={note.subStrand.strand.name}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </ListItemButton>
      </ListItem>
    </motion.div>
  );
};

// 📋 Draft Note List Item Component (NEW - for list view)
const DraftNoteListItem = ({ note, onPreview, onPublish, onDelete }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <ListItem
        disablePadding
        sx={{
          mb: 1,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.secondary.main, 0.02),
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.4)}`,
          },
        }}
        secondaryAction={
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Preview">
              <IconButton onClick={onPreview} size="small">
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Publish to Students">
              <IconButton onClick={onPublish} size="small">
                <CheckCircle color="success" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Draft">
              <IconButton onClick={onDelete} size="small">
                <Delete color="error" />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      >
        <ListItemText
          primary={
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                }}
              >
                <Preview />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {note.subStrand?.name || 'Draft Note'}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                  <CalendarToday sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                  <Chip
                    label="Draft"
                    size="small"
                    color="secondary"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Stack>
              </Box>
            </Stack>
          }
          sx={{ pl: 2, py: 1.5, pr: 15 }}
        />
      </ListItem>
    </motion.div>
  );
};

// 📑 Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function TeacherDashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Redux state (all preserved)
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

  // Local state (all preserved + new ones)
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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // NEW: Tab and view state
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Initialization (all preserved)
  useEffect(() => {
    dispatch(syncUserFromStorage());
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
    dispatch(getTeacherAnalytics());

    return () => {
      dispatch(resetTeacherState());
    };
  }, [dispatch]);

  // Curriculum selection handlers (all preserved)
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

  // Handlers (all preserved)
  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections((prev) => {
      const next = { ...prev, [name]: value };
      // Cascading reset logic
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

  const handleGenerateNoteSubmit = useCallback(
    (formData) => {
      dispatch(generateLessonNote(formData))
        .unwrap()
        .then(() => {
          setSnackbar({
            open: true,
            message: 'Lesson note generated successfully!',
            severity: 'success',
          });
          setIsNoteModalOpen(false);
        })
        .catch((err) => {
          setSnackbar({
            open: true,
            message: err || 'Failed to generate lesson note',
            severity: 'error',
          });
        });
    },
    [dispatch]
  );

  const handleGenerateAiQuizSubmit = useCallback(
    (formData) => {
      dispatch(generateAiQuiz(formData))
        .unwrap()
        .then(() => {
          setSnackbar({
            open: true,
            message: 'AI Quiz generated successfully!',
            severity: 'success',
          });
          setIsAiQuizModalOpen(false);
        })
        .catch((err) => {
          setSnackbar({
            open: true,
            message: err || 'Failed to generate AI quiz',
            severity: 'error',
          });
        });
    },
    [dispatch]
  );

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // NEW: Filter notes based on search
  const filteredLessonNotes = (lessonNotes || []).filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.subStrand?.name?.toLowerCase().includes(query) ||
      note.subStrand?.strand?.name?.toLowerCase().includes(query)
    );
  });

  const filteredDraftNotes = (draftLearnerNotes || []).filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return note.subStrand?.name?.toLowerCase().includes(query);
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, pb: 6 }}>
      {/* Hero Section (preserved) */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4,
          },
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  Welcome back, {getDisplayName(user)}! 👋
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.95,
                    fontWeight: 400,
                    textShadow: '0 1px 5px rgba(0,0,0,0.1)',
                  }}
                >
                  Create engaging lessons and track your impact
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: { xs: 64, md: 80 },
                  height: { xs: 64, md: 80 },
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  fontSize: '2rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {getDisplayName(user).charAt(0)}
              </Avatar>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -3 }}>
        {/* Analytics Cards (preserved) */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <StatCard
            icon={Article}
            label="Lesson Notes"
            value={teacherAnalytics?.totalLessonNotes || lessonNotes?.length || 0}
            color={theme.palette.primary.main}
            delay={0}
          />
          <StatCard
            icon={Preview}
            label="Draft Notes"
            value={teacherAnalytics?.totalDraftNotes || draftLearnerNotes?.length || 0}
            color={theme.palette.secondary.main}
            delay={0.1}
          />
          <StatCard
            icon={Quiz}
            label="AI Quizzes"
            value={teacherAnalytics?.totalQuizzes || 0}
            color={theme.palette.success.main}
            delay={0.2}
          />
        </Grid>

        {/* Main Content with Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minHeight: 64,
                },
              }}
            >
              <Tab
                icon={<AddCircle sx={{ mr: 1 }} />}
                iconPosition="start"
                label="Create New"
              />
              <Tab
                icon={
                  <Badge badgeContent={filteredLessonNotes.length} color="primary" sx={{ mr: 1 }}>
                    <Article />
                  </Badge>
                }
                iconPosition="start"
                label="My Lesson Notes"
              />
              <Tab
                icon={
                  <Badge badgeContent={filteredDraftNotes.length} color="secondary" sx={{ mr: 1 }}>
                    <Preview />
                  </Badge>
                }
                iconPosition="start"
                label="Draft Learner Notes"
              />
            </Tabs>
          </Box>

          {/* Tab Panel 0: Create New */}
          <TabPanel value={activeTab} index={0}>
            <Container maxWidth="md">
              <Grid container spacing={3}>
                {/* Curriculum Selection */}
                <Grid item xs={12}>
                  <SectionCard
                    title="Select Curriculum"
                    icon={<School />}
                    color={theme.palette.info.main}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Level</InputLabel>
                          <Select
                            name="level"
                            value={selections.level}
                            label="Level"
                            onChange={handleSelectionChange}
                          >
                            {(levels || []).map((item) => (
                              <MenuItem key={item._id} value={item._id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" disabled={!selections.level}>
                          <InputLabel>Class</InputLabel>
                          <Select
                            name="class"
                            value={selections.class}
                            label="Class"
                            onChange={handleSelectionChange}
                          >
                            {(classes || []).map((item) => (
                              <MenuItem key={item._id} value={item._id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" disabled={!selections.class}>
                          <InputLabel>Subject</InputLabel>
                          <Select
                            name="subject"
                            value={selections.subject}
                            label="Subject"
                            onChange={handleSelectionChange}
                          >
                            {(subjects || []).map((item) => (
                              <MenuItem key={item._id} value={item._id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" disabled={!selections.subject}>
                          <InputLabel>Learning Area / Strand</InputLabel>
                          <Select
                            name="strand"
                            value={selections.strand}
                            label="Learning Area / Strand"
                            onChange={handleSelectionChange}
                          >
                            {(strands || []).map((item) => (
                              <MenuItem key={item._id} value={item._id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small" disabled={!selections.strand}>
                          <InputLabel>Sub-Strand</InputLabel>
                          <Select
                            name="subStrand"
                            value={selections.subStrand}
                            label="Sub-Strand"
                            onChange={handleSelectionChange}
                          >
                            {(subStrands || []).map((item) => (
                              <MenuItem key={item._id} value={item._id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </SectionCard>
                </Grid>

                {/* Generate Lesson Note */}
                <Grid item xs={12} md={6}>
                  <SectionCard
                    title="Generate Lesson Note"
                    icon={<Article />}
                    color={theme.palette.primary.main}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Create engaging lessons with AI on any topic of your choice.
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<AutoAwesome />}
                      onClick={() => setIsNoteModalOpen(true)}
                      disabled={!selections.subStrand || isLoading}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        borderRadius: 2,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                        '&:hover': {
                          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                        },
                      }}
                    >
                      Generate with AI
                    </Button>
                  </SectionCard>
                </Grid>

                {/* Generate AI Quiz */}
                <Grid item xs={12} md={6}>
                  <SectionCard
                    title="Generate AI Quiz"
                    icon={<Quiz />}
                    color={theme.palette.warning.main}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Create interactive quizzes to your specifications.
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<AutoAwesome />}
                      onClick={() => setIsAiQuizModalOpen(true)}
                      disabled={isLoading}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        borderRadius: 2,
                        bgcolor: theme.palette.warning.main,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.warning.main, 0.4)}`,
                        '&:hover': {
                          bgcolor: theme.palette.warning.dark,
                          boxShadow: `0 6px 20px ${alpha(theme.palette.warning.main, 0.6)}`,
                        },
                      }}
                    >
                      Generate Quiz
                    </Button>
                  </SectionCard>
                </Grid>
              </Grid>
            </Container>
          </TabPanel>

          {/* Tab Panel 1: My Lesson Notes */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3 }}>
              {/* Search and Filter Bar */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <TextField
                  placeholder="Search lesson notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, maxWidth: { sm: 400 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}>
                    <IconButton
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      sx={{
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    >
                      {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Lesson Notes Display */}
              {isLoading && !lessonNotes.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={48} />
                </Box>
              ) : filteredLessonNotes.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {viewMode === 'grid' ? (
                    <Grid container spacing={3}>
                      {filteredLessonNotes.map((note) => (
                        <Grid item xs={12} sm={6} md={4} key={note._id}>
                          <LessonNoteCard
                            note={note}
                            onGenerateLearner={() => {
                              setGeneratingNoteId(note._id);
                              dispatch(generateLearnerNote(note._id))
                                .finally(() => setGeneratingNoteId(null));
                            }}
                            onDelete={() => setNoteToDelete(note)}
                            onView={() => {}}
                            isGenerating={generatingNoteId === note._id}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <List disablePadding>
                      {filteredLessonNotes.map((note) => (
                        <LessonNoteListItem
                          key={note._id}
                          note={note}
                          onGenerateLearner={() => {
                            setGeneratingNoteId(note._id);
                            dispatch(generateLearnerNote(note._id))
                              .finally(() => setGeneratingNoteId(null));
                          }}
                          onDelete={() => setNoteToDelete(note)}
                          isGenerating={generatingNoteId === note._id}
                        />
                      ))}
                    </List>
                  )}
                </AnimatePresence>
              ) : (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    border: `2px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                    borderRadius: 3,
                  }}
                >
                  <Article sx={{ fontSize: 64, color: theme.palette.info.main, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom color="text.secondary" fontWeight={600}>
                    {searchQuery ? 'No notes found' : 'No lesson notes yet'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Start creating engaging lesson notes with AI'}
                  </Typography>
                  {!searchQuery && (
                    <Button
                      variant="contained"
                      startIcon={<AddCircle />}
                      onClick={() => setActiveTab(0)}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Create Your First Note
                    </Button>
                  )}
                </Paper>
              )}
            </Box>
          </TabPanel>

          {/* Tab Panel 2: Draft Learner Notes */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ px: 3 }}>
              {/* Search and View Toggle Bar */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <TextField
                  placeholder="Search draft notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, maxWidth: { sm: 400 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Tooltip title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}>
                  <IconButton
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    sx={{
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    }}
                  >
                    {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Draft Notes Display */}
              {isLoading && !draftLearnerNotes.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={48} />
                </Box>
              ) : filteredDraftNotes.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {viewMode === 'grid' ? (
                    <Grid container spacing={3}>
                      {filteredDraftNotes.map((note) => (
                        <Grid item xs={12} sm={6} md={4} key={note._id}>
                          <DraftNoteCard
                            note={note}
                            onPreview={() => setViewingNote(note)}
                            onPublish={() => dispatch(publishLearnerNote(note._id))}
                            onDelete={() => dispatch(deleteDraftLearnerNote(note._id))}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <List disablePadding>
                      {filteredDraftNotes.map((note) => (
                        <DraftNoteListItem
                          key={note._id}
                          note={note}
                          onPreview={() => setViewingNote(note)}
                          onPublish={() => dispatch(publishLearnerNote(note._id))}
                          onDelete={() => dispatch(deleteDraftLearnerNote(note._id))}
                        />
                      ))}
                    </List>
                  )}
                </AnimatePresence>
              ) : (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    border: `2px dashed ${alpha(theme.palette.secondary.main, 0.3)}`,
                    borderRadius: 3,
                  }}
                >
                  <Preview sx={{ fontSize: 64, color: theme.palette.secondary.main, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom color="text.secondary" fontWeight={600}>
                    {searchQuery ? 'No drafts found' : 'No draft notes pending'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Draft learner notes will appear here for review before publishing'}
                  </Typography>
                </Paper>
              )}
            </Box>
          </TabPanel>
        </Paper>

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
          curriculum={{ levels, classes, subjects }}
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