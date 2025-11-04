import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW: routing helpers for tabs
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Schools', path: '/admin/schools' },
    { label: 'Curriculum', path: '/admin/curriculum' },
    { label: 'Analytics', path: '/admin/analytics' },
  ];

  const currentIndex = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path)
  );
  const tabValue = currentIndex === -1 ? 0 : currentIndex;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, aiRes] = await Promise.all([
          axios.get('/api/admin/analytics-overview'),
          axios.get('/api/admin/ai-insights'),
        ]);
        setStats(statsRes.data);
        setAiInsights(aiRes.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header Section */}
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 700,
          color: '#02367B',
        }}
      >
        Admin Control Center
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 3, color: '#006CA5' }}>
        Welcome back, {user?.fullName}! Manage users, schools, curriculum, and platform analytics.
      </Typography>

      {/* NEW: Top Navigation Tabs */}
      <Box sx={{ mb: 4, borderBottom: '1px solid rgba(4,150,199,0.15)' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => navigate(navItems[newValue].path)}
          textColor="primary"
          indicatorColor="secondary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              color: '#006CA5',
              minWidth: 'auto',
              mr: 2,
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#02367B',
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
            },
          }}
        >
          {navItems.map((item) => (
            <Tab key={item.path} label={item.label} />
          ))}
        </Tabs>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3}>
        {stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 4,
                  p: 1,
                  boxShadow: '0 4px 20px rgba(2,54,123,0.08)',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: '0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(4,150,199,0.25)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#006CA5', fontWeight: 600 }}>
                    Total Users
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#02367B', fontWeight: 700 }}>
                    {stats.totalUsers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 4,
                  p: 1,
                  boxShadow: '0 4px 20px rgba(2,54,123,0.08)',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: '0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(4,150,199,0.25)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#006CA5', fontWeight: 600 }}>
                    Total Schools
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#02367B', fontWeight: 700 }}>
                    {stats.totalSchools || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 4,
                  p: 1,
                  boxShadow: '0 4px 20px rgba(2,54,123,0.08)',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: '0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(4,150,199,0.25)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#006CA5', fontWeight: 600 }}>
                    Curriculum Levels
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#02367B', fontWeight: 700 }}>
                    {stats.totalNotes || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: 4,
                  p: 1,
                  boxShadow: '0 4px 20px rgba(2,54,123,0.08)',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: '0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(4,150,199,0.25)',
                  },
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#006CA5', fontWeight: 600 }}>
                    Pending Users
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#02367B', fontWeight: 700 }}>
                    {stats.pendingUsers || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* AI Insights Section */}
      {aiInsights && (
        <Paper
          elevation={3}
          sx={{
            mt: 5,
            p: 3,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(4,150,199,0.2)',
            boxShadow: '0 8px 32px rgba(2,54,123,0.08)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#02367B',
              fontWeight: 700,
              mb: 1,
            }}
          >
            AI Insights Summary
          </Typography>

          <Typography variant="body1" sx={{ color: '#006CA5', mb: 1 }}>
            {aiInsights.summary || 'No insights available.'}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#02367B',
              fontStyle: 'italic',
            }}
          >
            Generated by {aiInsights.provider || 'AI'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AdminDashboard;
