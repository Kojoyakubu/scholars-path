// /client/src/pages/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { getStats, getAiInsights } from '../features/admin/adminSlice';

const StatCard = ({ icon: Icon, label, value, color }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        background: `linear-gradient(135deg, ${alpha(color, 0.06)} 0%, #ffffff 70%)`,
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(color, 0.12),
              color: color,
            }}
          >
            <Icon />
          </Box>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', fontWeight: 700 }}
            >
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {value ?? 0}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const InsightCard = ({ insight }) => {
  const theme = useTheme();
  const type = insight.type || 'info';

  const colorMap = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    default: theme.palette.primary.main,
  };

  const iconMap = {
    success: <TrendingUpIcon />,
    warning: <PendingActionsIcon />,
    info: <AutoAwesomeIcon />,
    default: <AutoAwesomeIcon />,
  };

  const color = colorMap[type] || colorMap.default;
  const icon = iconMap[type] || iconMap.default;

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(color, 0.25)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.06)} 0%, #ffffff 80%)`,
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(color, 0.1),
              color,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              {insight.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {insight.description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const { stats, aiInsights, isLoading, isError, message } = useSelector(
    (state) => state.admin
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
  }, [dispatch]);

  const safeStats = stats || {};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Welcome back, {user?.fullName || user?.name || 'Admin'}.
          {' '}Here’s an overview of what’s happening across Scholar’s Path.
        </Typography>
      </Box>

      {/* Loading / Error */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message || 'Something went wrong while loading admin stats.'}
        </Alert>
      )}

      {/* Stats Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PeopleIcon}
            label="Total Users"
            value={safeStats.totalUsers}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={SchoolIcon}
            label="Schools"
            value={safeStats.totalSchools}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={QuizIcon}
            label="Quizzes"
            value={safeStats.totalQuizzes}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PendingActionsIcon}
            label="Pending Approvals"
            value={safeStats.pendingUsers}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Lower Section: Left = Activity / Right = AI Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              height: '100%',
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1.5 }}
              >
                Platform summary
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Use this space for a simple description of activity:  
                e.g. “Teachers are actively creating lesson notes, and student
                engagement is trending upwards this week.”
              </Typography>
              {/* You can embed charts / tables here later */}
              <Box
                sx={{
                  borderRadius: 2,
                  border: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
                  p: 2,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontSize: 14,
                }}
              >
                Placeholder for charts or recent activity list
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              height: '100%',
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  AI insights
                </Typography>
                <Chip
                  label="Powered by AI"
                  size="small"
                  icon={<AutoAwesomeIcon fontSize="small" />}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              {!aiInsights || aiInsights.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No AI insights available yet. Once usage grows,
                  AI will highlight trends and recommendations here.
                </Typography>
              ) : (
                <Box>
                  {aiInsights.map((insight, idx) => (
                    <InsightCard key={idx} insight={insight} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
