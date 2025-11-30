// /client/src/pages/AdminDashboard.jsx
// 🎨 POLISHED Admin Dashboard - Beautiful & Professional
// Enhanced visual design while keeping clean code structure

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
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// ═══════════════════════════════════════════════════════════
// 🎨 ENHANCED STAT CARD - MORE VISUAL APPEAL
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
        transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card
          onClick={onClick}
          sx={{
            height: 180,
            position: 'relative',
            cursor: onClick ? 'pointer' : 'default',
            borderRadius: 3,
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
            border: `1px solid ${alpha(color, 0.15)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': onClick ? {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 32px ${alpha(color, 0.25)}`,
              border: `1px solid ${alpha(color, 0.3)}`,
            } : {},
            // Decorative corner element
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 100,
              height: 100,
              background: `radial-gradient(circle at top right, ${alpha(color, 0.15)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }
          }}
        >
          <CardContent sx={{ p: 2.5, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Icon Row */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2.5,
                  background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 24px ${alpha(color, 0.35)}`,
                }}
              >
                <Icon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              {trend && (
                <Chip
                  size="small"
                  label={trend}
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: alpha(color, 0.12),
                    color: color,
                    border: `1px solid ${alpha(color, 0.2)}`,
                  }}
                />
              )}
            </Stack>

            {/* Value & Label */}
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900,
                  mb: 0.5,
                  fontSize: '2.25rem',
                  color: color,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {value}
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  fontSize: '0.7rem',
                  mb: 1,
                }}
              >
                {label}
              </Typography>

              {subtitle && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

// ═══════════════════════════════════════════════════════════
// 🎨 ENHANCED INSIGHT CARD
// ═══════════════════════════════════════════════════════════

const InsightCard = ({ insight, index }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      color: theme.palette.success.main,
      bgcolor: alpha(theme.palette.success.main, 0.12),
      borderColor: alpha(theme.palette.success.main, 0.25),
    },
    warning: {
      icon: WarningIcon,
      color: theme.palette.warning.main,
      bgcolor: alpha(theme.palette.warning.main, 0.12),
      borderColor: alpha(theme.palette.warning.main, 0.25),
    },
    info: {
      icon: InfoIcon,
      color: theme.palette.info.main,
      bgcolor: alpha(theme.palette.info.main, 0.12),
      borderColor: alpha(theme.palette.info.main, 0.25),
    }
  };

  const config = typeConfig[insight.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1.5,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: config.borderColor,
          background: config.bgcolor,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: `0 4px 12px ${alpha(config.color, 0.15)}`,
            transform: 'translateX(4px)',
          }
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${config.color} 0%, ${alpha(config.color, 0.8)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 12px ${alpha(config.color, 0.3)}`,
            }}
          >
            <Icon sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          
          <Box flex={1}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 700, 
                mb: 0.5,
                fontSize: '0.9rem',
              }}
            >
              {insight.title}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.85rem',
                lineHeight: 1.6,
              }}
            >
              {expanded ? insight.description : `${insight.description.slice(0, 80)}${insight.description.length > 80 ? '...' : ''}`}
            </Typography>
            
            {insight.description.length > 80 && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={<ArrowForwardIcon sx={{ 
                  transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }} />}
                sx={{ 
                  mt: 1,
                  p: 0,
                  minWidth: 'auto',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: config.color,
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
// 🎨 ENHANCED PERFORMANCE METRIC
// ═══════════════════════════════════════════════════════════

const PerformanceMetric = ({ label, value, max = 100, color }) => {
  const percentage = (value / max) * 100;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            background: alpha(color, 0.12),
            border: `1px solid ${alpha(color, 0.2)}`,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              fontSize: '1rem',
              color: color,
            }}
          >
            {typeof value === 'number' ? value.toFixed(1) : value}
            {typeof value === 'number' && '%'}
          </Typography>
        </Box>
      </Stack>
      
      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: alpha(color, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
            }
          }}
        />
      </Box>
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
  
  const { stats, aiInsights, isLoading, isError, message } = useSelector((s) => s.admin);
  const { user } = useSelector((s) => s.auth);
  
  const [timeRange, setTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch, timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getStats()),
      dispatch(getAiInsights()),
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  };

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

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <Box>
      {/* Error Alert */}
      {isError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
          }}
        >
          {message || 'Failed to load admin data. Please try again.'}
        </Alert>
      )}

      {/* Header */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: '1.75rem' }}>
            Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            Welcome back, <strong>{user?.name || 'Admin'}</strong> 👋
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <ButtonGroup variant="outlined" size="small">
            {['Week', 'Month', 'Quarter', 'Year'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range.toLowerCase() ? 'contained' : 'outlined'}
                onClick={() => setTimeRange(range.toLowerCase())}
                sx={{ 
                  minWidth: 75,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
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
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
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
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <>
          {/* Stats Grid */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <StatCard
              icon={PeopleIcon}
              label="Total Users"
              value={stats?.totalUsers || 0}
              color="#2196F3"
              trend="↑ +12%"
              onClick={() => handleCardClick('/admin/users')}
              subtitle={`${stats?.totalTeachers || 0} teachers • ${stats?.totalStudents || 0} students`}
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
              delay={0.1}
            />
            <StatCard
              icon={QuizIcon}
              label="Quiz Attempts"
              value={stats?.totalQuizAttempts || 0}
              color="#FF9800"
              trend="↑ +18%"
              onClick={() => handleCardClick('/admin/analytics')}
              subtitle={`${stats?.avgQuizPerformance?.toFixed(1) || 0}% average score`}
              delay={0.2}
            />
            <StatCard
              icon={PendingActionsIcon}
              label="Pending Users"
              value={stats?.pendingUsers || 0}
              color="#F44336"
              onClick={() => handleCardClick('/admin/users')}
              subtitle="Awaiting approval"
              delay={0.3}
            />
          </Grid>

          {/* Bottom Section */}
          <Grid container spacing={2.5}>
            
            {/* Performance Metrics */}
            <Grid item xs={12} lg={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #E0E0E0',
                  height: '100%',
                  background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 3,
                    fontSize: '1.125rem',
                  }}
                >
                  📊 Performance Metrics
                </Typography>
                <Stack spacing={3}>
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
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #E0E0E0',
                  height: '100%',
                  background: 'linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%)',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 800,
                      fontSize: '1.125rem',
                    }}
                  >
                    ✨ AI Insights
                  </Typography>
                  <Chip
                    icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                    label="Live"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.15),
                      color: theme.palette.secondary.main,
                      fontWeight: 700,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                    }}
                  />
                </Stack>

                {multipleInsights.length > 0 ? (
                  <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
                    {multipleInsights.map((insight, index) => (
                      <InsightCard key={index} insight={insight} index={index} />
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      color: 'text.secondary',
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 56, opacity: 0.15, mb: 2 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Analyzing platform data...
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                      Insights will appear as data becomes available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdminDashboard;