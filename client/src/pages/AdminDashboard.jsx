// /client/src/pages/AdminDashboard.jsx
// 🎨 REDESIGNED MODERN UI - ALL LOGIC PRESERVED
// Modern, Minimalist, Clean Design inspired by Linear/Notion/Vercel
// Mobile-first responsive with glassmorphism and smooth animations

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
          <Box sx={{ mt: 3 }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 📊 Modern Stat Card Component
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
      >
        <Card
          onClick={onClick}
          sx={{
            height: '100%',
            minHeight: 140,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(color, 0.1)}`,
            borderRadius: 2,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': onClick ? {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
              borderColor: alpha(color, 0.3),
            } : {},
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: 80,
              height: 80,
              background: `radial-gradient(circle, ${alpha(color, 0.08)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 'auto' }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 1,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: color,
                    mb: 0.5,
                  }}
                >
                  {value}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.7rem',
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: alpha(color, 0.1),
                  color: color,
                }}
              >
                <Icon sx={{ fontSize: 22 }} />
              </Avatar>
            </Box>
            
            {trendData && (
              <Box sx={{ mt: 1.5 }}>
                <Chip
                  icon={trendData.isPositive ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
                  label={`${trendData.isPositive ? '+' : '-'}${trendData.value}%`}
                  size="small"
                  sx={{
                    height: 22,
                    bgcolor: alpha(trendData.isPositive ? theme.palette.success.main : theme.palette.error.main, 0.1),
                    color: trendData.isPositive ? theme.palette.success.main : theme.palette.error.main,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': {
                      fontSize: 14,
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

// 🤖 AI Insight Card Component
const AIInsightCard = ({ insight, index }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon />;
      case 'success':
        return <CheckCircleIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <AutoAwesomeIcon />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning':
        return theme.palette.warning.main;
      case 'success':
        return theme.palette.success.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  const insightColor = getInsightColor(insight.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 2,
          border: `1px solid ${alpha(insightColor, 0.15)}`,
          background: `linear-gradient(135deg, ${alpha(insightColor, 0.03)} 0%, rgba(255,255,255,0.8) 100%)`,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 4px 12px ${alpha(insightColor, 0.1)}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(insightColor, 0.1),
              color: insightColor,
            }}
          >
            {getInsightIcon(insight.type)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
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
                lineHeight: 1.6,
                fontSize: '0.875rem',
              }}
            >
              {expanded ? insight.description : `${insight.description.slice(0, 100)}${insight.description.length > 100 ? '...' : ''}`}
            </Typography>
            {insight.description.length > 100 && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ mt: 1, fontSize: '0.75rem', textTransform: 'none' }}
              >
                {expanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // All existing state
  const [tab, setTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [multipleInsights, setMultipleInsights] = useState([]);

  // Redux state - UNCHANGED
  const { stats, loading, error } = useSelector((state) => state.admin);
  const { aiInsights, aiLoading } = useSelector((state) => state.admin);

  // All existing effects - UNCHANGED
  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch]);

  useEffect(() => {
    if (stats) {
      const insights = [];

      if (stats.pendingUsers > 0) {
        insights.push({
          type: 'warning',
          title: 'Pending User Approvals',
          description: `You have ${stats.pendingUsers} user(s) waiting for approval. Review and approve them to grant platform access.`,
        });
      }

      if (stats.totalUsers > 100) {
        insights.push({
          type: 'success',
          title: 'Platform Growth Milestone',
          description: `Congratulations! Your platform now has ${stats.totalUsers} registered users. This represents strong adoption and engagement.`,
        });
      }

      if (stats.engagementRate && stats.engagementRate < 30) {
        insights.push({
          type: 'info',
          title: 'Engagement Opportunity',
          description: `Current engagement rate is ${stats.engagementRate?.toFixed(1)}%. Consider creating more interactive content or implementing gamification features to boost user engagement.`,
        });
      }

      if (stats.avgQuizPerformance && stats.avgQuizPerformance > 80) {
        insights.push({
          type: 'success',
          title: 'Excellent Quiz Performance',
          description: `Students are performing exceptionally well with an average score of ${stats.avgQuizPerformance?.toFixed(1)}%. Your curriculum is effectively structured.`,
        });
      }

      if (stats.completionRate && stats.completionRate < 50) {
        insights.push({
          type: 'warning',
          title: 'Low Completion Rate',
          description: `Only ${stats.completionRate?.toFixed(1)}% of lessons are being completed. Consider reviewing lesson difficulty or length to improve completion rates.`,
        });
      }

      setMultipleInsights(insights);
    }
  }, [stats]);

  // All existing handlers - UNCHANGED
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setSelectedMetric(null);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleMetricClick = (metric) => {
    setSelectedMetric(metric);
  };

  const handleRefresh = () => {
    dispatch(getStats());
    dispatch(getAiInsights());
  };

  // Tab configuration
  const tabs = [
    { label: 'Overview', icon: <BarChartIcon /> },
    { label: 'Users', icon: <PeopleIcon /> },
    { label: 'Schools', icon: <SchoolIcon /> },
    { label: 'Curriculum', icon: <BookIcon /> },
    { label: 'Analytics', icon: <BarChartIcon /> },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#F8F9FA',
      pb: 4,
    }}>
      {/* Modern Top Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            py: 2,
          }}>
            {/* Left: Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  Admin Dashboard
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Manage your platform
                </Typography>
              </Box>
            </Box>

            {/* Right: Actions */}
            <Stack direction="row" spacing={1}>
              {!isMobile && (
                <ButtonGroup size="small" variant="outlined">
                  {['Today', 'Week', 'Month', 'Year'].map((range) => (
                    <Button
                      key={range}
                      onClick={() => handleTimeRangeChange(range.toLowerCase())}
                      variant={timeRange === range.toLowerCase() ? 'contained' : 'outlined'}
                      sx={{ textTransform: 'capitalize', minWidth: 70 }}
                    >
                      {range}
                    </Button>
                  ))}
                </ButtonGroup>
              )}
              <Tooltip title="Refresh data">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading || aiLoading}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Desktop Tabs */}
          {!isMobile && (
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  px: 2,
                },
                '& .Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              }}
            >
              {tabs.map((tabItem, index) => (
                <Tab
                  key={index}
                  label={tabItem.label}
                  icon={tabItem.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          )}
        </Container>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Stack spacing={1}>
            {tabs.map((tabItem, index) => (
              <Button
                key={index}
                fullWidth
                variant={tab === index ? 'contained' : 'text'}
                startIcon={tabItem.icon}
                onClick={() => {
                  setTab(index);
                  setMobileMenuOpen(false);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: tab === index ? 600 : 500,
                }}
              >
                {tabItem.label}
              </Button>
            ))}
          </Stack>
          
          {/* Mobile Time Range Selector */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, px: 1, fontWeight: 600 }}>
            TIME RANGE
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {['Today', 'Week', 'Month', 'Year'].map((range) => (
              <Button
                key={range}
                fullWidth
                size="small"
                variant={timeRange === range.toLowerCase() ? 'contained' : 'text'}
                onClick={() => handleTimeRangeChange(range.toLowerCase())}
                sx={{ justifyContent: 'flex-start', textTransform: 'capitalize' }}
              >
                {range}
              </Button>
            ))}
          </Stack>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Overview Tab */}
        <TabPanel value={tab} index={0}>
          {!loading && stats && (
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              {/* Stats Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <StatCard
                  icon={PeopleIcon}
                  label="Total Users"
                  value={stats.totalUsers || 0}
                  color={theme.palette.primary.main}
                  delay={0}
                  previousValue={stats.previousUsers}
                  onClick={() => handleMetricClick('users')}
                  isActive={selectedMetric === 'users'}
                />
                <StatCard
                  icon={SchoolIcon}
                  label="Total Schools"
                  value={stats.totalSchools || 0}
                  color={theme.palette.success.main}
                  delay={0.1}
                  previousValue={stats.previousSchools}
                  onClick={() => handleMetricClick('schools')}
                  isActive={selectedMetric === 'schools'}
                />
                <StatCard
                  icon={QuizIcon}
                  label="Quizzes Taken"
                  value={stats.totalQuizzes || 0}
                  color={theme.palette.warning.main}
                  delay={0.2}
                  previousValue={stats.previousQuizzes}
                  onClick={() => handleMetricClick('quizzes')}
                  isActive={selectedMetric === 'quizzes'}
                />
                <StatCard
                  icon={PendingActionsIcon}
                  label="Pending Users"
                  value={stats.pendingUsers || 0}
                  color={theme.palette.error.main}
                  delay={0.3}
                  onClick={() => handleMetricClick('pending')}
                  isActive={selectedMetric === 'pending'}
                  subtitle="Awaiting approval"
                />
              </Grid>

              {/* Performance Metrics */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                  Performance Metrics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Engagement Rate
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, mb: 1 }}>
                        {stats?.engagementRate?.toFixed(1) || 0}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats?.engagementRate || 0}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Completion Rate
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, mb: 1 }}>
                        {stats?.completionRate?.toFixed(1) || 0}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats?.completionRate || 0}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                        }}
                        color="success"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Avg. Quiz Score
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, mb: 1 }}>
                        {stats?.avgQuizPerformance?.toFixed(1) || 0}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={stats?.avgQuizPerformance || 0}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                        }}
                        color={stats?.avgQuizPerformance > 75 ? 'success' : stats?.avgQuizPerformance > 50 ? 'warning' : 'error'}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Response Time
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, mb: 1 }}>
                        {stats?.avgResponseTime || '< 1s'}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={85}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                        }}
                        color="success"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* AI Insights Section */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    AI-Powered Insights
                  </Typography>
                  {aiLoading && <CircularProgress size={20} />}
                </Box>
                
                {multipleInsights.length > 0 ? (
                  <Grid container spacing={2}>
                    {multipleInsights.map((insight, index) => (
                      <Grid item xs={12} key={index}>
                        <AIInsightCard insight={insight} index={index} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 2,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <AutoAwesomeIcon
                      sx={{
                        fontSize: 48,
                        color: alpha(theme.palette.secondary.main, 0.3),
                        mb: 2,
                      }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                      Analyzing platform data...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      AI insights will appear here as more data becomes available.
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Backend AI Insights */}
              {aiInsights && (
                <motion.div variants={fadeInUp}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mt: 3,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                        }}
                      >
                        <AutoAwesomeIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Advanced AI Analysis
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Deep learning insights
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {aiInsights?.summary || aiInsights}
                    </Typography>
                    {aiInsights?.provider && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
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

        {/* Other Tabs - ALL UNCHANGED */}
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
      </Container>
    </Box>
  );
};

export default AdminDashboard;