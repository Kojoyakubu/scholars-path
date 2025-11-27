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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mb: { xs: 3, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.95)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
          backdropFilter: 'blur(18px)',
          borderRadius: { xs: '16px', md: '24px' },
          p: { xs: 2.5, sm: 3, md: 4 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
          boxShadow: '0px 6px 24px rgba(31, 38, 135, 0.18)',
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 2.5 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 2, md: 3 },
              }}
            >
              {!collapsed && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                  <Avatar
                    sx={{
                      width: { xs: 56, sm: 64, md: 80 },
                      height: { xs: 56, sm: 64, md: 80 },
                      bgcolor: alpha('#FFFFFF', 0.2),
                      border: `3px solid ${alpha('#FFFFFF', 0.4)}`,
                      fontSize: { xs: '1.5rem', md: '2rem' },
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
                  sx={{
                    typography: collapsed
                      ? { xs: 'subtitle1', md: 'h5' }
                      : { xs: 'h6', md: 'h3' },
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
                      sx={{
                        typography: { xs: 'body2', sm: 'body1' },
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

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                alignSelf: { xs: 'flex-start', md: 'flex-end' },
              }}
            >
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
              <Grid container spacing={1.5} sx={{ mt: { xs: 2, md: 3 } }}>
                <Grid item xs={6} sm={4} md={3}>
                  <Box
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      borderRadius: { xs: 2, md: 2.5 },
                      p: { xs: 1.5, md: 2 },
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                      textAlign: 'center',
                      height: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                    }}
                  >
                    <MenuBookIcon sx={{ fontSize: 28, mb: 1 }} />
                    <Typography
                      sx={{
                        typography: { xs: 'subtitle1', md: 'h5' },
                        fontWeight: 700,
                        mb: 0.25,
                      }}
                    >
                      {stats.notes}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Study Notes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <Box
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      borderRadius: { xs: 2, md: 2.5 },
                      p: { xs: 1.5, md: 2 },
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                      textAlign: 'center',
                      height: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                    }}
                  >
                    <QuizIcon sx={{ fontSize: 28, mb: 1 }} />
                    <Typography
                      sx={{
                        typography: { xs: 'subtitle1', md: 'h5' },
                        fontWeight: 700,
                        mb: 0.25,
                      }}
                    >
                      {stats.quizzes}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Quizzes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <Box
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      borderRadius: { xs: 2, md: 2.5 },
                      p: { xs: 1.5, md: 2 },
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                      textAlign: 'center',
                      height: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 28, mb: 1 }} />
                    <Typography
                      sx={{
                        typography: { xs: 'subtitle1', md: 'h5' },
                        fontWeight: 700,
                        mb: 0.25,
                      }}
                    >
                      {stats.resources}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Resources
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <Box
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.15),
                      backdropFilter: 'blur(10px)',
                      borderRadius: { xs: 2, md: 2.5 },
                      p: { xs: 1.5, md: 2 },
                      border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                      textAlign: 'center',
                      height: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 28, mb: 1 }} />
                    <Typography
                      sx={{
                        typography: { xs: 'subtitle1', md: 'h5' },
                        fontWeight: 700,
                        mb: 0.25,
                      }}
                    >
                      {stats.progress}%
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
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
        backdropFilter: 'blur(14px)',
        borderRadius: { xs: 2, md: 3 },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        transition: 'all 0.25s ease',
        boxShadow: {
          xs: '0px 2px 6px rgba(0,0,0,0.05)',
          md: `0 10px 28px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
        '&:hover': {
          transform: { xs: 'none', md: 'translateY(-4px)' },
          boxShadow: `0 16px 36px ${alpha(theme.palette.primary.main, 0.18)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
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
    learnerNotes = [],
    quizzes = [], 
    resources = [], 
    isLoading: isStudentLoading = false, 
    aiInsights = null,
    error = null
  } = studentState || {};

  // Log studentState for debugging
  console.log('Student State:', {
    notesCount: Array.isArray(learnerNotes) ? learnerNotes.length : 'not an array',
    learnerNotes: learnerNotes,
    quizzesCount: Array.isArray(quizzes) ? quizzes.length : 'not an array',
    resourcesCount: Array.isArray(resources) ? resources.length : 'not an array',
    isLoading: isStudentLoading,
    error: error
  });

  // Ensure all student arrays are actually arrays
  const safeNotes = Array.isArray(learnerNotes) ? learnerNotes : [];
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const safeResources = Array.isArray(resources) ? resources : [];
  
  const isLoading = isCurriculumLoading || isStudentLoading;

  // Component state (preserved)
  // Initialize selections from localStorage (level & class are pre-selected)
  const getInitialSelections = () => {
    try {
      const saved = localStorage.getItem('studentClassSelection');
      if (saved) {
        const { levelId, classId } = JSON.parse(saved);
        return {
          level: levelId,
          class: classId,
          subject: '',
          strand: '',
          subStrand: '',
        };
      }
    } catch (error) {
      console.error('Error loading class selection:', error);
    }
    return {
      level: '',
      class: '',
      subject: '',
      strand: '',
      subStrand: '',
    };
  };

  const [selections, setSelections] = useState(getInitialSelections());

  // Track if content has been loaded for a substrand (preserved)
  const [contentLoaded, setContentLoaded] = useState(false);

  // New state for banner collapse
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ State for viewing notes
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
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

  // Redirect to class selection if no level/class is set
  useEffect(() => {
    if (user && user.role === 'student') {
      if (!selections.level || !selections.class) {
        console.log('⚠️ No class selection found, redirecting to selection page');
        navigate('/student/select-class');
      }
    }
  }, [user, selections.level, selections.class, navigate]);

// 🔄 Navigate based on user role and auto-fetch subjects for student
  useEffect(() => {
    if (!user) return;
    
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'teacher' || user.role === 'school_admin') {
      navigate('/teacher/dashboard');
    } else if (user.role === 'student') {
      // Auto-fetch subjects when student enters dashboard with pre-selected class
      if (selections.class) {
        console.log('📚 Auto-fetching subjects for class:', selections.class);
        dispatch(fetchChildren({ 
          entity: 'subjects', 
          parentEntity: 'classes', 
          parentId: selections.class 
        }));
      }
    }
  }, [dispatch, user, navigate, selections.class]);

  // 🔄 Fetch children when selection changes (subject → strand → substrand)
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
    // Only fetch if we have a valid subStrand ID
    if (selections.subStrand && selections.subStrand !== '') {
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║      FETCHING STUDENT CONTENT                      ║');
      console.log('╚════════════════════════════════════════════════════╝');
      console.log('📍 SubStrand ID:', selections.subStrand);
      console.log('👤 User Info:', {
        name: user?.name || user?.fullName || 'Unknown',
        role: user?.role,
        school: user?.school,
        schoolId: user?.schoolId,
        id: user?._id || user?.id
      });
      console.log('🏫 Looking for notes from teachers at:', user?.school?.name || user?.school || 'Unknown School');
      console.log('─────────────────────────────────────────────────────');
      
      // Double check the subStrand ID before calling
      const subStrandId = selections.subStrand;
      console.log('🔍 About to dispatch with:', {
        subStrandId: subStrandId,
        type: typeof subStrandId,
        isValid: !!subStrandId && subStrandId !== '',
        selectionsObject: selections
      });
      
      // Fetch notes
      dispatch(getLearnerNotes(subStrandId))
        .unwrap()
        .then((response) => {
          console.log('✅ NOTES RESPONSE:', response);
          console.log('   - Type:', typeof response);
          console.log('   - Is Array:', Array.isArray(response));
          console.log('   - Count:', Array.isArray(response) ? response.length : 'N/A');
          if (Array.isArray(response) && response.length > 0) {
            console.log('   - Sample Note:', {
              title: response[0]?.title,
              subStrand: response[0]?.subStrand,
              school: response[0]?.school,
              status: response[0]?.status,
              publishedBy: response[0]?.publishedBy || response[0]?.createdBy
            });
          } else {
            console.log('   ⚠️ No notes returned - Check:');
            console.log('      1. Teacher published notes for this sub-strand?');
            console.log('      2. Teacher is from same school?');
            console.log('      3. Notes marked as "published" not "draft"?');
          }
        })
        .catch((error) => {
          console.error('❌ ERROR FETCHING NOTES:', error);
          console.error('   - Message:', error?.message);
          console.error('   - Response:', error?.response);
          console.error('   - Status:', error?.response?.status);
        });
      
      // Fetch quizzes
      dispatch(getQuizzes(subStrandId))
        .unwrap()
        .then((response) => {
          console.log('✅ QUIZZES RESPONSE:', {
            count: Array.isArray(response) ? response.length : 'N/A',
            data: response
          });
        })
        .catch((error) => {
          console.error('❌ ERROR FETCHING QUIZZES:', error);
        });
      
      // Fetch resources
      dispatch(getResources(subStrandId))
        .unwrap()
        .then((response) => {
          console.log('✅ RESOURCES RESPONSE:', {
            count: Array.isArray(response) ? response.length : 'N/A',
            data: response
          });
        })
        .catch((error) => {
          console.error('❌ ERROR FETCHING RESOURCES:', error);
        });
      
      setContentLoaded(true);
      console.log('════════════════════════════════════════════════════');
    } else {
      // Reset content loaded when subStrand is cleared
      setContentLoaded(false);
    }
  }, [dispatch, selections.subStrand, user]); // Added user to dependencies

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

  // Handle subject card click
  const handleSubjectSelect = useCallback((subjectId) => {
    setSelections((prev) => ({
      ...prev,
      subject: subjectId,
      strand: '',
      subStrand: '',
    }));
    setContentLoaded(false);
  }, []);

  // Handle "Change Class" button
  const handleChangeClass = useCallback(() => {
    localStorage.removeItem('studentClassSelection');
    navigate('/student/select-class');
  }, [navigate]);

  // Handle back to subjects
  const handleBackToSubjects = useCallback(() => {
    setSelections((prev) => ({
      ...prev,
      subject: '',
      strand: '',
      subStrand: '',
    }));
    setContentLoaded(false);
  }, []);


  // ✅ FIXED: Download handlers
  const handleDownloadPdf = useCallback((note) => {
    dispatch(logNoteView(note._id));
    
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-note-content';
    tempDiv.innerHTML = note.content;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    const noteName = note.subStrand?.name || 'note';
    downloadAsPdf('temp-note-content', noteName);
    
    setTimeout(() => {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }, 1000);
  }, [dispatch]);

  const handleDownloadWord = useCallback((note) => {
    dispatch(logNoteView(note._id));
    
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-note-content-word';
    tempDiv.innerHTML = note.content;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    const noteName = note.subStrand?.name || 'note';
    downloadAsWord('temp-note-content-word', noteName);
    
    setTimeout(() => {
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }, 1000);
  }, [dispatch]);

  // ✅ NEW: Handle viewing note in modal
  const handleViewNote = useCallback((note) => {
    dispatch(logNoteView(note._id));
    setSelectedNote(note);
    setNoteModalOpen(true);
  }, [dispatch]);

  const handleCloseNoteModal = useCallback(() => {
    setNoteModalOpen(false);
    setSelectedNote(null);
  }, []);

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
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ px: { xs: 1.5, md: 3 }, py: { xs: 2, md: 3 } }}
      >
        {/* Modern Banner with Avatar */}
        <StudentDashboardBanner
          user={user}
          collapsed={bannerCollapsed}
          setCollapsed={setBannerCollapsed}
          stats={stats}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* Subjects Grid - Only show if no subject is selected */}
        {!selections.subject && selections.class && (
          <motion.div variants={fadeInUp}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: { xs: 2, md: 3 },
                background: {
                  xs: 'transparent',
                  md: alpha('#ffffff', 0.9),
                },
                backdropFilter: { xs: 'none', md: 'blur(10px)' },
                border: {
                  xs: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  md: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                },
                boxShadow: {
                  xs: 'none',
                  md: '0px 8px 24px rgba(15, 23, 42, 0.08)',
                },
                mb: { xs: 3, md: 4 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                  mb: 2.5,
                }}
              >
                <Typography
                  sx={{
                    typography: { xs: 'h6', md: 'h5' },
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  📚 Your Subjects
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleChangeClass}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  }}
                >
                  Change Class
                </Button>
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : safeSubjects.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No subjects available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact your teacher or administrator
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {safeSubjects.map((subject) => (
                    <Grid item xs={6} sm={4} md={3} key={subject._id}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          onClick={() => handleSubjectSelect(subject._id)}
                          sx={{
                            width: '100%',
                            minHeight: { xs: 120, sm: 130, md: 140 },
                            maxHeight: { xs: 120, sm: 130, md: 140 },
                            cursor: 'pointer',
                            borderRadius: { xs: 2, md: 3 },
                            transition: 'all 0.25s ease',
                            background: alpha(theme.palette.primary.main, 0.04),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                            boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.18)}`,
                            },
                          }}
                        >
                          <CardContent
                            sx={{
                                width: '100%',
                                flexGrow: 1,
                                p: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                width: 42,
                                height: 42,
                                borderRadius: '50%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                              }}
                            >
                              <MenuBookIcon
                                sx={{ fontSize: 24, color: 'primary.main' }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                typography: { xs: 'body2', md: 'subtitle1' },
                                fontWeight: 600,
                                width: '100%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {subject.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Click to explore
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </motion.div>
        )}

        {/* Show "Back to Subjects" button when subject is selected */}
        {selections.subject && (
          <Box sx={{ mb: { xs: 2, md: 3 } }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToSubjects}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: alpha(theme.palette.primary.main, 0.3),
              }}
            >
              Back to Subjects
            </Button>
          </Box>
        )}

        {/* Strand & SubStrand Selection - Only show when subject is selected */}
        {selections.subject && (
          <motion.div variants={fadeInUp}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: { xs: 2, md: 3 },
                background: {
                  xs: 'transparent',
                  md: alpha('#ffffff', 0.9),
                },
                backdropFilter: { xs: 'none', md: 'blur(10px)' },
                border: {
                  xs: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                  md: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                },
                boxShadow: {
                  xs: 'none',
                  md: '0px 8px 24px rgba(15, 23, 42, 0.08)',
                },
                mb: { xs: 3, md: 4 },
              }}
            >
              <Typography
                sx={{
                  typography: { xs: 'h6', md: 'h5' },
                  fontWeight: 700,
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🎯 Select Topic
              </Typography>

              <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* Strand Dropdown */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Strand</InputLabel>
                    <Select
                      name="strand"
                      value={selections.strand}
                      onChange={handleSelectionChange}
                      label="Strand"
                      sx={{
                        borderRadius: 2,
                        background: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select strand</em>
                      </MenuItem>
                      {(safeStrands || []).map((strand) => (
                        <MenuItem key={strand?._id} value={strand?._id}>
                          {strand?.name || 'Unnamed Strand'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Sub-Strand Dropdown */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={!selections.strand}>
                    <InputLabel>Sub-Strand</InputLabel>
                    <Select
                      name="subStrand"
                      value={selections.subStrand}
                      onChange={handleSelectionChange}
                      label="Sub-Strand"
                      sx={{
                        borderRadius: 2,
                        background: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Select sub-strand</em>
                      </MenuItem>
                      {(safeSubStrands || []).map((subStrand) => (
                        <MenuItem key={subStrand?._id} value={subStrand?._id}>
                          {subStrand?.name || 'Unnamed Sub-Strand'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        )}

        {/* Learning Content - Enhanced with Glassmorphism */}
        {selections.subStrand && contentLoaded ? (
          <AnimatePresence mode="wait">
            {/* Study Notes Section */}
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              sx={{ mb: { xs: 3, md: 4 } }}
            >
              <Grid item xs={12}>
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  <SectionCard sx={{ p: { xs: 2, md: 3 } }}>
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
                                onClick={() => handleViewNote(note)}
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
                  <SectionCard sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
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
                    p: { xs: 2.5, md: 4 },
                    mt: { xs: 3, md: 4 },
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
        ) : safeNotes.length > 0 ? (
          <Box sx={{ my: 4 }}>
            <SectionCard sx={{ p: 4, textAlign: 'center' }}>
              <MenuBookIcon sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                {getArrayLength(safeNotes)} Study Note{getArrayLength(safeNotes) > 1 ? 's' : ''} Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please select a topic from the dropdown above to view your study materials
              </Typography>
            </SectionCard>
          </Box>
        ) : null}


        {/* ✅ Note Viewing Modal */}
        <AnimatePresence>
          {noteModalOpen && selectedNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
                onClick={handleCloseNoteModal}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh' }}
                >
                  <Paper
                    elevation={24}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      maxHeight: '90vh',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        p: 3,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                          <MenuBookIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight={700}>
                            {selectedNote.subStrand?.name || 'Study Note'}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {selectedNote.author?.fullName || 'Teacher'} • {new Date(selectedNote.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={handleCloseNoteModal}
                        sx={{
                          color: 'white',
                          '&:hover': { bgcolor: alpha('#fff', 0.1) },
                        }}
                      >
                        <Box sx={{ fontSize: 28 }}>×</Box>
                      </IconButton>
                    </Box>
                    <Box
                      sx={{
                        p: 4,
                        overflow: 'auto',
                        flexGrow: 1,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Box
                        sx={{
                          '& h1': { fontSize: '2rem', fontWeight: 700, mb: 2, mt: 3 },
                          '& h2': { fontSize: '1.5rem', fontWeight: 600, mb: 2, mt: 2.5 },
                          '& h3': { fontSize: '1.25rem', fontWeight: 600, mb: 1.5, mt: 2 },
                          '& p': { mb: 2, lineHeight: 1.8 },
                          '& ul, & ol': { mb: 2, pl: 3 },
                          '& li': { mb: 1 },
                          '& strong': { fontWeight: 700, color: 'primary.main' },
                          '& table': { 
                            width: '100%', 
                            borderCollapse: 'collapse', 
                            mb: 2,
                            '& th, & td': { 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              p: 1.5 
                            },
                            '& th': { 
                              bgcolor: 'primary.main', 
                              color: 'white', 
                              fontWeight: 600 
                            }
                          }
                        }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {selectedNote.content}
                        </ReactMarkdown>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderTop: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleDownloadPdf(selectedNote)}
                      >
                        Download PDF
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<DescriptionIcon />}
                        onClick={() => handleDownloadWord(selectedNote)}
                      >
                        Download Word
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleCloseNoteModal}
                      >
                        Close
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

      </Container>
    </Box>
  );
};

export default Dashboard;
