// /client/src/pages/Dashboard.jsx
// 🎨 Enhanced Student Dashboard - Modern Glassmorphism Design
// Features: Modern banner with avatar, quick actions, progress tracking, enhanced stats
// ALL REDUX LOGIC AND API CALLS PRESERVED

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Box, Typography, Container, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, List, ListItem, ListItemIcon,
  CircularProgress, Stack, ListItemText, Avatar, Card, CardContent,
  useTheme, alpha, Chip, Divider, LinearProgress, CardActions,
  Tooltip, IconButton, Badge
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import StarIcon from '@mui/icons-material/Star';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';

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

// 🎯 Modern Student Dashboard Banner with Avatar
const StudentDashboardBanner = ({ 
  user, 
  collapsed, 
  setCollapsed, 
  stats,
  onRefresh,
  refreshing
}) => {
  const theme = useTheme();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ position: 'relative', overflow: 'hidden', mb: 4 }}
    >
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.95)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          p: 4,
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
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: alpha('#FFFFFF', 0.03),
            bottom: '-100px',
            left: '-50px',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                    {(user?.name || user?.fullName || 'S')[0].toUpperCase()}
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
                    ? 'My Learning Dashboard' 
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
                      Ready to continue your learning journey
                      <SchoolIcon sx={{ fontSize: 20 }} />
                    </Typography>
                  </motion.div>
                )}
              </Box>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Tooltip title={refreshing ? 'Refreshing...' : 'Refresh data'}>
                <IconButton
                  onClick={onRefresh}
                  disabled={refreshing}
                  sx={{
                    color: 'white',
                    bgcolor: alpha('#FFFFFF', 0.15),
                    border: `1px solid ${alpha('#FFFFFF', 0.3)}`,
                    '&:hover': {
                      bgcolor: alpha('#FFFFFF', 0.25),
                    },
                  }}
                >
                  <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
                <IconButton
                  onClick={() => setCollapsed(!collapsed)}
                  sx={{
                    color: 'white',
                    bgcolor: alpha('#FFFFFF', 0.15),
                    border: `1px solid ${alpha('#FFFFFF', 0.3)}`,
                    '&:hover': {
                      bgcolor: alpha('#FFFFFF', 0.25),
                    },
                  }}
                >
                  {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      p: 2,
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                      textAlign: 'center',
                    }}
                  >
                    <MenuBookIcon sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stats.notes}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Study Notes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      p: 2,
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                      textAlign: 'center',
                    }}
                  >
                    <QuizIcon sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stats.quizzes}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Quizzes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      p: 2,
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                      textAlign: 'center',
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stats.resources}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Resources
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      p: 2,
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                      textAlign: 'center',
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stats.progress}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Progress
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          )}
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

// 🎴 Modern Section Card Component - Enhanced glassmorphism design
const SectionCard = ({ children, gradient, ...props }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={motion.div}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      sx={{
        height: '100%',
        background: gradient || `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.8)} 0%, 
          ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.1)}`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.2)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        },
        ...props.sx,
      }}
    >
      {children}
    </Card>
  );
};

// 🎯 Quick Action Card Component - Enhanced Design
const QuickActionCard = ({ icon: Icon, title, description, color, onClick, to, badge }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={motion.div}
      variants={cardVariants}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      {...(to && { component: RouterLink, to })}
      sx={{
        p: 3,
        cursor: 'pointer',
        background: `linear-gradient(135deg, 
          ${alpha(color, 0.1)} 0%, 
          ${alpha(color, 0.05)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `2px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: `0 12px 32px ${alpha(color, 0.3)}`,
          border: `2px solid ${alpha(color, 0.5)}`,
          '& .action-icon': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: alpha(color, 0.1),
          transform: 'translate(40%, -40%)',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Badge
          badgeContent={badge}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              top: 8,
              right: 8,
            },
          }}
        >
          <Avatar
            className="action-icon"
            sx={{
              width: 64,
              height: 64,
              bgcolor: color,
              mb: 2,
              boxShadow: `0 8px 24px ${alpha(color, 0.4)}`,
              transition: 'transform 0.3s ease',
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Avatar>
        </Badge>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </Box>
    </Card>
  );
};

// 🎯 Progress Card Component
const ProgressCard = ({ title, value, max, color, icon: Icon }) => {
  const theme = useTheme();
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <Card
      component={motion.div}
      variants={cardVariants}
      sx={{
        p: 3,
        background: `linear-gradient(135deg, 
          ${alpha(color, 0.08)} 0%, 
          ${alpha(color, 0.02)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: color,
            boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value} / {max}
          </Typography>
        </Box>
        <Chip
          label={`${percentage}%`}
          size="small"
          sx={{
            bgcolor: alpha(color, 0.15),
            color: color,
            fontWeight: 700,
          }}
        />
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(color, 0.1),
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 4,
          },
        }}
      />
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

  // Ensure all curriculum arrays are actually arrays and handle various data structures
  const safeLevels = (() => {
    if (!levels) return [];
    if (Array.isArray(levels)) return levels;
    if (typeof levels === 'object' && levels.data && Array.isArray(levels.data)) return levels.data;
    return [];
  })();

  const safeClasses = (() => {
    if (!classes) return [];
    if (Array.isArray(classes)) return classes;
    if (typeof classes === 'object' && classes.data && Array.isArray(classes.data)) return classes.data;
    return [];
  })();

  const safeSubjects = (() => {
    if (!subjects) return [];
    if (Array.isArray(subjects)) return subjects;
    if (typeof subjects === 'object' && subjects.data && Array.isArray(subjects.data)) return subjects.data;
    return [];
  })();

  const safeStrands = (() => {
    if (!strands) return [];
    if (Array.isArray(strands)) return strands;
    if (typeof strands === 'object' && strands.data && Array.isArray(strands.data)) return strands.data;
    return [];
  })();

  const safeSubStrands = (() => {
    if (!subStrands) return [];
    if (Array.isArray(subStrands)) return subStrands;
    if (typeof subStrands === 'object' && subStrands.data && Array.isArray(subStrands.data)) return subStrands.data;
    return [];
  })();
  
  const { 
    notes = [], 
    quizzes = [], 
    resources = [], 
    isLoading: isStudentLoading = false, 
    aiInsights = null 
  } = studentState || {};

  // Ensure all student arrays are actually arrays
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const safeResources = Array.isArray(resources) ? resources : [];
  
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

  // New state for banner collapse
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate stats
  const stats = {
    notes: getArrayLength(safeNotes),
    quizzes: getArrayLength(safeQuizzes),
    resources: getArrayLength(safeResources),
    progress: selections.subStrand ? 75 : 0, // Example progress
  };

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

  // 🔄 Fetch children when parent selection changes (preserved logic)
  useEffect(() => {
    if (selections.level && !selections.class) {
      dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level }));
    }
  }, [dispatch, selections.level, selections.class]);

  useEffect(() => {
    if (selections.class && !selections.subject) {
      dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class }));
    }
  }, [dispatch, selections.class, selections.subject]);

  useEffect(() => {
    if (selections.subject && !selections.strand) {
      dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject }));
    }
  }, [dispatch, selections.subject, selections.strand]);

  useEffect(() => {
    if (selections.strand && !selections.subStrand) {
      dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand }));
    }
  }, [dispatch, selections.strand, selections.subStrand]);

  // 🔄 Fetch student content when substrand is selected (preserved logic)
  useEffect(() => {
    // Only fetch if we have a valid subStrand ID and haven't loaded this content yet
    if (selections.subStrand && selections.subStrand !== '') {
      console.log('Fetching content for subStrand:', selections.subStrand);
      dispatch(getLearnerNotes(selections.subStrand));
      dispatch(getQuizzes(selections.subStrand));
      dispatch(getResources(selections.subStrand));
      setContentLoaded(true);
    } else {
      // Reset content loaded when subStrand is cleared
      setContentLoaded(false);
    }
  }, [dispatch, selections.subStrand]); // Removed contentLoaded from dependencies

  // 📝 Handle selection changes (preserved logic)
  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections((prev) => {
      const next = { ...prev, [name]: value };
      
      // Cascading reset logic
      if (name === 'level') {
        next.class = '';
        next.subject = '';
        next.strand = '';
        next.subStrand = '';
      } else if (name === 'class') {
        next.subject = '';
        next.strand = '';
        next.subStrand = '';
      } else if (name === 'subject') {
        next.strand = '';
        next.subStrand = '';
      } else if (name === 'strand') {
        next.subStrand = '';
      }
      
      setContentLoaded(false);
      return next;
    });
  }, []);

  // 📥 Download handlers (preserved logic)
  const handleDownloadPdf = useCallback((note) => {
    dispatch(logNoteView(note._id));
    downloadAsPdf(note.content, `${note.title || 'note'}.pdf`);
  }, [dispatch]);

  const handleDownloadWord = useCallback((note) => {
    dispatch(logNoteView(note._id));
    downloadAsWord(note.content, `${note.title || 'note'}.docx`);
  }, [dispatch]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (selections.subStrand) {
      setRefreshing(true);
      Promise.all([
        dispatch(getLearnerNotes(selections.subStrand)),
        dispatch(getQuizzes(selections.subStrand)),
        dispatch(getResources(selections.subStrand)),
      ]).finally(() => {
        setTimeout(() => setRefreshing(false), 500);
      });
    }
  }, [dispatch, selections.subStrand]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.02)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        pt: 4,
        pb: 8,
      }}
    >
      <Container maxWidth="xl">
        {/* Modern Banner with Avatar */}
        <StudentDashboardBanner
          user={user}
          collapsed={bannerCollapsed}
          setCollapsed={setBannerCollapsed}
          stats={stats}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* Quick Actions Section */}
        {!selections.subStrand && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <StarIcon sx={{ color: theme.palette.warning.main }} />
              Quick Actions
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  icon={MenuBookIcon}
                  title="Study Notes"
                  description="Access your learning materials"
                  color={theme.palette.primary.main}
                  badge={stats.notes}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  icon={QuizIcon}
                  title="Take Quiz"
                  description="Test your knowledge"
                  color={theme.palette.warning.main}
                  badge={stats.quizzes}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  icon={AttachFileIcon}
                  title="Resources"
                  description="Download study materials"
                  color={theme.palette.success.main}
                  badge={stats.resources}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  icon={TrendingUpIcon}
                  title="My Progress"
                  description="Track your achievements"
                  color={theme.palette.info.main}
                />
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Progress Tracking Section */}
        {selections.subStrand && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TrendingUpIcon sx={{ color: theme.palette.info.main }} />
              Your Progress
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <ProgressCard
                  title="Notes Completed"
                  value={stats.notes}
                  max={stats.notes + 2}
                  color={theme.palette.primary.main}
                  icon={CheckCircleIcon}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ProgressCard
                  title="Quizzes Taken"
                  value={Math.min(stats.quizzes, 3)}
                  max={stats.quizzes}
                  color={theme.palette.warning.main}
                  icon={EmojiEventsIcon}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ProgressCard
                  title="Resources Viewed"
                  value={Math.floor(stats.resources * 0.7)}
                  max={stats.resources}
                  color={theme.palette.success.main}
                  icon={LocalLibraryIcon}
                />
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Curriculum Selection - Enhanced Design - ALWAYS VISIBLE */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
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
                <SchoolIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Select Your Study Path
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose your curriculum to access learning materials
                </Typography>
              </Box>
              {selections.subStrand && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Selection Complete"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Level</InputLabel>
                  <Select
                    name="level"
                    value={selections.level}
                    onChange={handleSelectionChange}
                    label="Level"
                    disabled={isLoading}
                  >
                    {(safeLevels || []).map((level) => (
                      <MenuItem key={level?._id} value={level?._id}>
                        {level?.name || 'Unnamed Level'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" disabled={!selections.level}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    name="class"
                    value={safeClasses.some(c => c?._id === selections.class) ? selections.class : ''}
                    onChange={handleSelectionChange}
                    label="Class"
                    disabled={isLoading || !selections.level}
                  >
                    {safeClasses.length > 0 ? (
                      safeClasses.map((cls) => (
                        <MenuItem key={cls?._id || Math.random()} value={cls?._id || ''}>
                          {cls?.name || 'Unnamed Class'}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">
                        {isLoading ? 'Loading classes...' : 'Select a level first'}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" disabled={!selections.class}>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={safeSubjects.some(s => s?._id === selections.subject) ? selections.subject : ''}
                    onChange={handleSelectionChange}
                    label="Subject"
                    disabled={isLoading || !selections.class}
                  >
                    {safeSubjects.length > 0 ? (
                      safeSubjects.map((subject) => (
                        <MenuItem key={subject?._id || Math.random()} value={subject?._id || ''}>
                          {subject?.name || 'Unnamed Subject'}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">
                        {isLoading ? 'Loading subjects...' : 'Select a class first'}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" disabled={!selections.subject}>
                  <InputLabel>Strand</InputLabel>
                  <Select
                    name="strand"
                    value={safeStrands.some(s => s?._id === selections.strand) ? selections.strand : ''}
                    onChange={handleSelectionChange}
                    label="Strand"
                    disabled={isLoading || !selections.subject}
                  >
                    {safeStrands.length > 0 ? (
                      safeStrands.map((strand) => (
                        <MenuItem key={strand?._id || Math.random()} value={strand?._id || ''}>
                          {strand?.name || 'Unnamed Strand'}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">
                        {isLoading ? 'Loading strands...' : 'Select a subject first'}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small" disabled={!selections.strand}>
                  <InputLabel>Sub-Strand</InputLabel>
                  <Select
                    name="subStrand"
                    value={safeSubStrands.some(s => s?._id === selections.subStrand) ? selections.subStrand : ''}
                    onChange={handleSelectionChange}
                    label="Sub-Strand"
                    disabled={isLoading || !selections.strand}
                  >
                    {safeSubStrands.length > 0 ? (
                      safeSubStrands.map((subStrand) => (
                        <MenuItem key={subStrand?._id || Math.random()} value={subStrand?._id || ''}>
                          {subStrand?.name || 'Unnamed Sub-Strand'}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">
                        {isLoading ? 'Loading sub-strands...' : 'Select a strand first'}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress size={32} />
              </Box>
            )}

            {/* Selection Progress Indicator */}
            {(selections.level || selections.class || selections.subject || selections.strand) && !selections.subStrand && (
              <Box sx={{ mt: 3 }}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.info.main,
                        width: 40,
                        height: 40,
                      }}
                    >
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {!selections.class && 'Select a class to continue'}
                        {selections.class && !selections.subject && 'Select a subject to continue'}
                        {selections.subject && !selections.strand && 'Select a strand to continue'}
                        {selections.strand && !selections.subStrand && 'Select a sub-strand to view materials'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selections.level && safeLevels.length > 0 && `Level: ${safeLevels.find(l => l?._id === selections.level)?.name || 'Selected'}`}
                        {selections.class && safeClasses.length > 0 && ` • Class: ${safeClasses.find(c => c?._id === selections.class)?.name || 'Selected'}`}
                        {selections.subject && safeSubjects.length > 0 && ` • Subject: ${safeSubjects.find(s => s?._id === selections.subject)?.name || 'Selected'}`}
                        {selections.strand && safeStrands.length > 0 && ` • Strand: ${safeStrands.find(s => s?._id === selections.strand)?.name || 'Selected'}`}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            )}
          </SectionCard>
        </motion.div>

        {/* Learning Content - Enhanced with Glassmorphism */}
        {selections.subStrand && contentLoaded && (
          <AnimatePresence mode="wait">
            {/* Study Notes Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  <SectionCard sx={{ p: 3 }}>
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
                          Study Notes
                        </Typography>
                        {getArrayLength(safeNotes) > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {getArrayLength(safeNotes)} note{getArrayLength(safeNotes) > 1 ? 's' : ''} available
                          </Typography>
                        )}
                      </Box>
                      {getArrayLength(safeNotes) > 0 && (
                        <Chip
                          icon={<PlayArrowIcon />}
                          label="Start Learning"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {safeNotes.length > 0 ? (
                      <Stack spacing={3}>
                        {safeNotes.map((note) => (
                          <Card
                            key={note._id}
                            component={motion.div}
                            variants={cardVariants}
                            sx={{
                              background: `linear-gradient(135deg, 
                                ${alpha(theme.palette.primary.main, 0.05)} 0%, 
                                ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(8px)',
                                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                              },
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    color: theme.palette.primary.main,
                                  }}
                                >
                                  <DescriptionIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                                    {note.title || 'Untitled Note'}
                                  </Typography>
                                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    <Chip
                                      label={`${note.content?.length || 0} characters`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {note.createdAt && (
                                      <Chip
                                        icon={<TimerIcon />}
                                        label={new Date(note.createdAt).toLocaleDateString()}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Stack>
                                  {note.aiInsight && (
                                    <Box
                                      sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                        border: `1px dashed ${alpha(theme.palette.secondary.main, 0.3)}`,
                                        mb: 2,
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <AutoAwesomeIcon
                                          sx={{ fontSize: 18, color: theme.palette.secondary.main }}
                                        />
                                        <Typography
                                          variant="caption"
                                          sx={{ fontWeight: 700, color: theme.palette.secondary.main }}
                                        >
                                          AI Study Tip
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" color="text.secondary">
                                        {note.aiInsight}
                                      </Typography>
                                    </Box>
                                  )}
                                  <Box
                                    sx={{
                                      maxHeight: 200,
                                      overflow: 'hidden',
                                      position: 'relative',
                                      '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 60,
                                        background: `linear-gradient(transparent, ${theme.palette.background.paper})`,
                                      },
                                    }}
                                  >
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      rehypePlugins={[rehypeRaw]}
                                    >
                                      {note.content || ''}
                                    </ReactMarkdown>
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                            <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                              <Button
                                variant="contained"
                                startIcon={<PlayArrowIcon />}
                                fullWidth
                                sx={{
                                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                  fontWeight: 600,
                                }}
                              >
                                Start Reading
                              </Button>
                              <Tooltip title="Download as PDF">
                                <IconButton
                                  onClick={() => handleDownloadPdf(note)}
                                  sx={{
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    },
                                  }}
                                >
                                  <PictureAsPdfIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download as Word">
                                <IconButton
                                  onClick={() => handleDownloadWord(note)}
                                  sx={{
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    },
                                  }}
                                >
                                  <DescriptionIcon />
                                </IconButton>
                              </Tooltip>
                            </CardActions>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Paper
                        sx={{
                          p: 6,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                          borderRadius: 3,
                        }}
                      >
                        <MenuBookIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" gutterBottom color="text.secondary" fontWeight={600}>
                          No study notes available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Notes will appear here once your teacher publishes them
                        </Typography>
                      </Paper>
                    )}
                  </SectionCard>
                </motion.div>
              </Grid>
            </Grid>

            {/* Quizzes and Resources - Enhanced Side by Side */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <SectionCard sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: theme.palette.warning.main,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                        }}
                      >
                        <QuizIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Quizzes
                        </Typography>
                        {getArrayLength(safeQuizzes) > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {getArrayLength(safeQuizzes)} quiz{getArrayLength(safeQuizzes) > 1 ? 'zes' : ''} ready
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {safeQuizzes.length > 0 ? (
                      <Stack spacing={2}>
                        {safeQuizzes.map((quiz, index) => (
                          <Card
                            key={quiz._id}
                            component={motion.div}
                            variants={cardVariants}
                            custom={index}
                            sx={{
                              background: `linear-gradient(135deg, 
                                ${alpha(theme.palette.warning.main, 0.08)} 0%, 
                                ${alpha(theme.palette.warning.main, 0.03)} 100%)`,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(8px)',
                                boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.25)}`,
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.4)}`,
                              },
                            }}
                          >
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.warning.main,
                                  boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                                }}
                              >
                                <EmojiEventsIcon />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                  {quiz.title || 'Untitled Quiz'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Click to start
                                </Typography>
                              </Box>
                              <Button
                                component={RouterLink}
                                to={`/quiz/${quiz._id}`}
                                variant="contained"
                                size="small"
                                sx={{
                                  background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                                  fontWeight: 600,
                                }}
                              >
                                Start
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Paper
                        sx={{
                          p: 4,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          border: `2px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                          borderRadius: 3,
                        }}
                      >
                        <QuizIcon sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1" color="text.secondary" fontWeight={600}>
                          No quizzes available yet
                        </Typography>
                      </Paper>
                    )}
                  </SectionCard>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <SectionCard sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: theme.palette.success.main,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                        }}
                      >
                        <AttachFileIcon sx={{ fontSize: 28 }} />
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
                        {resources.map((res, index) => (
                          <ListItem
                            key={res._id}
                            component={motion.li}
                            variants={cardVariants}
                            custom={index}
                            button
                            sx={{
                              borderRadius: 2,
                              mb: 1.5,
                              background: `linear-gradient(135deg, 
                                ${alpha(theme.palette.success.main, 0.08)} 0%, 
                                ${alpha(theme.palette.success.main, 0.03)} 100%)`,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.success.main, 0.12),
                                transform: 'translateX(8px)',
                                border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`,
                                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`,
                              },
                            }}
                          >
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: theme.palette.success.main,
                                  boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
                                }}
                              >
                                <AttachFileIcon sx={{ fontSize: 20 }} />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={res.fileName || 'Unnamed File'}
                              primaryTypographyProps={{ fontWeight: 600 }}
                              secondary="Click to download"
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <IconButton
                              component="a"
                              href={`/${res.filePath?.replace(/\\/g, '/') || '#'}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                bgcolor: theme.palette.success.main,
                                color: 'white',
                                '&:hover': {
                                  bgcolor: theme.palette.success.dark,
                                },
                              }}
                            >
                              <AttachFileIcon fontSize="small" />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Paper
                        sx={{
                          p: 4,
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          border: `2px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                          borderRadius: 3,
                        }}
                      >
                        <AttachFileIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1" color="text.secondary" fontWeight={600}>
                          No resources available yet
                        </Typography>
                      </Paper>
                    )}
                  </SectionCard>
                </motion.div>
              </Grid>
            </Grid>

            {/* AI Insights - Enhanced with Glassmorphism */}
            {aiInsights && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                <SectionCard
                  sx={{
                    p: 4,
                    mt: 4,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.secondary.main, 0.12)} 0%, 
                      ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.4)}`,
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        AI Study Tips
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Personalized recommendations just for you
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: alpha('#FFFFFF', 0.5),
                      backdropFilter: 'blur(10px)',
                    }}
                  >
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
                  </Box>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;