// client/src/pages/Dashboard.jsx
// 📱 Mobile-First Student Dashboard - Redesigned
// Uniform cards, compact layout, professional UI
// ALL REDUX LOGIC AND API CALLS PRESERVED

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Redux actions - ALL PRESERVED
import { 
  getStudentSubjects, 
  getStudentProgress,
  getStudentNotes,
  resetStudentState 
} from '../features/student/studentSlice';

// MUI Components
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Container,
  Paper,
  Stack,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';

// Icons
import {
  MenuBook,
  Assignment,
  TrendingUp,
  EmojiEvents,
  School,
  Computer,
  Science,
  Calculate,
  Language,
  Psychology,
  Brush,
  AttachMoney,
  Refresh,
  ChevronRight,
} from '@mui/icons-material';

// Subject icon mapping
const subjectIcons = {
  'Career Technology': Computer,
  'Creative Art and Design': Brush,
  'Computing': Computer,
  'Science': Science,
  'Religious and Moral Education': Psychology,
  'Social Studies': School,
  'English Language': Language,
  'Mathematics': Calculate,
  'default': MenuBook,
};

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state - ALL PRESERVED
  const { user } = useSelector((state) => state.auth);
  const { 
    subjects, 
    progress, 
    notes,
    isLoading, 
    isError, 
    message 
  } = useSelector((state) => state.student);

  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount - PRESERVED
  useEffect(() => {
    dispatch(getStudentSubjects());
    dispatch(getStudentProgress());
    dispatch(getStudentNotes());

    return () => {
      dispatch(resetStudentState());
    };
  }, [dispatch]);

  // Handlers - ALL PRESERVED
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getStudentSubjects()),
      dispatch(getStudentProgress()),
      dispatch(getStudentNotes()),
    ]);
    setRefreshing(false);
  };

  const handleSubjectClick = (subjectId) => {
    navigate(`/student/subjects/${subjectId}`);
  };

  // Calculate stats - PRESERVED LOGIC
  const totalNotes = notes?.length || 0;
  const completedLessons = progress?.completedLessons || 0;
  const totalLessons = progress?.totalLessons || 0;
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  // Get subject icon
  const getSubjectIcon = (subjectName) => {
    const IconComponent = subjectIcons[subjectName] || subjectIcons['default'];
    return <IconComponent />;
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 3 }}>
      {/* Main Container - Mobile-First Padding */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 1.5, sm: 2, md: 3 }, 
          py: { xs: 2, sm: 2.5, md: 3 } 
        }}
      >
        {/* Compact Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: { xs: 2, md: 3 },
              p: { xs: 2, sm: 2.5, md: 3 },
              mb: { xs: 2, md: 3 },
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0px 4px 12px rgba(102, 126, 234, 0.2)',
            }}
          >
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(40px)',
              }}
            />

            <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
              {/* Avatar */}
              <Avatar
                sx={{
                  width: { xs: 50, sm: 60, md: 70 },
                  height: { xs: 50, sm: 60, md: 70 },
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 700,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </Avatar>

              {/* Greeting */}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                    mb: 0.5,
                  }}
                >
                  Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.95,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  }}
                >
                  Ready to continue your learning journey 📚
                </Typography>
              </Box>

              {/* Refresh Button */}
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                }}
              >
                <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Stack>

            {/* Quick Stats - Compact 2-Column Grid */}
            <Grid container spacing={1.5} sx={{ mt: { xs: 2, md: 2.5 } }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <MenuBook sx={{ fontSize: { xs: 24, md: 28 }, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    {subjects?.length || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                    Subjects
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: { xs: 24, md: 28 }, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    {totalNotes}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                    Notes
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: { xs: 24, md: 28 }, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    {completedLessons}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                    Completed
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: { xs: 24, md: 28 }, mb: 0.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    {progressPercentage}%
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                    Progress
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Section Header */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: { xs: 1.5, md: 2 } }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              color: '#1a1a1a',
            }}
          >
            📚 Your Subjects
          </Typography>
          {subjects?.length > 0 && (
            <Chip 
              label={`${subjects.length} ${subjects.length === 1 ? 'Subject' : 'Subjects'}`} 
              size="small"
              sx={{ 
                bgcolor: '#667eea',
                color: 'white',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', md: '0.75rem' },
              }}
            />
          )}
        </Stack>

        {/* Subjects Grid - Uniform Card Sizes */}
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LinearProgress sx={{ maxWidth: 200, mx: 'auto', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading your subjects...
            </Typography>
          </Box>
        ) : subjects?.length > 0 ? (
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
            {subjects.map((subject, index) => (
              <Grid item xs={6} sm={4} md={3} key={subject._id || index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: { xs: 130, sm: 140, md: 150 },
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                      '&:hover': {
                        borderColor: '#667eea',
                        boxShadow: '0px 6px 16px rgba(102, 126, 234, 0.15)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleSubjectClick(subject._id)}
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: { xs: 1.5, md: 2 },
                      }}
                    >
                      {/* Icon */}
                      <Box
                        sx={{
                          width: { xs: 48, sm: 56, md: 64 },
                          height: { xs: 48, sm: 56, md: 64 },
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea',
                          mb: 1.5,
                          transition: 'all 0.2s',
                          '& svg': {
                            fontSize: { xs: 28, sm: 32, md: 36 },
                          },
                        }}
                      >
                        {getSubjectIcon(subject.name)}
                      </Box>

                      {/* Subject Name */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          textAlign: 'center',
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                          color: '#1a1a1a',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: { xs: 32, md: 36 },
                        }}
                      >
                        {subject.name}
                      </Typography>

                      {/* Arrow Icon */}
                      <ChevronRight 
                        sx={{ 
                          fontSize: 18,
                          color: 'text.secondary',
                          mt: 'auto',
                        }} 
                      />
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: 'center',
              borderRadius: 2,
              border: '1px dashed rgba(0, 0, 0, 0.12)',
              bgcolor: 'rgba(102, 126, 234, 0.02)',
            }}
          >
            <School sx={{ fontSize: { xs: 60, md: 80 }, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              No Subjects Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your subjects will appear here once your teacher assigns them.
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Inline spin animation */}
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
}

export default Dashboard;