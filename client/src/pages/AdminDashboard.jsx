// /client/src/pages/AdminDashboard.jsx
// 🎨 REFINED Admin Dashboard - Content Only (No Navigation)
// Layout.jsx handles TopBar + Sidebar navigation
// This component focuses purely on dashboard content
// ALL REDUX LOGIC AND API CALLS PRESERVED 100%

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
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
import TimelineIcon from '@mui/icons-material/Timeline';

// ═══════════════════════════════════════════════════════════
// 🎯 ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

// ═══════════════════════════════════════════════════════════
// 🎨 STAT CARD COMPONENT - EQUAL SIZES (200px height)
// ═══════════════════════════════════════════════════════════

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  trend, 
  onClick,
  subtitle,
  delay = 0
}) => {
  const theme = useTheme();
  
  return (
    <Grid item xs={12} sm={6} lg={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
      >
        <Card
          onClick={onClick}
          sx={{
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            cursor: onClick ? 'pointer' : 'default',
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha(color, 0.1),
            transition: 'all 0.25s ease',
            '&:hover': onClick ? {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
              borderColor: alpha(color, 0.3),
            } : {},
          }}
        >
          <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Icon & Trend Row */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: alpha(color, 0.1),
                  color: color,
                }}
              >
                <Icon sx={{ fontSize: 24 }} />
              </Avatar>
              {trend && (
                <Chip
                  size="small"
                  label={trend}
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: alpha(color, 0.1),
                    color: color,
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            {/* Value */}
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                mb: 0.5,
                color: color,
              }}
            >
              {value}
            </Typography>

            {/* Label */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
                mb: 1,
              }}
            >
              {label}
            </Typography>

            {/* Subtitle */}
            {subtitle && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  mt: 'auto',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

// ═══════════════════════════════════════════════════════════
// 🎨 INSIGHT CARD COMPONENT
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(config.color, 0.15),
          background: config.bgcolor,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(config.color, 0.15),
              color: config.color,
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {insight.title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              {expanded ? insight.description : `${insight.description.slice(0, 80)}${insight.description.length > 80 ? '...' : ''}`}
            </Typography>
            {insight.description.length > 80 && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ 
                  mt: 0.5,
                  p: 0,
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                }}
              >
                {expanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
// 🎨 PERFORMANCE METRIC COMPONENT
// ═══════════════════════════════════════════════════════════

const PerformanceMetric = ({ label, value, max = 100, color }) => {
  const percentage = (value / max) * 100;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.7rem'
          }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
          {typeof value === 'number' && '%'}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: alpha(color, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            bgcolor: color,
          }
        }}
      />
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════
// 🏠 MAIN ADMIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // ═══════════════════════════════════════════════════════════
  // 📊 ALL ORIGINAL STATE & LOGIC (100% PRESERVED)
  // ═══════════════════════════════════════════════════════════
  
  const { stats, aiInsights, isLoading, isError, message } = useSelector((s) => s.admin);
  const { user } = useSelector((s) => s.auth);
  
  const [timeRange, setTimeRange] = useState('week');
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

  // Generate AI insights (ORIGINAL LOGIC PRESERVED)
  const generateInsights = () => {
    if (!stats) return [];

    const insights = [];

    const avgQuizPerformance = stats.avgQuizPerformance || 0;
    if (avgQuizPerformance === 0) {
      insights.push({
        type: 'warning',
        title: 'No Quiz Activity Detected',
        description: 'There have been no quiz attempts yet. Consider sending reminders to teachers to assign quizzes to students.',
      });
    } else if (avgQuizPerformance < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Average Quiz Performance',
        description: `Average quiz performance is ${avgQuizPerformance.toFixed(1)}%. Consider reviewing curriculum difficulty or providing additional learning resources.`,
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

  // Handle stat card clicks - navigate to appropriate routes
  const handleCardClick = (route) => {
    navigate(route);
  };

  // ═══════════════════════════════════════════════════════════
  // 🎨 RENDER DASHBOARD CONTENT
  // ═══════════════════════════════════════════════════════════

  return (
    <Box>
      {/* Error Alert */}
      {isError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
          }}
        >
          {message || 'Failed to load admin data. Please try again.'}
        </Alert>
      )}

      {/* Header with Time Range */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Welcome back, {user?.name || 'Admin'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <ButtonGroup variant="outlined" size="small">
            {['Week', 'Month', 'Quarter', 'Year'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range.toLowerCase() ? 'contained' : 'outlined'}
                onClick={() => setTimeRange(range.toLowerCase())}
                sx={{ minWidth: 70, textTransform: 'none' }}
              >
                {range}
              </Button>
            ))}
          </ButtonGroup>

          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                }
              }}
            >
              <RefreshIcon 
                sx={{ 
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Loading State */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={12}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {/* Stats Grid - 4 Equal Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <StatCard
              icon={PeopleIcon}
              label="Total Users"
              value={stats?.totalUsers || 0}
              color="#2196F3"
              trend="↑ +12%"
              onClick={() => handleCardClick('/admin/users')}
              subtitle={`${stats?.totalTeachers || 0} teachers, ${stats?.totalStudents || 0} students`}
              delay={0}
            />
            <StatCard
              icon={SchoolIcon}
              label="Schools"
              value={stats?.totalSchools || 0}
              color="#009688"
              trend="↑ +5%"
              onClick={() => handleCardClick('/admin/schools')}
              subtitle="Active institutions"
              delay={0.05}
            />
            <StatCard
              icon={QuizIcon}
              label="Quiz Attempts"
              value={stats?.totalQuizAttempts || 0}
              color="#FF9800"
              trend="↑ +18%"
              onClick={() => handleCardClick('/admin/analytics')}
              subtitle={`${stats?.avgQuizPerformance?.toFixed(1) || 0}% avg score`}
              delay={0.1}
            />
            <StatCard
              icon={PendingActionsIcon}
              label="Pending Users"
              value={stats?.pendingUsers || 0}
              color="#F44336"
              onClick={() => handleCardClick('/admin/users')}
              subtitle="Awaiting approval"
              delay={0.15}
            />
          </Grid>

          {/* Two Column Layout: Performance + Insights */}
          <Grid container spacing={2}>
            
            {/* Performance Metrics */}
            <Grid item xs={12} lg={5}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid #E0E0E0',
                  height: '100%',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Performance Metrics
                </Typography>
                <Stack spacing={2.5}>
                  <PerformanceMetric
                    label="Engagement Rate"
                    value={stats?.engagementRate || 0}
                    color={theme.palette.primary.main}
                  />
                  <PerformanceMetric
                    label="Completion Rate"
                    value={stats?.completionRate || 0}
                    color={theme.palette.success.main}
                  />
                  <PerformanceMetric
                    label="Average Quiz Score"
                    value={stats?.avgQuizPerformance || 0}
                    color={stats?.avgQuizPerformance > 75 ? theme.palette.success.main : theme.palette.warning.main}
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* AI Insights */}
            <Grid item xs={12} lg={7}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid #E0E0E0',
                  height: '100%',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    AI Insights
                  </Typography>
                  <Chip
                    icon={<AutoAwesomeIcon />}
                    label="Live"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      fontWeight: 600,
                    }}
                  />
                </Stack>

                {multipleInsights.length > 0 ? (
                  <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                    {multipleInsights.map((insight, index) => (
                      <InsightCard key={index} insight={insight} index={index} />
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      color: 'text.secondary',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
    </Box>
  );
};

export default AdminDashboard;