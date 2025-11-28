// /client/src/pages/AdminDashboard.jsx
// 🎨 COMPLETELY REDESIGNED UI - 2025 MODERN SAAS DASHBOARD
// REVOLUTIONARY NEW LAYOUT - ZERO OLD JSX STRUCTURE
// ALL LOGIC 100% PRESERVED - ONLY UI TRANSFORMED

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha,
  Container,
  Chip,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Stack,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getStats, getAiInsights } from '../features/admin/adminSlice';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BarChartIcon from '@mui/icons-material/BarChart';
import BookIcon from '@mui/icons-material/Book';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TimelineIcon from '@mui/icons-material/Timeline';

// Import other admin components
import AdminCurriculum from './AdminCurriculum';
import AdminUsers from './AdminUsers';
import AdminSchools from './AdminSchools';
import AdminAnalytics from './AdminAnalytics';

// ═══════════════════════════════════════════════════════════
// 🎬 ANIMATION VARIANTS - NEW MODERN ANIMATIONS
// ═══════════════════════════════════════════════════════════

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

const cardSlideIn = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

// ═══════════════════════════════════════════════════════════
// 🎨 NEW COMPONENT: MODERN METRIC CARD
// ═══════════════════════════════════════════════════════════

const ModernMetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend,
  trendValue,
  color,
  onClick,
  delay = 0
}) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Paper
        onClick={onClick}
        sx={{
          p: 3,
          height: '100%',
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(color, 0.1),
          background: `linear-gradient(135deg, ${alpha(color, 0.02)} 0%, ${alpha(color, 0.05)} 100%)`,
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': onClick ? {
            transform: 'translateY(-6px)',
            boxShadow: `0 16px 40px ${alpha(color, 0.2)}`,
            borderColor: alpha(color, 0.3),
          } : {},
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.08)} 0%, transparent 70%)`,
          }
        }}
      >
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(color, 0.1),
                color: color,
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Box>
            {trend && (
              <Chip
                size="small"
                icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={trendValue}
                sx={{
                  height: 24,
                  bgcolor: alpha(trend === 'up' ? theme.palette.success.main : theme.palette.error.main, 0.1),
                  color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  '& .MuiChip-icon': {
                    fontSize: 14,
                  }
                }}
              />
            )}
          </Box>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                mb: 0.5,
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              {label}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// 🎨 NEW COMPONENT: INSIGHT CARD WITH MODERN DESIGN
// ═══════════════════════════════════════════════════════════

const InsightCard = ({ insight, index }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      color: theme.palette.success.main,
      bgcolor: alpha(theme.palette.success.main, 0.08)
    },
    warning: {
      icon: WarningIcon,
      color: theme.palette.warning.main,
      bgcolor: alpha(theme.palette.warning.main, 0.08)
    },
    info: {
      icon: InfoIcon,
      color: theme.palette.info.main,
      bgcolor: alpha(theme.palette.info.main, 0.08)
    }
  };

  const config = typeConfig[insight.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(config.color, 0.15),
          background: config.bgcolor,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(config.color, 0.15)}`,
            transform: 'translateX(4px)',
          }
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="flex-start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(config.color, 0.15),
              color: config.color,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Box>
          <Box flex={1}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>
              {insight.title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                lineHeight: 1.6,
                mb: insight.action ? 1.5 : 0
              }}
            >
              {expanded ? insight.description : `${insight.description.slice(0, 120)}${insight.description.length > 120 ? '...' : ''}`}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {insight.description.length > 120 && (
                <Button
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    p: 0,
                    minWidth: 'auto',
                    color: config.color,
                    '&:hover': {
                      bgcolor: 'transparent',
                      textDecoration: 'underline',
                    }
                  }}
                >
                  {expanded ? 'Show less' : 'Read more'}
                </Button>
              )}
              {insight.action && (
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: config.color,
                    '&:hover': {
                      bgcolor: alpha(config.color, 0.1),
                    }
                  }}
                >
                  {insight.action}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// 🎨 NEW COMPONENT: PERFORMANCE METRIC BLOCK
// ═══════════════════════════════════════════════════════════

const PerformanceMetric = ({ label, value, max = 100, color, icon: Icon }) => {
  const theme = useTheme();
  const percentage = (value / max) * 100;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(color, 0.1),
            color: color,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Box flex={1}>
          <Typography variant="caption" sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.7rem'
          }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>
            {typeof value === 'number' ? value.toFixed(1) : value}
            {typeof value === 'number' && '%'}
          </Typography>
        </Box>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(color, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            bgcolor: color,
          }
        }}
      />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════
// 🎨 NEW COMPONENT: TAB CONTENT WRAPPER
// ═══════════════════════════════════════════════════════════

const TabContent = ({ value, index, children }) => {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════
// 🏠 MAIN COMPONENT - COMPLETELY NEW LAYOUT
// ═══════════════════════════════════════════════════════════

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // ═══════════════════════════════════════════════════════════
  // 📊 ALL ORIGINAL STATE & LOGIC (100% PRESERVED)
  // ═══════════════════════════════════════════════════════════
  
  const { stats, aiInsights, isLoading, isError, message } = useSelector((s) => s.admin);
  const { user } = useSelector((s) => s.auth);
  
  const [tab, setTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch data on mount and when time range changes
  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch, timeRange]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getStats()),
      dispatch(getAiInsights()),
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Generate mock AI insights (ORIGINAL LOGIC PRESERVED)
  const generateInsights = () => {
    if (!stats) return [];

    const insights = [];

    const avgQuizPerformance = stats.avgQuizPerformance || 0;
    if (avgQuizPerformance === 0) {
      insights.push({
        type: 'warning',
        title: 'No Quiz Activity Detected',
        description: 'There have been no quiz attempts yet. Consider sending reminders to teachers to assign quizzes to students.',
        action: 'View Curriculum',
      });
    } else if (avgQuizPerformance < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Average Quiz Performance',
        description: `Average quiz performance is ${avgQuizPerformance.toFixed(1)}%. Consider reviewing curriculum difficulty or providing additional learning resources.`,
        action: 'View Analytics',
      });
    } else if (avgQuizPerformance >= 75) {
      insights.push({
        type: 'success',
        title: 'Excellent Quiz Performance',
        description: `Students are performing well with an average score of ${avgQuizPerformance.toFixed(1)}%. Keep up the great work!`,
      });
    }

    if (stats.pendingUsers > 0) {
      insights.push({
        type: 'info',
        title: 'Pending User Approvals',
        description: `${stats.pendingUsers} user${stats.pendingUsers > 1 ? 's' : ''} waiting for approval. Review and approve to maintain smooth onboarding.`,
        action: 'Review Users',
      });
    }

    const totalUsers = stats.totalUsers || 0;
    if (totalUsers > 0) {
      insights.push({
        type: 'success',
        title: 'Platform Growth',
        description: `Your platform now serves ${totalUsers} users across ${stats.totalSchools || 0} schools. User engagement continues to grow.`,
      });
    }

    const teachers = stats.totalTeachers || 0;
    const students = stats.totalStudents || 0;
    if (teachers > 0 && students > 0) {
      const ratio = (students / teachers).toFixed(1);
      if (ratio > 30) {
        insights.push({
          type: 'warning',
          title: 'High Teacher-Student Ratio',
          description: `Current ratio is ${ratio}:1. Consider recruiting more teachers to ensure quality education.`,
          action: 'View Users',
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Healthy Teacher-Student Ratio',
          description: `Your teacher-student ratio of ${ratio}:1 supports effective learning and personalized attention.`,
        });
      }
    }

    return insights;
  };

  const multipleInsights = generateInsights();

  // Handle stat card clicks (ORIGINAL LOGIC)
  const handleCardClick = (cardType) => {
    switch (cardType) {
      case 'users':
        setTab(1);
        break;
      case 'schools':
        setTab(2);
        break;
      case 'quizzes':
        setTab(4);
        break;
      case 'pending':
        setTab(1);
        break;
      default:
        break;
    }
  };

  // Navigation items
  const navItems = [
    { label: 'Overview', icon: <DashboardIcon />, index: 0 },
    { label: 'Users', icon: <PeopleIcon />, index: 1 },
    { label: 'Schools', icon: <SchoolIcon />, index: 2 },
    { label: 'Curriculum', icon: <BookIcon />, index: 3 },
    { label: 'Analytics', icon: <BarChartIcon />, index: 4 },
  ];

  // ═══════════════════════════════════════════════════════════
  // 🎨 COMPLETELY NEW JSX LAYOUT - REVOLUTIONARY DESIGN
  // ═══════════════════════════════════════════════════════════

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAFBFC' }}>
      
      {/* ═══════════════════════════════════════════════════════════
          🎨 NEW SIDEBAR - MODERN VERTICAL NAVIGATION
          ═══════════════════════════════════════════════════════════*/}
      
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: isMobile ? 280 : 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? 280 : 260,
            boxSizing: 'border-box',
            border: 'none',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid',
            borderColor: theme.palette.divider,
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            S
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
              Scholar's Path
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Admin Portal
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <List sx={{ p: 0 }}>
            {navItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={tab === item.index}
                  onClick={() => {
                    setTab(item.index);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      }
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: tab === item.index ? 700 : 500,
                      fontSize: '0.875rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Divider />

        <Box sx={{ p: 2 }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.1),
            }}
          >
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <AutoAwesomeIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Pro Tip
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}>
                Click on metric cards to navigate to detailed views
              </Typography>
            </Stack>
          </Paper>
        </Box>
      </Drawer>

      {/* ═══════════════════════════════════════════════════════════
          🎨 MAIN CONTENT AREA - COMPLETELY NEW LAYOUT
          ═══════════════════════════════════════════════════════════*/}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 260px)` },
          minHeight: '100vh',
        }}
      >
        {/* ═══════════════════════════════════════════════════════════
            🎨 TOP BAR - SLEEK MODERN HEADER
            ═══════════════════════════════════════════════════════════*/}
        
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {isMobile && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {navItems.find(item => item.index === tab)?.label || 'Dashboard'}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Welcome back, {user?.name || 'Admin'}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              {!isMobile && (
                <ButtonGroup size="small" variant="outlined">
                  {['Today', 'Week', 'Month', 'Year'].map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range.toLowerCase() ? 'contained' : 'outlined'}
                      onClick={() => setTimeRange(range.toLowerCase())}
                      sx={{ textTransform: 'none', minWidth: 70 }}
                    >
                      {range}
                    </Button>
                  ))}
                </ButtonGroup>
              )}
              
              <Tooltip title="Refresh data">
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                  }}
                >
                  <RefreshIcon sx={{ 
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                }}>
                  <Badge badgeContent={stats?.pendingUsers || 0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* ═══════════════════════════════════════════════════════════
            🎨 CONTENT CONTAINER
            ═══════════════════════════════════════════════════════════*/}
        
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          
          {/* Loading State */}
          {isLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={12}>
              <CircularProgress size={60} />
            </Box>
          )}

          {/* Error State */}
          {isError && (
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: 3,
                mb: 3,
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.2)
              }}
            >
              {message}
            </Alert>
          )}

          {/* ═══════════════════════════════════════════════════════════
              📊 OVERVIEW TAB - COMPLETELY NEW GRID LAYOUT
              ═══════════════════════════════════════════════════════════*/}
          
          <TabContent value={tab} index={0}>
            {!isLoading && stats && (
              <motion.div
                variants={staggerChildren}
                initial="initial"
                animate="animate"
              >
                {/* Hero Metrics - 4 Column Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <ModernMetricCard
                      icon={PeopleIcon}
                      label="Total Users"
                      value={stats.totalUsers || 0}
                      trend="up"
                      trendValue="+12%"
                      color={theme.palette.primary.main}
                      onClick={() => handleCardClick('users')}
                      delay={0}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <ModernMetricCard
                      icon={SchoolIcon}
                      label="Schools Active"
                      value={stats.totalSchools || 0}
                      trend="up"
                      trendValue="+5%"
                      color={theme.palette.success.main}
                      onClick={() => handleCardClick('schools')}
                      delay={0.05}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <ModernMetricCard
                      icon={QuizIcon}
                      label="Quizzes Taken"
                      value={stats.totalQuizzes || 0}
                      trend="up"
                      trendValue="+23%"
                      color={theme.palette.warning.main}
                      onClick={() => handleCardClick('quizzes')}
                      delay={0.1}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <ModernMetricCard
                      icon={PendingActionsIcon}
                      label="Pending Approvals"
                      value={stats.pendingUsers || 0}
                      color={theme.palette.error.main}
                      onClick={() => handleCardClick('pending')}
                      delay={0.15}
                    />
                  </Grid>
                </Grid>

                {/* Two Column Layout: Performance + Insights */}
                <Grid container spacing={3}>
                  
                  {/* Left Column: Performance Metrics */}
                  <Grid item xs={12} lg={5}>
                    <Paper
                      sx={{
                        p: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        height: '100%',
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                        Performance Overview
                      </Typography>
                      <Stack spacing={3}>
                        <PerformanceMetric
                          label="Engagement Rate"
                          value={stats.engagementRate || 0}
                          color={theme.palette.primary.main}
                          icon={TimelineIcon}
                        />
                        <PerformanceMetric
                          label="Completion Rate"
                          value={stats.completionRate || 0}
                          color={theme.palette.success.main}
                          icon={CheckCircleIcon}
                        />
                        <PerformanceMetric
                          label="Average Quiz Score"
                          value={stats.avgQuizPerformance || 0}
                          color={stats.avgQuizPerformance > 75 ? theme.palette.success.main : theme.palette.warning.main}
                          icon={QuizIcon}
                        />
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Right Column: AI Insights */}
                  <Grid item xs={12} lg={7}>
                    <Paper
                      sx={{
                        p: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        height: '100%',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            AI Insights
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Powered by advanced analytics
                          </Typography>
                        </Box>
                        <Chip
                          icon={<AutoAwesomeIcon />}
                          label="Live"
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      {multipleInsights.length > 0 ? (
                        <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                          {multipleInsights.map((insight, index) => (
                            <InsightCard key={index} insight={insight} index={index} />
                          ))}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: 8,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <AutoAwesomeIcon sx={{ fontSize: 64, opacity: 0.2, mb: 2 }} />
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Analyzing platform data...
                          </Typography>
                          <Typography variant="caption">
                            Insights will appear as data becomes available
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </motion.div>
            )}
          </TabContent>

          {/* ═══════════════════════════════════════════════════════════
              📑 OTHER TABS - SAME CONTENT, NEW WRAPPER
              ═══════════════════════════════════════════════════════════*/}
          
          <TabContent value={tab} index={1}>
            <AdminUsers />
          </TabContent>

          <TabContent value={tab} index={2}>
            <AdminSchools />
          </TabContent>

          <TabContent value={tab} index={3}>
            <AdminCurriculum />
          </TabContent>

          <TabContent value={tab} index={4}>
            <AdminAnalytics />
          </TabContent>

        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;