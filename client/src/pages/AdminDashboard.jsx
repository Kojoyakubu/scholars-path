// /client/src/pages/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Avatar,
} from '@mui/material';
import {
  Group,
  School,
  Quiz,
  Class,
} from '@mui/icons-material';

import {
  fetchAdminStats,
  fetchAllUsers,
  fetchAllSchools,
  fetchCurriculumLevels,
  reset,
} from '../features/admin/adminSlice';

// A simple reusable component for the statistics cards
const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%' }}>
    <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </Box>
  </Card>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    stats,
    users,
    schools,
    levels,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    // If there's an error, reset the state before trying to fetch again
    if (isError) {
      dispatch(reset());
    }

    // Dispatch all actions to fetch data when the component mounts
    dispatch(fetchAdminStats());
    dispatch(fetchAllUsers());
    dispatch(fetchAllSchools());
    dispatch(fetchCurriculumLevels());

    // Cleanup function to reset state when component unmounts
    return () => {
      dispatch(reset());
    };
  }, [dispatch, isError]);

  if (isLoading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          <strong>Error:</strong> {message || 'Failed to fetch dashboard data. Please try again later.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Scholar's Path Dashboard
        </Typography>
        
        {/* Statistics Cards Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers ?? users?.length ?? 0}
              icon={<Group fontSize="large" />}
              color="#2196f3" // Blue
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Schools"
              value={stats?.totalSchools ?? schools?.length ?? 0}
              icon={<School fontSize="large" />}
              color="#4caf50" // Green
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Quizzes"
              value={stats?.totalQuizzes ?? 'N/A'}
              icon={<Quiz fontSize="large" />}
              color="#ff9800" // Orange
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Curriculum Levels"
              value={levels?.length ?? 0}
              icon={<Class fontSize="large" />}
              color="#f44336" // Red
            />
          </Grid>
        </Grid>
        
        {/* Placeholder for future detailed lists/charts */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Next Steps</Typography>
                <Typography color="text.secondary">
                  Data is loading correctly. You can now build out tables and charts for users, schools, and analytics below.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;