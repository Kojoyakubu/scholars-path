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
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote as deleteDraftLearnerNote,
  resetTeacherState,
  getMyBundles,
  getTeacherAnalytics,
  generateLessonBundle, 
} from '../features/teacher/teacherSlice';
import LessonBundleForm from '../components/LessonBundleForm'; 
import BundleResultViewer from '../components/BundleResultViewer';
import DashboardBanner from '../components/DashboardBanner';
import CurriculumSelection from '../components/CurriculumSelection';

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
  const [generatingNoteId, setGeneratingNoteId] = useState(null);
  
  // Bundle generation state
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [viewBundleResult, setViewBundleResult] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  
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
      }
      return next;
    });
  }, [dispatch]);

  const handleGenerateNoteSubmit = useCallback((formData) => {
    dispatch(generateLessonNote(formData)).unwrap().then((createdNote) => {
      setSnackbar({ open: true, message: 'Lesson note generated!', severity: 'success' });
      setIsNoteModalOpen(false);
      setViewingNote(createdNote);
      // also close create tools if open
      setShowCreateTools(false);
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch]);

  const handleGenerateAiQuizSubmit = useCallback((formData) => {
    dispatch(generateAiQuiz(formData)).unwrap().then(() => {
      setSnackbar({ open: true, message: 'AI Quiz generated!', severity: 'success' });
      setIsAiQuizModalOpen(false);
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch]);

  const handleGenerateBundleSubmit = useCallback((data) => {
    dispatch(generateLessonBundle(data)).unwrap().then(() => {
      setIsBundleModalOpen(false);
      setViewBundleResult(true);
      setSnackbar({ open: true, message: 'Lesson bundle generated! 🎉', severity: 'success' });
    }).catch((error) => setSnackbar({ open: true, message: error || 'Failed', severity: 'error' }));
  }, [dispatch]);

  // Generate only lesson plan (first part of bundle)
  const handleGeneratePlan = useCallback(() => {
    if (!selections.subStrand) return;
    // close selection and open the lesson note form for user to fill details
    setIsPlanModalOpen(false);
    setIsNoteModalOpen(true);
    // note modal will use existing selections to populate topic info
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
                <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 12px', borderRadius: 12, backgroundImage: `url('https://cdn-icons-png.flaticon.com/512/8980/8980099.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>Generate Learner Notes</Typography>
                </Box>
              </Grid>

              {/** Generate Quiz */}
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
                  <Box sx={{ width: 120, height: 120, margin: '0 auto 12px', borderRadius: 12, backgroundImage: `url('https://static.vecteezy.com/system/resources/previews/009/742/591/large_2x/quiz-game-icon-outline-illustration-vector.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>Generate Quiz</Typography>
                </Box>
              </Grid>

              {/** Generate Complete Lesson Bundle */}
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
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

        <LessonBundleForm open={isBundleModalOpen} onClose={() => setIsBundleModalOpen(false)} onSubmit={handleGenerateBundleSubmit} subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''} subStrandId={selections.subStrand} isLoading={isLoading} />
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
        <Dialog open={!!viewingNote} onClose={() => setViewingNote(null)} fullWidth maxWidth="md">
          <DialogTitle>Preview Learner Note</DialogTitle>
          <DialogContent><Box><ReactMarkdown rehypePlugins={[rehypeRaw]}>{viewingNote?.content || ''}</ReactMarkdown></Box></DialogContent>
          <DialogActions><Button onClick={() => setViewingNote(null)}>Close</Button></DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default TeacherDashboard;