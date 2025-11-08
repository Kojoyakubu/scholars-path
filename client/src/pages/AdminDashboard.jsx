// /client/src/pages/AdminDashboard.jsx
// 🎨 Modernized Admin Dashboard - Following Design Blueprint
// Features: Enhanced stat cards, improved layout, better data visualization, smooth animations
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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { getStats, getAiInsights } from '../features/admin/adminSlice'; // Preserved import
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Import other admin components (preserved imports)
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

// 📑 Tab Panel Component - Handles tab switching (preserved logic)
const TabPanel = ({ index, value, children }) => {
  const visible = value === index;
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div key={index} {...fadeInUp} style={{ width: '100%' }}>
          <Box sx={{ mt: 4 }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 📊 Modern Stat Card Component - Enhanced design with hover effects
const StatCard = ({ icon: Icon, label, value, color, delay, trend }) => {
  const theme = useTheme();
  
  return (
    <Grid item xs={12} sm={6} lg={3}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
            border: `1px solid ${alpha(color, 0.15)}`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
              border: `1px solid ${alpha(color, 0.3)}`,
              background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.04)} 100%)`,
            },
            // Decorative corner accent
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
          <CardContent sx={{ p: 3 }}>
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
                {trend && (
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

// 🎨 Main Admin Dashboard Component
const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Redux state (preserved from original)
  const { stats, aiInsights, isLoading, isError, message } = useSelector((s) => s.admin);
  const { user } = useSelector((s) => s.auth);
  
  const [tab, setTab] = useState(0);

  // 🔄 Fetch data on mount (preserved logic)
  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch]);

  // 📊 Stat cards configuration
  const statCards = [
    { 
      icon: PeopleIcon, 
      label: 'Total Users', 
      value: stats?.totalUsers ?? 0, 
      color: '#2563EB',
      trend: '+12% this month'
    },
    { 
      icon: SchoolIcon, 
      label: 'Total Schools', 
      value: stats?.totalSchools ?? 0, 
      color: '#8B5CF6',
      trend: '+8% this month'
    },
    { 
      icon: QuizIcon, 
      label: 'Quiz Attempts', 
      value: stats?.totalQuizAttempts ?? 0, 
      color: '#F59E0B',
      trend: '+25% this week'
    },
    { 
      icon: PendingActionsIcon, 
      label: 'Pending Users', 
      value: stats?.pendingUsers ?? 0, 
      color: '#EF4444',
      trend: 'Needs review'
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      {/* 🎨 Hero Header Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          background: theme.palette.background.gradient,
          color: 'white',
          py: 6,
          px: { xs: 2, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          // Animated background accent
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: alpha('#60A5FA', 0.1),
            top: '-200px',
            right: '-100px',
            animation: 'float 20s ease-in-out infinite',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
            '50%': { transform: 'translateY(-30px) rotate(10deg)' },
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: alpha('#FFFFFF', 0.2),
                border: '3px solid rgba(255,255,255,0.3)',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {(user?.name || user?.fullName || 'A').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  textShadow: '0 2px 20px rgba(0,0,0,0.1)',
                  mb: 0.5,
                }}
              >
                Welcome back, {user?.name || user?.fullName || 'Admin'}! 👋
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: alpha('#FFFFFF', 0.9),
                  fontWeight: 400,
                }}
              >
                Here's what's happening with Scholar's Path today
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 📊 Main Content Area */}
      <Container maxWidth="xl" sx={{ mt: -4, pb: 6 }}>
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

        {/* 📑 Navigation Tabs */}
        <Paper
          sx={{
            borderRadius: 3,
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
                px: 3,
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <Tab label="📊 Dashboard" />
            <Tab label="👥 Users" />
            <Tab label="🏫 Schools" />
            <Tab label="📚 Curriculum" />
            <Tab label="📈 Analytics" />
          </Tabs>
        </Paper>

        {/* 📊 Dashboard Tab Content */}
        <TabPanel value={tab} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              {/* Stats Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((card, i) => (
                  <StatCard key={i} {...card} delay={0.1 * i} />
                ))}
              </Grid>

              {/* AI Insights Card */}
              <motion.div variants={fadeInUp}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    // Top accent bar
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
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: theme.palette.background.aiGradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        AI-Powered Insights
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Smart analytics for better decisions
                      </Typography>
                    </Box>
                  </Box>

                  {aiInsights ? (
                    <>
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
                    </>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      🤖 Analyzing platform data... AI insights will appear here shortly.
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            </motion.div>
          )}
        </TabPanel>

        {/* 👥 Users Tab - Preserved component */}
        <TabPanel value={tab} index={1}>
          <AdminUsers />
        </TabPanel>

        {/* 🏫 Schools Tab - Preserved component */}
        <TabPanel value={tab} index={2}>
          <AdminSchools />
        </TabPanel>

        {/* 📚 Curriculum Tab - Preserved component */}
        <TabPanel value={tab} index={3}>
          <AdminCurriculum />
        </TabPanel>

        {/* 📈 Analytics Tab - Preserved component */}
        <TabPanel value={tab} index={4}>
          <AdminAnalytics />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AdminDashboard;