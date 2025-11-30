// /client/src/pages/TeacherDashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
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
  getMyBundles,
  generateAiQuiz,
  getTeacherAnalytics,
  generateLessonBundle, 
} from '../features/teacher/teacherSlice';
import LessonNoteForm from '../components/LessonNoteForm';
import AiQuizForm from '../components/AiQuizForm';
import LessonBundleForm from '../components/LessonBundleForm'; 
import BundleResultViewer from '../components/BundleResultViewer';
import BundleManager from '../components/BundleManager';

// ✅ IMPORT NEW STAT CARD
import PolishedStatCard from '../components/Polishedstatcard';

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
  const [searchParams, setSearchParams] = useSearchParams();

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
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Tab and view state
  const tabFromUrl = parseInt(searchParams.get('tab')) || 0;
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Initialization & Handlers (Preserved from original)
  useEffect(() => {
    const tabParam = parseInt(searchParams.get('tab'));
    if (!isNaN(tabParam) && tabParam >= 0 && tabParam <= 3 && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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
    dispatch(generateLessonNote(formData)).unwrap().then(() => {
      setSnackbar({ open: true, message: 'Lesson note generated!', severity: 'success' });
      setIsNoteModalOpen(false);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchParams({ tab: newValue }, { replace: true });
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
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Box sx={{ width: '98%', mx: '1%', mt: 1, pb: 2 }}>
        
        {/* Banner */}
        <TeacherDashboardBanner
          user={user}
          collapsed={bannerCollapsed}
          setCollapsed={setBannerCollapsed}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* 🚀 QUICK ACTIONS */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                title="Create Lesson"
                description="Generate AI-powered lesson notes"
                icon={AddCircle}
                color={theme.palette.primary.main}
                onClick={() => setActiveTab(0)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                title="Review Drafts"
                description={`${draftLearnerNotes?.length || 0} notes pending`}
                icon={Preview}
                color={theme.palette.secondary.main}
                onClick={() => setActiveTab(2)}
                badge={draftLearnerNotes?.length > 0 ? draftLearnerNotes.length : null}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                title="Create Quiz"
                description="AI-generated assessments"
                icon={Quiz}
                color={theme.palette.warning.main}
                onClick={() => setIsAiQuizModalOpen(true)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                title="View Analytics"
                description="Track your performance"
                icon={Assessment}
                color={theme.palette.success.main}
                onClick={() => setActiveTab(3)} // Redirect to Analytics or Bundles
              />
            </Grid>
          </Grid>
        </Box>

        {/* 📊 UPDATED ANALYTICS OVERVIEW USING POLISHED STAT CARDS */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Overview</Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Lesson Notes */}
          <Grid item xs={12} sm={6} md={3}>
            <PolishedStatCard
              icon={Article}
              label="Lesson Notes"
              value={lessonNotes?.length || 0}
              color={theme.palette.primary.main}
              subtitle="Published notes"
              onClick={() => setActiveTab(1)}
              delay={0}
            />
          </Grid>
          
          {/* Draft Notes */}
          <Grid item xs={12} sm={6} md={3}>
            <PolishedStatCard
              icon={Preview}
              label="Draft Notes"
              value={draftLearnerNotes?.length || 0}
              color={theme.palette.secondary.main}
              subtitle="Pending review"
              onClick={() => setActiveTab(2)}
              delay={0.1}
            />
          </Grid>
          
          {/* AI Quizzes */}
          <Grid item xs={12} sm={6} md={3}>
            <PolishedStatCard
              icon={Quiz}
              label="AI Quizzes"
              value={teacherAnalytics?.totalQuizzes || 0}
              color={theme.palette.warning.main}
              subtitle="Total generated"
              delay={0.2}
            />
          </Grid>

          {/* Students / Reach (Placeholder logic based on available stats) */}
          <Grid item xs={12} sm={6} md={3}>
            <PolishedStatCard
              icon={School}
              label="Students Reached"
              value={teacherAnalytics?.totalStudents || 0}
              color={theme.palette.success.main}
              subtitle="Across all classes"
              delay={0.3}
            />
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              sx={{ px: 2, '& .MuiTab-root': { fontWeight: 600, fontSize: '1rem', textTransform: 'none', minHeight: 64 } }}
            >
              <Tab icon={<AddCircle sx={{ mr: 1 }} />} iconPosition="start" label="Create New" />
              <Tab icon={<Badge badgeContent={filteredLessonNotes.length} color="primary" sx={{ mr: 1 }}><Article /></Badge>} iconPosition="start" label="My Lesson Notes" />
              <Tab icon={<Badge badgeContent={filteredDraftNotes.length} color="secondary" sx={{ mr: 1 }}><Preview /></Badge>} iconPosition="start" label="Draft Learner Notes" />
              <Tab icon={<Folder sx={{ mr: 1 }} />} iconPosition="start" label="My Bundles" />
            </Tabs>
          </Box>

          {/* Tab Panel 0: Create New */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                {/* Curriculum Selection */}
                <Grid item xs={12}>
                  <SectionCard title="Select Curriculum" icon={<School />} color={theme.palette.info.main}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Level</InputLabel>
                          <Select name="level" value={selections.level} label="Level" onChange={handleSelectionChange}>
                            {(levels || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" disabled={!selections.level}>
                          <InputLabel>Class</InputLabel>
                          <Select name="class" value={selections.class} label="Class" onChange={handleSelectionChange}>
                            {(classes || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" disabled={!selections.class}>
                          <InputLabel>Subject</InputLabel>
                          <Select name="subject" value={selections.subject} label="Subject" onChange={handleSelectionChange}>
                            {(subjects || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" disabled={!selections.subject}>
                          <InputLabel>Learning Area / Strand</InputLabel>
                          <Select name="strand" value={selections.strand} label="Learning Area / Strand" onChange={handleSelectionChange}>
                            {(strands || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small" disabled={!selections.strand}>
                          <InputLabel>Sub-Strand</InputLabel>
                          <Select name="subStrand" value={selections.subStrand} label="Sub-Strand" onChange={handleSelectionChange}>
                            {(subStrands || []).map((item) => <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </SectionCard>
                </Grid>

                {/* Action Cards */}
                <Grid item xs={12} md={6}>
                  <SectionCard title="Generate Lesson Note" icon={<Article />} color={theme.palette.primary.main}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Create engaging lessons with AI on any topic of your choice.</Typography>
                    <Button variant="contained" fullWidth startIcon={<AutoAwesome />} onClick={() => setIsNoteModalOpen(true)} disabled={!selections.subStrand || isLoading} sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}>Generate with AI</Button>
                  </SectionCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <SectionCard title="Generate AI Quiz" icon={<Quiz />} color={theme.palette.warning.main}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Create interactive quizzes to your specifications.</Typography>
                    <Button variant="contained" fullWidth startIcon={<AutoAwesome />} onClick={() => setIsAiQuizModalOpen(true)} disabled={isLoading} sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: 2, bgcolor: theme.palette.warning.main, '&:hover': { bgcolor: theme.palette.warning.dark } }}>Generate Quiz</Button>
                  </SectionCard>
                </Grid>
                <Grid item xs={12}>
                  <SectionCard title="🚀 Generate Complete Lesson Bundle" icon={<AutoAwesome />} color={theme.palette.secondary.main}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Generate Teacher Note + Learner Note + Quiz in one click!</Typography>
                    <Button variant="contained" fullWidth startIcon={<AutoAwesome />} onClick={() => setIsBundleModalOpen(true)} disabled={!selections.subStrand || isLoading} sx={{ py: 1.8, fontWeight: 700, textTransform: 'none', borderRadius: 2, background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' }}>Generate Complete Bundle</Button>
                  </SectionCard>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Tab Panel 1: My Lesson Notes */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <TextField placeholder="Search lesson notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small" sx={{ flexGrow: 1, maxWidth: { sm: 400 } }} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
                <Tooltip title={viewMode === 'grid' ? 'Switch to List' : 'Switch to Grid'}><IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}><ViewModule /></IconButton></Tooltip>
              </Stack>
              {isLoading && !lessonNotes.length ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : filteredLessonNotes.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {viewMode === 'grid' ? (
                    <Grid container spacing={2}>
                      {filteredLessonNotes.map((note) => (
                        <Grid item xs={12} sm={6} md={4} key={note._id}>
                          <LessonNoteCard
                            note={note}
                            onGenerateLearner={() => { setGeneratingNoteId(note._id); dispatch(generateLearnerNote(note._id)).finally(() => setGeneratingNoteId(null)); }}
                            onDelete={() => setNoteToDelete(note)}
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
                          onGenerateLearner={() => { setGeneratingNoteId(note._id); dispatch(generateLearnerNote(note._id)).finally(() => setGeneratingNoteId(null)); }}
                          onDelete={() => setNoteToDelete(note)}
                          isGenerating={generatingNoteId === note._id}
                        />
                      ))}
                    </List>
                  )}
                </AnimatePresence>
              ) : (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05), border: `2px dashed ${alpha(theme.palette.info.main, 0.3)}`, borderRadius: 3 }}>
                  <Article sx={{ fontSize: 64, color: theme.palette.info.main, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary">No notes found</Typography>
                </Paper>
              )}
            </Box>
          </TabPanel>

          {/* Tab Panel 2: Draft Learner Notes */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ px: 3 }}>
              {/* Draft List Content (Simplified for brevity, similar structure to Panel 1) */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <TextField placeholder="Search drafts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small" sx={{ flexGrow: 1, maxWidth: { sm: 400 } }} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
                <Tooltip title="Switch View"><IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}><ViewModule /></IconButton></Tooltip>
              </Stack>
              {filteredDraftNotes.length > 0 ? (
                 <Grid container spacing={2}>
                   {filteredDraftNotes.map((note) => (
                     <Grid item xs={12} sm={6} md={4} key={note._id}>
                       <DraftNoteCard note={note} onPreview={() => setViewingNote(note)} onPublish={() => dispatch(publishLearnerNote(note._id))} onDelete={() => dispatch(deleteDraftLearnerNote(note._id))} />
                     </Grid>
                   ))}
                 </Grid>
              ) : (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.05), border: `2px dashed ${alpha(theme.palette.secondary.main, 0.3)}` }}>
                  <Preview sx={{ fontSize: 64, color: theme.palette.secondary.main, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary">No drafts pending</Typography>
                </Paper>
              )}
            </Box>
          </TabPanel>

          {/* Tab Panel 3: My Bundles */}
          <TabPanel value={activeTab} index={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <BundleManager />
              </Paper>
            </motion.div>
          </TabPanel>
        </Paper>

        {/* Modals */}
        <LessonNoteForm open={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSubmit={(data) => handleGenerateNoteSubmit({ ...data, subStrandId: selections.subStrand })} subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''} isLoading={isLoading} />
        <AiQuizForm open={isAiQuizModalOpen} onClose={() => setIsAiQuizModalOpen(false)} onSubmit={handleGenerateAiQuizSubmit} isLoading={isLoading} curriculum={{ levels, classes, subjects }} />
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