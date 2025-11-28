// /client/src/pages/AdminDashboard.jsx
// 🎨 Enhanced Admin Dashboard - Multiple Improvements
// Features: Clickable stat cards, time range selector, multiple AI insights, improved data visualization
// ALL REDUX LOGIC AND API CALLS PRESERVED

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

// Import other admin components
import AdminCurriculum from './AdminCurriculum';
import AdminUsers from './AdminUsers';
import AdminSchools from './AdminSchools';
import AdminAnalytics from './AdminAnalytics';

// 🎯 Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// 📑 Tab Panel Component
const TabPanel = ({ index, value, children }) => {
  const visible = value === index;
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div key={index} {...fadeInUp} style={{ width: '100%' }}>
          <Box sx={{ mt: 2 }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 📊 Enhanced Stat Card Component with Click Action
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  delay, 
  trend, 
  onClick,
  previousValue,
  isActive = false,
  subtitle,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate trend percentage if previous value exists
  const calculateTrend = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  };

  const trendData = calculateTrend();
  
  return (
    <Grid item xs={12} sm={6} lg={3}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: isActive 
              ? `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`
              : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
            border: isActive 
              ? `2px solid ${alpha(color, 0.5)}`
              : `1px solid ${alpha(color, 0.15)}`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: onClick ? 'pointer' : 'default',
            '&:hover': onClick ? {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
              border: `2px solid ${alpha(color, 0.4)}`,
              background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.04)} 100%)`,
            } : {},
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: `radial-gradient(circle at top right, ${alpha(color, 0.15)}, transparent)`,
              pointerEvents: 'none',
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
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
                    mb: 1,
                  }}
                >
                  {value}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
                {trendData && (
                  <Chip
                    icon={trendData.isPositive ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
                    label={`${trendData.isPositive ? '+' : '-'}${trendData.value}% ${trend || 'vs last period'}`}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: alpha(trendData.isPositive ? theme.palette.success.main : theme.palette.error.main, 0.1),
                      color: trendData.isPositive ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
                {!trendData && trend && (
                  <Chip
                    icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                    label={trend}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(color, 0.35)}`,
                  transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                  transition: 'all 0.3s ease',
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

// 🎯 AI Insight Card Component
const AIInsightCard = ({ insight, index }) => {
  const theme = useTheme();
  
  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <AutoAwesomeIcon />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  const color = getInsightColor(insight.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(8px)',
            boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          >
            {getInsightIcon(insight.type)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              {insight.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.7,
              }}
            >
              {insight.description}
            </Typography>
            {insight.action && (
              <Button
                size="small"
                sx={{
                  mt: 2,
                  color: color,
                  fontWeight: 600,
                }}
              >
                {insight.action}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

// 🎯 Modern Dashboard Banner Component
const ModernDashboardBanner = ({ 
  user, 
  tab, 
  setTab, 
  collapsed, 
  setCollapsed, 
  onRefresh, 
  refreshing,
  stats,
}) => {
  const theme = useTheme();

  return (
    <>
      {/* Modern Header Banner */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        {/* Glass Banner */}
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
            <motion.div
              animate={{ height: collapsed ? 'auto' : 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {!collapsed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
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
                        {(user?.name || user?.fullName || 'A').charAt(0).toUpperCase()}
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
                        ? 'Admin Dashboard' 
                        : `Welcome back, ${user?.name || user?.fullName || 'Admin'}! 👋`
                      }
                    </Typography>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
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
                          Here's what's happening with Scholar's Path today
                          <TrendingUpIcon sx={{ fontSize: 20 }} />
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
                    <RefreshIcon 
                      sx={{ 
                        animation: refreshing ? 'spin 1s linear infinite' : 'none',
                      }} 
                    />
                  </IconButton>
                  <IconButton
                    onClick={() => setCollapsed(!collapsed)}
                    sx={{
                      color: 'white',
                      bgcolor: alpha('#FFFFFF', 0.15),
                      '&:hover': { bgcolor: alpha('#FFFFFF', 0.25) },
                    }}
                  >
                    {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                  </IconButton>
                </Box>
              </Box>

              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mt: 3,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${stats?.totalUsers || 0} Total Users`}
                      sx={{
                        bgcolor: alpha('#FFFFFF', 0.2),
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { bgcolor: alpha('#FFFFFF', 0.3) },
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                    <Chip
                      icon={<SchoolIcon />}
                      label={`${stats?.totalSchools || 0} Schools`}
                      sx={{
                        bgcolor: alpha('#FFFFFF', 0.2),
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { bgcolor: alpha('#FFFFFF', 0.3) },
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                    <Chip
                      icon={<PendingActionsIcon />}
                      label={`${stats?.pendingUsers || 0} Pending Actions`}
                      sx={{
                        bgcolor: stats?.pendingUsers > 0 ? alpha('#FFA726', 0.9) : alpha('#FFFFFF', 0.2),
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { 
                          bgcolor: stats?.pendingUsers > 0 ? alpha('#FFA726', 1) : alpha('#FFFFFF', 0.3)
                        },
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                  </Box>
                </motion.div>
              )}
            </motion.div>
          </Box>
        </Paper>

        {/* Modern Tab Navigation */}
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            borderRadius: 3,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 60,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 60,
                px: 3,
                textTransform: 'none',
                color: theme.palette.text.secondary,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: theme.palette.primary.main,
                  background: alpha(theme.palette.primary.main, 0.05),
                },
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                },
              },
            }}
          >
            <Tab icon={<BarChartIcon />} iconPosition="start" label="Dashboard" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Users" />
            <Tab icon={<SchoolIcon />} iconPosition="start" label="Schools" />
            <Tab icon={<BookIcon />} iconPosition="start" label="Curriculum" />
            <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Analytics" />
          </Tabs>
        </Paper>
      </Box>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

// 🎨 Main Admin Dashboard Component
const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const { stats, aiInsights, isLoading, isError, message } = useSelector((s) => s.admin);
  const { user } = useSelector((s) => s.auth);
  
  const [tab, setTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'quarter', 'year'
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Generate mock AI insights (replace with real data from backend)
  const generateInsights = () => {
    if (!stats) return [];

    const insights = [];

    // Insight about quiz performance
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

    // Insight about pending users
    if (stats.pendingUsers > 0) {
      insights.push({
        type: 'info',
        title: 'Pending User Approvals',
        description: `${stats.pendingUsers} user${stats.pendingUsers > 1 ? 's' : ''} waiting for approval. Review and approve to maintain smooth onboarding.`,
        action: 'Review Users',
      });
    }

    // Insight about user growth
    const totalUsers = stats.totalUsers || 0;
    if (totalUsers > 0) {
      insights.push({
        type: 'success',
        title: 'Platform Growth',
        description: `Your platform now serves ${totalUsers} users across ${stats.totalSchools || 0} schools. User engagement continues to grow.`,
      });
    }

    // Insight about teacher-student ratio
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

  // Handle stat card clicks
  const handleCardClick = (cardType) => {
    switch (cardType) {
      case 'users':
        setTab(1); // Navigate to Users tab
        break;
      case 'schools':
        setTab(2); // Navigate to Schools tab
        break;
      case 'quizzes':
        setTab(4); // Navigate to Analytics tab
        break;
      case 'pending':
        setTab(1); // Navigate to Users tab
        break;
      default:
        break;
    }
  };

  // Stat cards configuration with click handlers
  const statCards = [
    { 
      icon: PeopleIcon, 
      label: 'Total Users', 
      value: stats?.totalUsers ?? 0,
      previousValue: stats?.previousTotalUsers,
      color: '#2563EB',
      trend: 'this month',
      onClick: () => handleCardClick('users'),
      subtitle: `${stats?.totalTeachers || 0} teachers, ${stats?.totalStudents || 0} students`,
    },
    { 
      icon: SchoolIcon, 
      label: 'Total Schools', 
      value: stats?.totalSchools ?? 0,
      previousValue: stats?.previousTotalSchools,
      color: '#8B5CF6',
      trend: 'this month',
      onClick: () => handleCardClick('schools'),
      subtitle: 'Active institutions',
    },
    { 
      icon: QuizIcon, 
      label: 'Quiz Attempts', 
      value: stats?.totalQuizAttempts ?? 0,
      previousValue: stats?.previousQuizAttempts,
      color: '#F59E0B',
      trend: 'this week',
      onClick: () => handleCardClick('quizzes'),
      subtitle: `${stats?.avgQuizPerformance?.toFixed(1) || 0}% avg score`,
    },
    { 
      icon: PendingActionsIcon, 
      label: 'Pending Users', 
      value: stats?.pendingUsers ?? 0,
      color: '#EF4444',
      trend: 'Needs review',
      onClick: () => handleCardClick('pending'),
      subtitle: 'Awaiting approval',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* 📊 Main Content Area - 98% Screen Usage, 1% margin each side */}
      <Box sx={{ width: '98%', mx: '1%', mt: 1, pb: 2 }}>
        {/* Error Alert */}
        {isError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {message || 'Failed to load admin data. Please try again.'}
            </Alert>
          </motion.div>
        )}

        {/* Modern Dashboard Banner with Tabs */}
        <ModernDashboardBanner
          user={user}
          tab={tab}
          setTab={setTab}
          collapsed={bannerCollapsed}
          setCollapsed={setBannerCollapsed}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          stats={stats}
        />

        {/* 📊 Dashboard Tab Content */}
        <TabPanel value={tab} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress size={60} />
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading dashboard data...
              </Typography>
            </Box>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              {/* Time Range Selector */}
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Overview
                </Typography>
                <ButtonGroup variant="outlined" size="small">
                  <Button
                    onClick={() => setTimeRange('week')}
                    variant={timeRange === 'week' ? 'contained' : 'outlined'}
                  >
                    Week
                  </Button>
                  <Button
                    onClick={() => setTimeRange('month')}
                    variant={timeRange === 'month' ? 'contained' : 'outlined'}
                  >
                    Month
                  </Button>
                  <Button
                    onClick={() => setTimeRange('quarter')}
                    variant={timeRange === 'quarter' ? 'contained' : 'outlined'}
                  >
                    Quarter
                  </Button>
                  <Button
                    onClick={() => setTimeRange('year')}
                    variant={timeRange === 'year' ? 'contained' : 'outlined'}
                  >
                    Year
                  </Button>
                </ButtonGroup>
              </Box>

              {/* Stats Grid */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {statCards.map((card, i) => (
                  <StatCard key={i} {...card} delay={0.1 * i} />
                ))}
              </Grid>

              {/* Quick Stats Bar */}
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Active Today
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {stats?.activeToday || 0} users
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={((stats?.activeToday || 0) / (stats?.totalUsers || 1)) * 100}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Completion Rate
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {stats?.completionRate?.toFixed(1) || 0}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats?.completionRate || 0}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Avg. Quiz Score
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {stats?.avgQuizPerformance?.toFixed(1) || 0}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats?.avgQuizPerformance || 0}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        color={stats?.avgQuizPerformance > 75 ? 'success' : stats?.avgQuizPerformance > 50 ? 'warning' : 'error'}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Response Time
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {stats?.avgResponseTime || '< 1s'}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={85}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        color="success"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* AI Insights Section */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  AI-Powered Insights
                </Typography>
                
                {multipleInsights.length > 0 ? (
                  multipleInsights.map((insight, index) => (
                    <AIInsightCard key={index} insight={insight} index={index} />
                  ))
                ) : (
                  <Paper
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                    }}
                  >
                    <AutoAwesomeIcon
                      sx={{
                        fontSize: 64,
                        color: alpha(theme.palette.secondary.main, 0.3),
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      Analyzing platform data...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      AI insights will appear here as more data becomes available.
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Original AI Insights from Backend (if available) */}
              {aiInsights && (
                <motion.div variants={fadeInUp}>
                  <Paper
                    sx={{
                      p: 4,
                      borderRadius: 3,
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
                          boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.3)}`,
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            background: theme.palette.background.aiGradient,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          Advanced AI Analysis
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Deep learning insights
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.primary,
                        lineHeight: 1.8,
                        fontSize: '1rem',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {aiInsights?.summary || aiInsights}
                    </Typography>
                    {aiInsights?.provider && (
                      <Box
                        sx={{
                          mt: 3,
                          pt: 2,
                          borderTop: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <AutoAwesomeIcon 
                          sx={{ fontSize: 16, color: theme.palette.secondary.main }} 
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontStyle: 'italic',
                          }}
                        >
                          Generated by {aiInsights.provider}
                          {aiInsights.model && ` (${aiInsights.model})`}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              )}
            </motion.div>
          )}
        </TabPanel>

        {/* Other Tabs */}
        <TabPanel value={tab} index={1}>
          <AdminUsers />
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <AdminSchools />
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <AdminCurriculum />
        </TabPanel>

        <TabPanel value={tab} index={4}>
          <AdminAnalytics />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default AdminDashboard;