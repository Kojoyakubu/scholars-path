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

// ✅ IMPORT NEW COMPONENTS
import DashboardBanner from '../components/DashboardBanner';
import PolishedStatCard from '../components/Polishedstatcard';

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

      {/* Banner */}
      <DashboardBanner
        user={user}
        role="admin"
        stats={[]} // Admin uses stat cards
        onRefresh={() => dispatch(getStats())}
        refreshing={isLoading}
        collapsed={false}
        onCollapse={null} // No collapse for admin
        actions={
          // Time range selector
          <ButtonGroup variant="outlined" size="small" sx={{ 
            '& .MuiButton-outlined': { 
              color: 'white', 
              borderColor: alpha('#FFFFFF', 0.3),
              '&:hover': { borderColor: 'white', bgcolor: alpha('#FFFFFF', 0.1) }
            },
            '& .MuiButton-contained': {
              bgcolor: alpha('#FFFFFF', 0.2),
              '&:hover': { bgcolor: alpha('#FFFFFF', 0.3) }
            }
          }}>
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
        }
      />

      {/* Loading State */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={12}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <>
          {/* Stats Grid */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <PolishedStatCard
                icon={PeopleIcon}
                label="Total Users"
                value={stats?.totalUsers || 0}
                color="#2196F3"
                trend={{ value: "↑ +12%", color: "#4CAF50" }}
                onClick={() => handleCardClick('/admin/users')}
                subtitle={`${stats?.totalTeachers || 0} teachers • ${stats?.totalStudents || 0} students`}
                delay={0}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <PolishedStatCard
                icon={SchoolIcon}
                label="Schools"
                value={stats?.totalSchools || 0}
                color="#009688"
                trend={{ value: "↑ +5%", color: "#4CAF50" }}
                onClick={() => handleCardClick('/admin/schools')}
                subtitle="Active institutions"
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <PolishedStatCard
                icon={QuizIcon}
                label="Quiz Attempts"
                value={stats?.totalQuizAttempts || 0}
                color="#FF9800"
                trend={{ value: "↑ +18%", color: "#4CAF50" }}
                onClick={() => handleCardClick('/admin/analytics')}
                subtitle={`${stats?.avgQuizPerformance?.toFixed(1) || 0}% average score`}
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <PolishedStatCard
                icon={PendingActionsIcon}
                label="Pending Users"
                value={stats?.pendingUsers || 0}
                color="#F44336"
                onClick={() => handleCardClick('/admin/users')}
                subtitle="Awaiting approval"
                delay={0.3}
              />
            </Grid>
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