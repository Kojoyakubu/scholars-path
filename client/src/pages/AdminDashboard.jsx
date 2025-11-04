// /client/src/pages/AdminDashboard.jsx
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
import axios from 'axios';

// admin tools (same folder)
import AdminUsers from './AdminUsers';
import AdminSchools from './AdminSchools';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW: local tab state – we do NOT change the route
  const [tabValue, setTabValue] = useState(0);

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
        Welcome back, {user?.fullName}! Manage users, schools, curriculum, and platform
        analytics.
      </Typography>

      {/* Top Navigation Tabs (NO routing, just state) */}
      <Box sx={{ mb: 4, borderBottom: '1px solid rgba(4,150,199,0.15)' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
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
          <Tab label="Dashboard" />
          <Tab label="Users" />
          <Tab label="Schools" />
          <Tab label="Curriculum" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* TAB 0: Dashboard (cards + AI summary) */}
      {tabValue === 0 && (
        <>
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
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#006CA5', fontWeight: 600 }}
                      >
                        Total Users
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: '#02367B', fontWeight: 700 }}
                      >
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
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#006CA5', fontWeight: 600 }}
                      >
                        Total Schools
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: '#02367B', fontWeight: 700 }}
                      >
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
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#006CA5', fontWeight: 600 }}
                      >
                        Curriculum Levels
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: '#02367B', fontWeight: 700 }}
                      >
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
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#006CA5', fontWeight: 600 }}
                      >
                        Pending Users
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: '#02367B', fontWeight: 700 }}
                      >
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
        </>
      )}

      {/* TAB 1: Users */}
      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <AdminUsers />
        </Box>
      )}

      {/* TAB 2: Schools */}
      {tabValue === 2 && (
        <Box sx={{ mt: 2 }}>
          <AdminSchools />
        </Box>
      )}

      {/* TAB 3: Curriculum (placeholder for now) */}
      {tabValue === 3 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ color: '#02367B', mb: 1 }}>
            Curriculum Management
          </Typography>
          <Typography variant="body1" sx={{ color: '#006CA5' }}>
            Curriculum tools will appear here. You can plug in your curriculum admin
            component when it’s ready.
          </Typography>
        </Box>
      )}

      {/* TAB 4: Analytics (placeholder for now) */}
      {tabValue === 4 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ color: '#02367B', mb: 1 }}>
            Advanced Analytics
          </Typography>
          <Typography variant="body1" sx={{ color: '#006CA5' }}>
            Additional analytics views can be mounted on this tab.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
