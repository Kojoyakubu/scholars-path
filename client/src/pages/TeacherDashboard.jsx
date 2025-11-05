// /client/src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { syncUserFromStorage } from '../features/auth/authSlice';
import api from '../api/axios';

// --- Icons for Stat Cards ---
import DescriptionIcon from '@mui/icons-material/Description';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// --- Re-usable StatCard from AdminDashboard ---
const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} sm={6} lg={3}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(
              color,
              0.05
            )} 100%)`,
            border: `1px solid ${alpha(color, 0.1)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 40px ${alpha(color, 0.2)}`,
              border: `1px solid ${alpha(color, 0.3)}`,
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    mb: 1,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(
                      color,
                      0.7
                    )} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  {value}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, ${color} 0%, ${alpha(
                    color,
                    0.8
                  )} 100%)`,
                  boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: color,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Active
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};

// --- Helper function from original TeacherDashboard ---
const highlightKeywords = (text) => {
  if (!text) return '';
  const patterns = [
    {
      regex: /\b(excellent|great|outstanding|improved?)\b/gi,
      color: '#2E7D32',
    },
    {
      regex: /\b(needs improvement|consider|could|attention)\b/gi,
      color: '#CDAA00',
    },
    { regex: /\b(recommended|suggests?|next step|ai)\b/gi, color: '#003366' },
  ];
  let result = text;
  patterns.forEach(({ regex, color }) => {
    result = result.replace(
      regex,
      (match) =>
        `<span style="color:${color};font-weight:600">${match}</span>`
    );
  });
  return result;
};

// --- Main TeacherDashboard Component ---
const TeacherDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  // Sync user from localStorage on component mount
  useEffect(() => {
    dispatch(syncUserFromStorage());
  }, [dispatch]);

  // Debug: Log user object
  useEffect(() => {
    console.log('👤 TeacherDashboard - Current user:', user);
    console.log('📛 User name:', user?.name);
    console.log('📛 User fullName:', user?.fullName);
  }, [user]);

  // --- THIS IS THE CORE TEACHER LOGIC (PRESERVED) ---
  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      if (!user) {
        console.log('⚠️ No user found, skipping analytics fetch');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/api/teacher/analytics', {
          params: { role: user?.role, name: user?.name || user?.fullName },
        });
        if (!isMounted) return;

        setDashboardData({
          lessonNotes: res.data?.lessonNotes ?? 0,
          quizzes: res.data?.quizzes ?? 0,
          engagementRate: res.data?.engagementRate ?? '0%',
          aiLessons: res.data?.aiLessons ?? 0,
        });

        const text = res?.data?.insight || res?.data?.message || '';
        setAiInsights(text);
      } catch (err) {
        console.error('Failed to load teacher analytics', err);
        if (isMounted)
          setAiError(
            err?.response?.data?.message || 'Failed to load teacher analytics.'
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user) fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Get display name with proper fallback
  const getDisplayName = () => {
    if (!user) return 'Teacher';
    const name = user.name || user.fullName || 'Teacher';
    return name.split(' ')[0]; // Get first name
  };

  // --- Data for the new StatCards ---
  const statCards = [
    {
      icon: DescriptionIcon,
      label: 'Lesson Notes',
      value: dashboardData?.lessonNotes ?? 0,
      color: '#2196F3', // Blue
    },
    {
      icon: QuizIcon,
      label: 'Quizzes Created',
      value: dashboardData?.quizzes ?? 0,
      color: '#FF9800', // Orange
    },
    {
      icon: TrendingUpIcon,
      label: 'Student Engagement',
      value: dashboardData?.engagementRate ?? '0%',
      color: '#4CAF50', // Green
    },
    {
      icon: ModelTrainingIcon,
      label: 'AI Lessons Generated',
      value: dashboardData?.aiLessons ?? 0,
      color: '#9C27B0', // Purple
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pb: 6,
      }}
    >
      {/* Hero Header (from AdminDashboard) */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              {getDisplayName().charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                  mb: 0.5,
                }}
              >
                Welcome back, {getDisplayName()}! 👩‍🏫
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                }}
              >
                Here's a quick look at your teaching stats
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content (from AdminDashboard) */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, mt: -3 }}>
        {/* Error Alert (using teacher's aiError state) */}
        {aiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                background: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              {aiError}
            </Alert>
          </motion.div>
        )}

        {/* Loading Spinner (using teacher's loading state) */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </Box>
        ) : (
          <>
            {/* Stats Grid (using teacher's statCards data) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statCards.map((card, i) => (
                <StatCard key={i} {...card} delay={0.1 * i} />
              ))}
            </Grid>

            {/* AI Insights (from AdminDashboard, using teacher's aiInsights state) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(103, 126, 234, 0.2)',
                  boxShadow: '0 8px 32px rgba(103, 126, 234, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background:
                      'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  },
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 20px rgba(103, 126, 234, 0.3)',
                    }}
                  >
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        background:
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Your Teaching Highlights
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Smart analytics to guide your next lesson
                    </Typography>
                  </Box>
                </Box>

                {aiInsights ? (
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.primary,
                      lineHeight: 1.8,
                      fontSize: '1rem',
                      whiteSpace: 'pre-line', // Preserves line breaks from the AI
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(aiInsights),
                    }}
                  />
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    🕵️‍♂️ Analyzing platform data... AI insights will appear
                    here shortly.
                  </Typography>
                )}
              </Paper>
            </motion.div>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TeacherDashboard;