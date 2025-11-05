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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
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
    <Box
      sx={{
        p: 2,
        background: 'linear-gradient(135deg, #012B47 0%, #017F9E 100%)',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 700,
          color: '#E1F5FE',
          textShadow: '0 0 10px rgba(255,255,255,0.2)',
        }}
      >
        Admin Control Center
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 3, color: '#B2EBF2' }}>
        Welcome back, {user?.fullName || user?.name || 'Admin'}!
      </Typography>

      {/* Tabs */}
      <Box sx={{ mb: 4, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          textColor="primary"
          indicatorColor="secondary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              color: '#B2EBF2',
              minWidth: 'auto',
              mr: 2,
            },
            '& .MuiTab-root.Mui-selected': { color: '#E1F5FE' },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
              backgroundColor: '#4DD0E1',
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

      {/* TAB 0 - Dashboard */}
      {tabValue === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Grid container spacing={3}>
            {[
              { title: 'Total Users', value: stats?.totalUsers ?? 0 },
              { title: 'Total Schools', value: stats?.totalSchools ?? 0 },
              { title: 'Curriculum Levels', value: levels?.length ?? 0 },
              { title: 'Pending Users', value: stats?.pendingUsers ?? 0 },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card
                    sx={{
                      borderRadius: 4,
                      p: 1,
                      backdropFilter: 'blur(12px)',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ color: '#B2EBF2', fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#E1F5FE', fontWeight: 700 }}>
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {aiInsights && (
            <Paper
              elevation={3}
              sx={{
                mt: 5,
                p: 3,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <Typography variant="h6" sx={{ color: '#E1F5FE', fontWeight: 700, mb: 1 }}>
                AI Insights Summary
              </Typography>
              <Typography variant="body1" sx={{ color: '#B2EBF2', mb: 1 }}>
                {aiInsights?.summary || 'No insights available.'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#E1F5FE', fontStyle: 'italic' }}>
                Generated by {aiInsights?.provider || 'AI'}
              </Typography>
            </Paper>
          )}
        </motion.div>
      )}

      {/* TAB 1 - Users */}
      {tabValue === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <AdminUsers />
        </motion.div>
      )}

      {/* TAB 2 - Schools */}
      {tabValue === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <AdminSchools />
        </motion.div>
      )}

      {/* TAB 3 - Curriculum (Fully Collapsible) */}
      {tabValue === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Typography variant="h6" sx={{ color: '#E1F5FE', fontWeight: 700, mb: 2 }}>
            Curriculum Explorer
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
            Expand each level to explore classes, subjects, strands, and sub-strands.
          </Typography>

          <Box sx={{ mt: 2 }}>
            {levels && levels.length > 0 ? (
              levels.map((level) => (
                <Accordion
                  key={level._id}
                  disableGutters
                  sx={{
                    mb: 1.5,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    '&::before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#E1F5FE' }} />}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ color: '#E1F5FE', fontWeight: 700 }}
                    >
                      {level.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {level.classes?.length ? (
                      level.classes.map((cls) => (
                        <Accordion
                          key={cls._id}
                          disableGutters
                          sx={{
                            mb: 1,
                            ml: 2,
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 2,
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{ color: '#B2EBF2' }} />}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ color: '#B2EBF2', fontWeight: 600 }}
                            >
                              {cls.name}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {cls.subjects?.length ? (
                              cls.subjects.map((sub) => (
                                <Accordion
                                  key={sub._id}
                                  disableGutters
                                  sx={{
                                    mb: 1,
                                    ml: 2,
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: 2,
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: '#80DEEA' }} />}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ color: '#80DEEA', fontWeight: 600 }}
                                    >
                                      {sub.name}
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    {sub.strands?.length ? (
                                      sub.strands.map((strand) => (
                                        <Accordion
                                          key={strand._id}
                                          disableGutters
                                          sx={{
                                            mb: 1,
                                            ml: 2,
                                            background: 'rgba(255,255,255,0.04)',
                                            borderRadius: 2,
                                          }}
                                        >
                                          <AccordionSummary
                                            expandIcon={
                                              <ExpandMoreIcon sx={{ color: '#4DD0E1' }} />
                                            }
                                          >
                                            <Typography
                                              variant="body2"
                                              sx={{ color: '#4DD0E1', fontWeight: 600 }}
                                            >
                                              {strand.name}
                                            </Typography>
                                          </AccordionSummary>
                                          <AccordionDetails>
                                            {strand.subStrands?.length ? (
                                              <Box component="ul" sx={{ pl: 3, m: 0 }}>
                                                {strand.subStrands.map((ss) => (
                                                  <Box
                                                    key={ss._id}
                                                    component="li"
                                                    sx={{
                                                      color: '#B2EBF2',
                                                      mb: 0.5,
                                                      fontSize: 14,
                                                    }}
                                                  >
                                                    {ss.name}
                                                  </Box>
                                                ))}
                                              </Box>
                                            ) : (
                                              <Typography
                                                variant="caption"
                                                sx={{ color: 'rgba(255,255,255,0.7)' }}
                                              >
                                                No sub-strands defined.
                                              </Typography>
                                            )}
                                          </AccordionDetails>
                                        </Accordion>
                                      ))
                                    ) : (
                                      <Typography
                                        variant="caption"
                                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                                      >
                                        No strands defined.
                                      </Typography>
                                    )}
                                  </AccordionDetails>
                                </Accordion>
                              ))
                            ) : (
                              <Typography
                                variant="caption"
                                sx={{ color: 'rgba(255,255,255,0.7)' }}
                              >
                                No subjects defined.
                              </Typography>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        No classes defined.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: '#B2EBF2' }}>
                No curriculum levels available.
              </Typography>
            )}
          </Box>
        </motion.div>
      )}

      {/* TAB 4 - Analytics */}
      {tabValue === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Typography variant="h6" sx={{ color: '#E1F5FE', fontWeight: 700, mb: 1 }}>
            Platform Analytics
          </Typography>
          {stats ? (
            <Typography variant="body1" sx={{ color: '#B2EBF2' }}>
              There are {stats.totalUsers} users across {stats.totalSchools} schools.
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ color: '#B2EBF2' }}>
              Analytics not available.
            </Typography>
          )}
        </motion.div>
      )}
    </Box>
  );
};

export default AdminDashboard;
