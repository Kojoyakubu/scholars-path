// /client/src/pages/admin/AdminDashboard.jsx
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
import { useSelector, useDispatch } from 'react-redux';
import {
  getStats,
  getAiInsights,
  getUsers,
  getSchools,
  getCurriculumLevels,
} from '../features/admin/adminSlice';
import AdminUsers from './AdminUsers';
import AdminSchools from './AdminSchools';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, aiInsights, levels, isLoading } = useSelector((state) => state.admin);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getAiInsights());
    dispatch(getUsers(1));
    dispatch(getSchools());
    dispatch(getCurriculumLevels());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#02367B' }}>
        Admin Control Center
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 3, color: '#006CA5' }}>
        Welcome back, {user?.fullName || user?.name || 'Admin'}! Manage users, schools,
        curriculum, and analytics.
      </Typography>

      {/* Tabs */}
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
            '& .MuiTab-root.Mui-selected': { color: '#02367B' },
            '& .MuiTabs-indicator': { height: 3, borderRadius: 3 },
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Users" />
          <Tab label="Schools" />
          <Tab label="Curriculum" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* TAB 0 - Dashboard */}
      {tabValue === 0 && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, p: 1, boxShadow: '0 4px 20px rgba(2,54,123,0.08)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#006CA5', fontWeight: 600 }}>
                    Total Users
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#02367B', fontWeight: 700 }}>
                    {stats?.totalUsers ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, p: 1, boxShadow: '0 4px 20px rgba(2,54,123,0.08)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#006CA5', fontWeight: 600 }}>
                    Total Schools
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#02367B', fontWeight: 700 }}>
                    {stats?.totalSchools ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, p: 1, boxShadow: '0 4px 20px rgba(2,54,123,0.08)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#006CA5', fontWeight: 600 }}>
                    Curriculum Levels
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#02367B', fontWeight: 700 }}>
                    {levels?.length ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 4, p: 1, boxShadow: '0 4px 20px rgba(2,54,123,0.08)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#006CA5', fontWeight: 600 }}>
                    Pending Users
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#02367B', fontWeight: 700 }}>
                    {stats?.pendingUsers ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {aiInsights && (
            <Paper
              elevation={3}
              sx={{
                mt: 5,
                p: 3,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.85)',
                boxShadow: '0 8px 32px rgba(2,54,123,0.08)',
              }}
            >
              <Typography variant="h6" sx={{ color: '#02367B', fontWeight: 700, mb: 1 }}>
                AI Insights Summary
              </Typography>
              <Typography variant="body1" sx={{ color: '#006CA5', mb: 1 }}>
                {aiInsights?.summary || 'No insights available.'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#02367B', fontStyle: 'italic' }}>
                Generated by {aiInsights?.provider || 'AI'}
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* TAB 1 - Users */}
      {tabValue === 1 && <Box sx={{ mt: 2 }}><AdminUsers /></Box>}

      {/* TAB 2 - Schools */}
      {tabValue === 2 && <Box sx={{ mt: 2 }}><AdminSchools /></Box>}

      {/* TAB 3 - Curriculum (FULL HIERARCHY) */}
      {tabValue === 3 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ color: '#02367B', mb: 2 }}>
            Curriculum Levels
          </Typography>

          {levels && levels.length > 0 ? (
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {levels.map((level) => (
                <li key={level._id}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: '#006CA5', mb: 1, mt: 2 }}
                  >
                    {level.name}
                  </Typography>

                  {level.classes && level.classes.length > 0 ? (
                    <ul style={{ marginLeft: '1.5rem' }}>
                      {level.classes.map((cls) => (
                        <li key={cls._id}>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, color: '#02367B', mb: 0.5 }}
                          >
                            {cls.name}
                          </Typography>

                          {cls.subjects && cls.subjects.length > 0 ? (
                            <ul style={{ marginLeft: '1.5rem' }}>
                              {cls.subjects.map((sub) => (
                                <li key={sub._id}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, color: '#006CA5', mb: 0.5 }}
                                  >
                                    {sub.name}
                                  </Typography>

                                  {sub.strands && sub.strands.length > 0 ? (
                                    <ul style={{ marginLeft: '1.5rem' }}>
                                      {sub.strands.map((strand) => (
                                        <li key={strand._id}>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: '#004D73',
                                              fontWeight: 600,
                                              mb: 0.25,
                                            }}
                                          >
                                            {strand.name}
                                          </Typography>

                                          {strand.subStrands && strand.subStrands.length > 0 ? (
                                            <ul style={{ marginLeft: '1.5rem' }}>
                                              {strand.subStrands.map((ss) => (
                                                <li key={ss._id}>
                                                  <Typography
                                                    variant="body2"
                                                    sx={{ color: '#0077A2' }}
                                                  >
                                                    {ss.name}
                                                  </Typography>
                                                </li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <Typography
                                              variant="caption"
                                              sx={{ color: '#777', ml: 2 }}
                                            >
                                              No substrands
                                            </Typography>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <Typography variant="caption" sx={{ color: '#777', ml: 2 }}>
                                      No strands
                                    </Typography>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#777', ml: 2 }}>
                              No subjects
                            </Typography>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#777', ml: 2 }}>
                      No classes
                    </Typography>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Typography variant="body1" sx={{ color: '#006CA5' }}>
              No curriculum levels available.
            </Typography>
          )}
        </Box>
      )}

      {/* TAB 4 - Analytics */}
      {tabValue === 4 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ color: '#02367B', mb: 1 }}>
            Platform Analytics
          </Typography>
          {stats ? (
            <Typography variant="body1" sx={{ color: '#006CA5' }}>
              There are {stats.totalUsers} users across {stats.totalSchools} schools.
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ color: '#006CA5' }}>
              Analytics not available.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
