import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// Redux & Components
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
  generateLearnerNoteFromStrand,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote as deleteDraftLearnerNote,
  resetTeacherState,
  getMyBundles,
  getTeacherAnalytics,
  generateLessonBundle,
  generateAiQuiz,
} from '../features/teacher/teacherSlice';

// utilities for image extraction & fetching
import { segmentHtmlWithImages, removeImageBlocks } from '../utils/imageExtractor';
import { fetchImageForQuery } from '../services/imageService';
import LessonBundleForm from '../components/LessonBundleForm'; 
import BundleResultViewer from '../components/BundleResultViewer';
import DashboardBanner from '../components/DashboardBanner';
import CurriculumSelection from '../components/CurriculumSelection';
import LessonNoteForm from '../components/LessonNoteForm';

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
  ListItemButton,
  ListItemText, // Added missing import
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
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Badge,
  Checkbox,
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
  Preview,
  Assessment,
  AutoAwesome,
  School,
  Search,
  ViewModule,
  ViewList,
  CalendarToday,
  Folder,
  ExpandMore,
  ExpandLess,
  Refresh,
  PlayArrow,
} from '@mui/icons-material';

// 🎯 Animation Variants
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

// 🎯 Modern Teacher Dashboard Banner
const TeacherDashboardBanner = ({ 
  user, 
  collapsed, 
  setCollapsed, 
  onRefresh, 
  refreshing,
}) => {
  const theme = useTheme();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ position: 'relative', overflow: 'hidden', mb: 2 }}
    >
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.95)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          p: 2,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: alpha('#FFFFFF', 0.05),
            top: '-150px',
            right: '-50px',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!collapsed && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: alpha('#FFFFFF', 0.2),
                      border: `3px solid ${alpha('#FFFFFF', 0.4)}`,
                      fontSize: '2rem',
                      fontWeight: 700,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {(user?.name || user?.fullName || 'T')[0].toUpperCase()}
                  </Avatar>
                </motion.div>
              )}
              <Box>
                <Typography
                  variant={collapsed ? 'h5' : 'h3'}
                  sx={{
                    fontWeight: 800,
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    mb: collapsed ? 0 : 0.5,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {collapsed 
                    ? 'Teacher Dashboard' 
                    : `Welcome back, ${getDisplayName(user)}! 👋`
                  }
                </Typography>
                {!collapsed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: alpha('#FFFFFF', 0.95),
                        fontWeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      Ready to inspire and educate today
                      <School sx={{ fontSize: 20 }} />
                    </Typography>
                  </motion.div>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={onRefresh}
                disabled={refreshing}
                sx={{
                  color: 'white',
                  bgcolor: alpha('#FFFFFF', 0.15),
                  '&:hover': { bgcolor: alpha('#FFFFFF', 0.25) },
                  '&:disabled': { bgcolor: alpha('#FFFFFF', 0.1) },
                }}
              >
                <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
              <IconButton
                onClick={() => setCollapsed(!collapsed)}
                sx={{
                  color: 'white',
                  bgcolor: alpha('#FFFFFF', 0.15),
                  '&:hover': { bgcolor: alpha('#FFFFFF', 0.25) },
                }}
              >
                {collapsed ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

// 🚀 Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, color, onClick, badge }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.15)}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: `0 12px 32px ${alpha(color, 0.2)}`,
          border: `1px solid ${alpha(color, 0.3)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle at top right, ${alpha(color, 0.1)}, transparent)`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(color, 0.15),
              color: color,
            }}
          >
            {badge ? (
              <Badge badgeContent={badge} color="error">
                <Icon />
              </Badge>
            ) : (
              <Icon />
            )}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <PlayArrow sx={{ color: alpha(color, 0.5) }} />
        </Box>
      </CardContent>
    </Card>
  );
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

// 📝 Lesson Note Card & List Item Components (Preserved)
const LessonNoteCard = ({ note, onGenerateLearner, onDelete, onView, isGenerating }) => {
  const theme = useTheme();
  
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout>
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
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }} noWrap>
                {note.subStrand?.name || 'Untitled Note'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarToday sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          {note.subStrand?.strand?.name && (
            <Chip
              label={note.subStrand.strand.name}
              size="small"
              sx={{ mb: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontWeight: 600 }}
            />
          )}
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Button component={RouterLink} to={`/teacher/notes/${note._id}`} size="small" startIcon={<Visibility />} sx={{ fontWeight: 600 }}>
            View
          </Button>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Generate Learner Note">
              <span>
                <IconButton onClick={onGenerateLearner} disabled={isGenerating} size="small">
                  {isGenerating ? <CircularProgress size={20} /> : <FaceRetouchingNatural color="primary" />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete Note">
              <IconButton onClick={onDelete} size="small">
                <Delete color="error" />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardActions>
      </Card>
    </motion.div>
  );
};

const DraftNoteCard = ({ note, onPreview, onPublish, onDelete }) => {
  const theme = useTheme();
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout>
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
            <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, width: 40, height: 40 }}>
              <Preview />
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }} noWrap>
                {note.subStrand?.name || 'Draft Note'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
          </Stack>
          <Chip label="Draft" size="small" color="secondary" sx={{ fontWeight: 600 }} />
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Button onClick={onPreview} size="small" startIcon={<Visibility />} sx={{ fontWeight: 600 }}>Preview</Button>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Publish to Students"><IconButton onClick={onPublish} size="small"><CheckCircle color="success" /></IconButton></Tooltip>
            <Tooltip title="Delete Draft"><IconButton onClick={onDelete} size="small"><Delete color="error" /></IconButton></Tooltip>
          </Stack>
        </CardActions>
      </Card>
    </motion.div>
  );
};

const LessonNoteListItem = ({ note, onGenerateLearner, onDelete, isGenerating }) => {
  const theme = useTheme();
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout>
      <ListItem
        disablePadding
        sx={{ mb: 1, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, borderRadius: 2, bgcolor: 'background.paper', transition: 'all 0.2s', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
        secondaryAction={
          <Stack direction="row" spacing={0.5}>
            <IconButton onClick={onGenerateLearner} disabled={isGenerating} size="small">
              {isGenerating ? <CircularProgress size={20} /> : <FaceRetouchingNatural color="primary" />}
            </IconButton>
            <IconButton onClick={onDelete} size="small"><Delete color="error" /></IconButton>
          </Stack>
        }
      >
        <ListItemButton component={RouterLink} to={`/teacher/notes/${note._id}`} sx={{ py: 2 }}>
          <ListItemText 
            primary={note.subStrand?.name || 'Untitled Note'} 
            secondary={new Date(note.createdAt).toLocaleDateString()} 
            primaryTypographyProps={{ fontWeight: 600 }} 
          />
        </ListItemButton>
      </ListItem>
    </motion.div>
  );
};

const DraftNoteListItem = ({ note, onPreview, onPublish, onDelete }) => {
  const theme = useTheme();
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout>
      <ListItem
        disablePadding
        sx={{ mb: 1, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.02), '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) } }}
        secondaryAction={
          <Stack direction="row" spacing={0.5}>
            <IconButton onClick={onPreview} size="small"><Visibility /></IconButton>
            <IconButton onClick={onPublish} size="small"><CheckCircle color="success" /></IconButton>
            <IconButton onClick={onDelete} size="small"><Delete color="error" /></IconButton>
          </Stack>
        }
      >
        <ListItemText 
          sx={{ px: 2, py: 1 }}
          primary={note.subStrand?.name || 'Draft Note'} 
          secondary="Draft"
          primaryTypographyProps={{ fontWeight: 600 }} 
        />
      </ListItem>
    </motion.div>
  );
};

// 📑 Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`dashboard-tabpanel-${index}`} aria-labelledby={`dashboard-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function TeacherDashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Redux state
  const { user } = useSelector((state) => state.auth || {});
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const {
    lessonNotes,
    draftLearnerNotes,
    isLoading,
    teacherAnalytics,
    bundleResult
  } = useSelector((state) => state.teacher);


  // Local state
  const [selections, setSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [previewSegments, setPreviewSegments] = useState([]);
  const [generatingNoteId, setGeneratingNoteId] = useState(null);
  
  // Bundle generation state
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [viewBundleResult, setViewBundleResult] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBundleSelectorOpen, setIsBundleSelectorOpen] = useState(false);
  const [isLearnerOptionsOpen, setIsLearnerOptionsOpen] = useState(false);
  const [isLearnerFromLessonOpen, setIsLearnerFromLessonOpen] = useState(false);
  const [isLearnerFromStrandOpen, setIsLearnerFromStrandOpen] = useState(false);
  const [selectedLessonForLearner, setSelectedLessonForLearner] = useState('');

  // quiz generation dialogs
  const [isQuizOptionsOpen, setIsQuizOptionsOpen] = useState(false);
  const [isQuizFromLessonOpen, setIsQuizFromLessonOpen] = useState(false);
  const [isQuizFromStrandOpen, setIsQuizFromStrandOpen] = useState(false);
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState('');
  const [quizSelectedSubStrands, setQuizSelectedSubStrands] = useState([]);

  // form state for gathering extra details when generating from strand
  const [strandForm, setStrandForm] = useState({
    term: '',
    week: '',
    dayDate: '',
    duration: '',
    classSize: '',
    contentStandardCode: '',
    indicatorCodes: '',
    reference: '',
    preferredProvider: '',
    preferredModel: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });


  // View state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateTools, setShowCreateTools] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);

  // Initialization & Handlers (Preserved from original)

  useEffect(() => {
    dispatch(syncUserFromStorage());
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
    dispatch(getTeacherAnalytics());
    dispatch(getMyBundles());
    return () => { dispatch(resetTeacherState()); };
  }, [dispatch]);

  // Dependent fetches
  useEffect(() => { if (selections.level) dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level })); }, [selections.level, dispatch]);
  useEffect(() => { if (selections.class) dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class })); }, [selections.class, dispatch]);
  useEffect(() => { if (selections.subject) dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject })); }, [selections.subject, dispatch]);
  useEffect(() => { if (selections.strand) dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand })); }, [selections.strand, dispatch]);

  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections((prev) => {
      const next = { ...prev, [name]: value };
      const resetMap = { level: ['class', 'subject', 'strand', 'subStrand'], class: ['subject', 'strand', 'subStrand'], subject: ['strand', 'subStrand'], strand: ['subStrand'] };
      if (resetMap[name]) {
        resetMap[name].forEach((k) => (next[k] = ''));
        dispatch(clearChildren({ entities: resetMap[name] }));
        // if topic selections change, clear any previously queued strands for quizzes
        setQuizSelectedSubStrands([]);
      }
      return next;
    });
  }, [dispatch]);

  const preparePreviewSegments = useCallback((note) => {
    const segments = segmentHtmlWithImages(note?.content || '');
    // initialize segments with imgUrl field set to undefined for loading
    const init = segments.map((s) => (s.type === 'image' ? { ...s, imgUrl: undefined } : s));
    setPreviewSegments(init);

    // fetch images for any image segments asynchronously
    init.forEach((seg, idx) => {
      if (seg.type === 'image') {
        const query = seg.meta?.search_query || seg.meta?.title || '';
        if (query) {
          fetchImageForQuery(query).then((url) => {
            setPreviewSegments((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], imgUrl: url || '' };
              return next;
            });
          }).catch(() => {
            setPreviewSegments((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], imgUrl: '' };
              return next;
            });
          });
        } else {
          // no search information, mark as no image
          setPreviewSegments((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], imgUrl: '' };
            return next;
          });
        }
      }
    });
  }, []);

  const displayNote = useCallback((note) => {
    if (!note) {
      setViewingNote(null);
      setPreviewSegments([]);
      return;
    }
    setViewingNote(note);
    preparePreviewSegments(note);
  }, [preparePreviewSegments]);

  const handleGenerateNoteSubmit = useCallback((formData) => {
    dispatch(generateLessonNote(formData)).unwrap().then((createdNote) => {
      setSnackbar({ open: true, message: 'Lesson note generated!', severity: 'success' });
      setIsNoteModalOpen(false);
      displayNote(createdNote);
      // also close create tools if open
      setShowCreateTools(false);
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch, displayNote]);

  const handleGenerateAiQuizSubmit = useCallback((formData) => {
    dispatch(generateAiQuiz(formData)).unwrap().then(() => {
      setSnackbar({ open: true, message: 'AI Quiz generated!', severity: 'success' });
      setIsAiQuizModalOpen(false);
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch]);

  // quiz-from-lesson flow
  const handleGenerateQuizFromLesson = useCallback(() => {
    if (!selectedLessonForQuiz) return;
    const note = (lessonNotes || []).find(n => n._id === selectedLessonForQuiz);
    const topic = note?.subStrand?.name || note?.title || 'Topic';
    dispatch(generateAiQuiz({
      topic,
      subjectName: note?.subject || '',
      className: note?.class || '',
      subStrandId: note?.subStrand?._id || note?.subStrand,
      numQuestions: 10,
    })).unwrap().then(() => {
      setSnackbar({ open: true, message: 'Quiz generated from lesson note!', severity: 'success' });
      setIsQuizFromLessonOpen(false);
      setSelectedLessonForQuiz('');
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch, selectedLessonForQuiz, lessonNotes]);

  // quiz-from-strands flow
  const handleGenerateQuizFromStrands = useCallback(() => {
    if (quizSelectedSubStrands.length === 0) return;
    // generate one quiz per selected sub-strand
    Promise.all(
      quizSelectedSubStrands.map((id) => {
        const sub = subStrands.find(s => s._id === id);
        const topic = sub?.name || 'Topic';
        return dispatch(generateAiQuiz({
          topic,
          subjectName: sub?.strand?.subject?.name || '',
          className: sub?.strand?.subject?.class?.name || '',
          subStrandId: id,
          numQuestions: 10,
        }));
      })
    ).then(() => {
      setSnackbar({ open: true, message: 'Quizzes generated for selected strands!', severity: 'success' });
      setIsQuizFromStrandOpen(false);
      setQuizSelectedSubStrands([]);
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch, quizSelectedSubStrands, subStrands]);

  const handleGenerateBundleSubmit = useCallback((data) => {
    dispatch(generateLessonBundle(data)).unwrap().then(() => {
      setIsBundleModalOpen(false);
      setViewBundleResult(true);
      setSnackbar({ open: true, message: 'Lesson bundle generated! 🎉', severity: 'success' });
      setShowCreateTools(false);
    }).catch((error) => setSnackbar({ open: true, message: error || 'Failed', severity: 'error' }));
  }, [dispatch]);

  // form input change for strand dialog
  const handleStrandFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setStrandForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const closeLearnerFromStrand = useCallback(() => {
    setIsLearnerFromStrandOpen(false);
    setSelections({ level: '', class: '', subject: '', strand: '', subStrand: '' });
    setStrandForm({
      term: '',
      week: '',
      dayDate: '',
      duration: '',
      classSize: '',
      contentStandardCode: '',
      indicatorCodes: '',
      reference: '',
      preferredProvider: '',
      preferredModel: '',
    });
  }, []);

  // dispatch generator for learner note from strand
  const handleGenerateLearnerFromStrand = useCallback(() => {
    if (!selections.subStrand) return;
    const payload = {
      subStrandId: selections.subStrand,
      school: user?.school || '',
      term: strandForm.term,
      week: strandForm.week,
      dayDate: strandForm.dayDate,
      duration: strandForm.duration,
      classSize: strandForm.classSize,
      contentStandardCode: strandForm.contentStandardCode,
      indicatorCodes: strandForm.indicatorCodes,
      reference: strandForm.reference,
      preferredProvider: strandForm.preferredProvider,
      preferredModel: strandForm.preferredModel,
    };
    dispatch(generateLearnerNoteFromStrand(payload))
      .unwrap()
      .then((created) => {
        setSnackbar({ open: true, message: 'Learner note generated (draft)!', severity: 'success' });
        displayNote(created);
        setIsLearnerFromStrandOpen(false);
        // reset selections and form
        setSelections({ level: '', class: '', subject: '', strand: '', subStrand: '' });
        setStrandForm({
          term: '',
          week: '',
          dayDate: '',
          duration: '',
          classSize: '',
          contentStandardCode: '',
          indicatorCodes: '',
          reference: '',
          preferredProvider: '',
          preferredModel: '',
        });
        dispatch(getDraftLearnerNotes());
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err || 'Failed to generate learner note', severity: 'error' });
      });
  }, [dispatch, selections.subStrand, strandForm, user]);

  // Generate only lesson plan (first part of bundle)
  const handleGeneratePlan = useCallback(() => {
    if (!selections.subStrand) return;
    // close selection and open lesson note form for user completion
    setIsPlanModalOpen(false);
    setIsNoteModalOpen(true);
  }, [selections.subStrand]);

  const handlePublishBundle = useCallback((bundle) => {
    if (bundle.learnerNote?.id) {
      dispatch(publishLearnerNote(bundle.learnerNote.id));
    }
    setViewBundleResult(false);
    setSnackbar({ open: true, message: 'Bundle published! ✨', severity: 'success' });
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getMyLessonNotes()),
      dispatch(getDraftLearnerNotes()),
      dispatch(getTeacherAnalytics()),
      dispatch(getMyBundles())
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  };



  // Filter Logic
  const filteredLessonNotes = (lessonNotes || []).filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return note.subStrand?.name?.toLowerCase().includes(query) || note.subStrand?.strand?.name?.toLowerCase().includes(query);
  });

  const filteredDraftNotes = (draftLearnerNotes || []).filter(note => {
    if (!searchQuery) return true;
    return note.subStrand?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 4 } }}>
        
        {/* Header Banner */}
        <DashboardBanner
          user={user}
          role="teacher"
          stats={[]}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          collapsed={bannerCollapsed}
          onCollapse={setBannerCollapsed}
        />

        {/* OVERVIEW SECTION */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>OVERVIEW</Typography>
          <Grid container spacing={3}>
            {/* Lesson Notes Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, textAlign: 'center', borderRadius: 1, bgcolor: '#e8e8e8', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                  {lessonNotes?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                  Lesson Notes
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Published
                </Typography>
              </Paper>
            </Grid>

            {/* Draft Notes Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, textAlign: 'center', borderRadius: 1, bgcolor: '#e8e8e8', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c3aed', mb: 1 }}>
                  {draftLearnerNotes?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                  Draft Notes
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Pending review
                </Typography>
              </Paper>
            </Grid>

            {/* AI Quizzes Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, textAlign: 'center', borderRadius: 1, bgcolor: '#e8e8e8', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', mb: 1 }}>
                  {teacherAnalytics?.totalQuizzes || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                  AI Quizzes
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Generated
                </Typography>
              </Paper>
            </Grid>

            {/* Students Reached Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, textAlign: 'center', borderRadius: 1, bgcolor: '#e8e8e8', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
                  {teacherAnalytics?.totalStudents || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>
                  Students Reached
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Across all classes
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: '#ddd' }} />

        {/* TEACHER TOOLS SECTION */}
        {showCreateTools ? (
          <Box sx={{ mt: 4, mb: 3 }}>
            <Button onClick={() => setShowCreateTools(false)} variant="text" sx={{ mb: 2 }}>← Back</Button>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>Create New</Typography>
            <Grid container spacing={3}>
              {/** Generate Lesson Plan */}
              <Grid item xs={6} sm={3}>
                <Box
                  sx={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    setSelections({ level: '', class: '', subject: '', strand: '', subStrand: '' });
                    setIsPlanModalOpen(true);
                  }}
                >
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 12px', borderRadius: 12, backgroundImage: `url('https://static.vecteezy.com/system/resources/previews/027/685/568/original/teacher-lesson-icon-flat-vector.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>Generate Lesson Plan</Typography>
                </Box>
              </Grid>

              {/** Generate Learner Notes */}
              <Grid item xs={6} sm={3}>
                <Box
                  sx={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    setSelections({ level: '', class: '', subject: '', strand: '', subStrand: '' });
                    setIsLearnerOptionsOpen(true);
                  }}
                >
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 12px', borderRadius: 12, backgroundImage: `url('https://cdn-icons-png.flaticon.com/512/8980/8980099.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>Generate Learner Notes</Typography>
                </Box>
              </Grid>

              {/** Generate Quiz */}
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setIsQuizOptionsOpen(true)}>
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 12px', borderRadius: 12, backgroundImage: `url('https://static.vecteezy.com/system/resources/previews/009/742/591/large_2x/quiz-game-icon-outline-illustration-vector.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>Generate Quiz</Typography>
                </Box>
              </Grid>

              {/** Generate Complete Lesson Bundle */}
              <Grid item xs={6} sm={3}>
                <Box
                  sx={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    setSelections({ level: '', class: '', subject: '', strand: '', subStrand: '' });
                    setIsBundleSelectorOpen(true);
                  }}
                >
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 12px', borderRadius: 12, backgroundImage: `url('https://img.freepik.com/premium-vector/color-school-tools-icon_24640-20330.jpg?w=2000')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>Generate Complete Lesson Bundle</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#333' }}>TEACHER TOOLS</Typography>
            <Grid container spacing={3}>
              {/* CREATE NEW */}
              <Grid item xs={6} sm={3}>
                <Box
                  onClick={() => setShowCreateTools(true)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                >
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 16px', borderRadius: '12px', backgroundImage: `url('https://static.vecteezy.com/system/resources/previews/015/526/676/original/presentation-creative-icon-design-free-vector.jpg')`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: '#333' }}>Create New</Typography>
                </Box>
              </Grid>

              {/* MY LESSON NOTES */}
              <Grid item xs={6} sm={3}>
                <Box onClick={() => { /* TODO: Navigate to My Lesson Notes */ }} sx={{ cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.05)' } }}>
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 16px', borderRadius: '12px', backgroundImage: 'url(https://i.pinimg.com/736x/d1/f0/68/d1f068f076dd1d2090b35d602f62948f.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: '#333' }}>My Lesson Notes</Typography>
                </Box>
              </Grid>

              {/* LEARNER NOTES */}
              <Grid item xs={6} sm={3}>
                <Box onClick={() => { /* TODO: Navigate to Learner Notes */ }} sx={{ cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.05)' } }}>
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 16px', borderRadius: '12px', backgroundImage: 'url(https://media.istockphoto.com/id/1408391194/vector/reader-reciter.jpg?s=612x612&w=0&k=20&c=DpvhTP2hQqv_XrORtg56zz61WiFalK44CPO_Ka67ozg=)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: '#333' }}>Learner Notes</Typography>
                </Box>
              </Grid>

              {/* ANALYSIS */}
              <Grid item xs={6} sm={3}>
                <Box onClick={() => { /* TODO: Navigate to Analysis */ }} sx={{ cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.05)' } }}>
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 16px', borderRadius: '12px', backgroundImage: 'url(https://png.pngtree.com/png-vector/20191009/ourlarge/pngtree-analysis-icon-png-image_1798051.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: '#333' }}>Analysis</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Modals & Dialogs */}
        {/* Plan generation modal */}
        <Dialog open={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Select Topic for Lesson Plan</DialogTitle>
          <DialogContent>
            <CurriculumSelection
              levels={levels}
              classes={classes}
              subjects={subjects}
              strands={strands}
              subStrands={subStrands}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              isLoading={isLoading || planLoading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsPlanModalOpen(false)} disabled={planLoading}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleGeneratePlan}
              disabled={!selections.subStrand || planLoading}
              startIcon={planLoading ? <CircularProgress size={20} /> : null}
            >
              {planLoading ? 'Generating...' : 'Generate Lesson Plan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bundle topic selector dialog */}
        <Dialog open={isBundleSelectorOpen} onClose={() => setIsBundleSelectorOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Select Topic for Lesson Bundle</DialogTitle>
          <DialogContent>
            <CurriculumSelection
              levels={levels}
              classes={classes}
              subjects={subjects}
              strands={strands}
              subStrands={subStrands}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              isLoading={isLoading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsBundleSelectorOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                setIsBundleSelectorOpen(false);
                setIsBundleModalOpen(true);
              }}
              disabled={!selections.subStrand}
            >
              Continue
            </Button>
          </DialogActions>
        </Dialog>

        <LessonBundleForm
          open={isBundleModalOpen}
          onClose={() => setIsBundleModalOpen(false)}
          onSubmit={handleGenerateBundleSubmit}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          subStrandId={selections.subStrand}
          isLoading={isLoading}
        />
        {/* Learner Notes Options Dialog */}
        <Dialog open={isLearnerOptionsOpen} onClose={() => setIsLearnerOptionsOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Generate Learner Notes</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Choose how you want to generate learner notes:</Typography>
            <Stack spacing={2}>
              <Button variant="outlined" onClick={() => { setIsLearnerOptionsOpen(false); setIsLearnerFromLessonOpen(true); }}>
                From Lesson Note
              </Button>
              <Button variant="contained" onClick={() => { setIsLearnerOptionsOpen(false); setSelections({ level: '', class: '', subject: '', strand: '', subStrand: '' }); setStrandForm({
                    term: '', week: '', dayDate: '', duration: '', classSize: '',
                    contentStandardCode: '', indicatorCodes: '', reference: '',
                    preferredProvider: '', preferredModel: '',
                  }); setIsLearnerFromStrandOpen(true); }}>
                From Strands
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsLearnerOptionsOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Quiz Options Dialog */}
        <Dialog open={isQuizOptionsOpen} onClose={() => setIsQuizOptionsOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Generate Quiz</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Choose how you want to generate the quiz:</Typography>
            <Stack spacing={2}>
              <Button variant="outlined" onClick={() => { setIsQuizOptionsOpen(false); setIsQuizFromLessonOpen(true); }}>
                From Lesson Note
              </Button>
              <Button variant="contained" onClick={() => { setIsQuizOptionsOpen(false); setSelections({ level: '', class: '', subject: '', strand: '', subStrand: '' }); setQuizSelectedSubStrands([]); setIsQuizFromStrandOpen(true); }}>
                From Strands
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsQuizOptionsOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* From Lesson Note flow */}
        <Dialog open={isLearnerFromLessonOpen} onClose={() => { setIsLearnerFromLessonOpen(false); setSelectedLessonForLearner(''); }} fullWidth maxWidth="md">
          <DialogTitle>Generate Learner Note from an Existing Lesson Note</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Select a lesson note to convert into a learner-friendly note.</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Paper sx={{ maxHeight: 420, overflow: 'auto' }}>
                  <List>
                    {(lessonNotes || []).map((ln) => (
                      <ListItemButton
                        key={ln._id}
                        selected={selectedLessonForLearner === ln._id}
                        onClick={() => setSelectedLessonForLearner(ln._id)}
                        sx={{ alignItems: 'flex-start' }}
                      >
                        <ListItemText
                          primary={ln.subStrand?.name || ln.title || 'Lesson Note'}
                          secondary={new Date(ln.createdAt).toLocaleString()}
                        />
                      </ListItemButton>
                    ))}
                    {(!lessonNotes || lessonNotes.length === 0) && (
                      <ListItem><ListItemText primary="No lesson notes found" /></ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, maxHeight: 520, overflow: 'auto' }}>
                  {!selectedLessonForLearner ? (
                    <Typography variant="body2" color="text.secondary">Select a lesson note to preview its content here.</Typography>
                  ) : (
                    (() => {
                      const note = (lessonNotes || []).find(n => n._id === selectedLessonForLearner);
                      return note ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>Topic: {note.subStrand?.name || note.subStrand}</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Box dangerouslySetInnerHTML={{ __html: removeImageBlocks(note.content || '') }} sx={{ '& p': { lineHeight: 1.7 } }} />
                        </Box>
                      ) : (
                        <Typography>Selected note not available.</Typography>
                      );
                    })()
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setIsLearnerFromLessonOpen(false); setSelectedLessonForLearner(''); }} disabled={isLoading}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedLessonForLearner || isLoading}
              onClick={() => {
                if (!selectedLessonForLearner) return;
                // Dispatch generation
                dispatch(generateLearnerNote(selectedLessonForLearner)).unwrap().then((created) => {
                  setSnackbar({ open: true, message: 'Learner note generated (draft)!', severity: 'success' });
                  // show preview immediately
                  displayNote(created);
                  // close the selection dialog and clear selection
                  setIsLearnerFromLessonOpen(false);
                  setSelectedLessonForLearner('');
                  // refresh drafts
                  dispatch(getDraftLearnerNotes());
                }).catch((err) => {
                  setSnackbar({ open: true, message: err || 'Failed to generate learner note', severity: 'error' });
                });
              }}
            >
              {isLoading ? <CircularProgress size={18} /> : 'Generate Learner Note'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* From Strands flow */}
        <Dialog open={isLearnerFromStrandOpen} onClose={closeLearnerFromStrand} fullWidth maxWidth="sm">
          <DialogTitle>Generate Learner Note from Strand</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Choose a strand/sub-strand and provide optional context details to guide the AI.
            </Typography>
            <CurriculumSelection
              levels={levels}
              classes={classes}
              subjects={subjects}
              strands={strands}
              subStrands={subStrands}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              isLoading={isLoading}
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Term"
                  name="term"
                  value={strandForm.term}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Week"
                  name="week"
                  value={strandForm.week}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  name="dayDate"
                  type="date"
                  value={strandForm.dayDate}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration"
                  name="duration"
                  value={strandForm.duration}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Class Size"
                  name="classSize"
                  value={strandForm.classSize}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Content Std. Code"
                  name="contentStandardCode"
                  value={strandForm.contentStandardCode}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Indicator Codes (comma separated)"
                  name="indicatorCodes"
                  value={strandForm.indicatorCodes}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Reference"
                  name="reference"
                  value={strandForm.reference}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred AI Provider"
                  name="preferredProvider"
                  value={strandForm.preferredProvider}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred AI Model"
                  name="preferredModel"
                  value={strandForm.preferredModel}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeLearnerFromStrand} disabled={isLoading}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selections.subStrand || isLoading}
              onClick={handleGenerateLearnerFromStrand}
            >
              {isLoading ? <CircularProgress size={18} /> : 'Generate Learner Note'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Quiz From Lesson Note */}
        <Dialog open={isQuizFromLessonOpen} onClose={() => setIsQuizFromLessonOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Generate Quiz from a Lesson Note</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Select a lesson note to use as the source for the quiz.</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Paper sx={{ maxHeight: 420, overflow: 'auto' }}>
                  <List>
                    {(lessonNotes || []).map((ln) => (
                      <ListItemButton
                        key={ln._id}
                        selected={selectedLessonForQuiz === ln._id}
                        onClick={() => setSelectedLessonForQuiz(ln._id)}
                        sx={{ alignItems: 'flex-start' }}
                      >
                        <ListItemText
                          primary={ln.subStrand?.name || ln.title || 'Lesson Note'}
                          secondary={new Date(ln.createdAt).toLocaleString()}
                        />
                      </ListItemButton>
                    ))}
                    {(!lessonNotes || lessonNotes.length === 0) && (
                      <ListItem><ListItemText primary="No lesson notes found" /></ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, maxHeight: 520, overflow: 'auto' }}>
                  {!selectedLessonForQuiz ? (
                    <Typography variant="body2" color="text.secondary">Select a lesson note to preview its content here.</Typography>
                  ) : (
                    (() => {
                      const note = (lessonNotes || []).find(n => n._id === selectedLessonForQuiz);
                      return note ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>Topic: {note.subStrand?.name || note.subStrand}</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Box dangerouslySetInnerHTML={{ __html: removeImageBlocks(note.content || '') }} sx={{ '& p': { lineHeight: 1.7 } }} />
                        </Box>
                      ) : (
                        <Typography>Selected note not available.</Typography>
                      );
                    })()
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setIsQuizFromLessonOpen(false); setSelectedLessonForQuiz(''); }} disabled={isLoading}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedLessonForQuiz || isLoading}
              onClick={handleGenerateQuizFromLesson}
            >
              {isLoading ? <CircularProgress size={18} /> : 'Generate Quiz'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Quiz From Strands */}
        <Dialog open={isQuizFromStrandOpen} onClose={() => setIsQuizFromStrandOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Generate Quiz from Strands</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Use the curriculum selector below, then tick one or more sub-strands.</Typography>
            <CurriculumSelection
              levels={levels}
              classes={classes}
              subjects={subjects}
              strands={strands}
              subStrands={subStrands}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              isLoading={isLoading}
            />
            {subStrands.length > 0 && (
              <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
                <List>
                  {subStrands.map(s => (
                    <ListItem key={s._id} disablePadding>
                      <ListItemButton
                        role={undefined}
                        onClick={() => {
                          setQuizSelectedSubStrands(prev =>
                            prev.includes(s._id) ? prev.filter(x => x !== s._id) : [...prev, s._id]
                          );
                        }}
                      >
                        <ListItemText primary={s.name} />
                        <Checkbox edge="end" checked={quizSelectedSubStrands.includes(s._id)} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {subStrands.length === 0 && <ListItem><ListItemText primary="No sub-strands available" /></ListItem>}
                </List>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsQuizFromStrandOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button
              variant="contained"
              disabled={quizSelectedSubStrands.length === 0 || isLoading}
              onClick={handleGenerateQuizFromStrands}
            >
              {isLoading ? <CircularProgress size={18} /> : 'Generate Quizzes'}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Note creation form modal */}
        <LessonNoteForm
          open={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSubmit={handleGenerateNoteSubmit}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          subStrandId={selections.subStrand}
          isLoading={isLoading || planLoading}
        />
        <BundleResultViewer open={viewBundleResult} onClose={() => setViewBundleResult(false)} bundleData={bundleResult} onPublish={handlePublishBundle} />
        
        {/* Delete Confirmation */}
        <Dialog open={!!noteToDelete} onClose={() => setNoteToDelete(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to delete this note?</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteToDelete(null)}>Cancel</Button>
            <Button onClick={() => { dispatch(deleteLessonNote(noteToDelete._id)); setNoteToDelete(null); }} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Note Preview */}
        <Dialog open={!!viewingNote} onClose={() => displayNote(null)} fullWidth maxWidth="md">
          <DialogTitle>Preview Lesson Note</DialogTitle>
          <DialogContent sx={{ bgcolor: 'grey.50' }}>
            <Paper elevation={0} sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Topic: {viewingNote?.subStrand?.name || viewingNote?.subStrand || ''}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{
                  '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 3, mb: 2 },
                  '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    my: 2,
                    '& td, & th': {
                      border: '1px solid #ddd',
                      padding: '12px',
                    },
                    '& th': { backgroundColor: '#f5f5f5', fontWeight: 600 },
                  },
                  '& p': { lineHeight: 1.7, mb: 1 },
                  '& ul, & ol': { pl: 3, mb: 2 },
                }}>
                {previewSegments.map((seg, idx) => {
                  if (seg.type === 'text') {
                    return (
                      <Box key={idx} dangerouslySetInnerHTML={{ __html: seg.html }} />
                    );
                  }
                  if (seg.type === 'image') {
                    // three states: undefined (loading), '' (no url/fail), string (url)
                    if (seg.imgUrl === undefined) {
                      return (
                        <Typography key={idx} variant="caption" color="text.secondary">
                          Loading image...
                        </Typography>
                      );
                    }
                    if (!seg.imgUrl) {
                      return null; // nothing to show
                    }
                    return (
                      <Box key={idx} sx={{ my: 2, textAlign: 'center' }}>
                        <img
                          src={seg.imgUrl}
                          alt={seg.meta?.title || ''}
                          style={{ maxWidth: '100%', height: 'auto' }}
                        />
                        {seg.meta?.title && (
                          <Typography variant="caption" display="block">{seg.meta.title}</Typography>
                        )}
                      </Box>
                    );
                  }
                  return null;
                })}
              </Box>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => displayNote(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default TeacherDashboard;