import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { getStats } from '../features/admin/adminSlice';
import { motion } from 'framer-motion';

// --- MUI Imports ---
import { Box, Typography, Container, Button, Grid, Card, CardContent, CircularProgress, Paper } from '@mui/material';

function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getStats());
  }, [dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Overview of site activity.
          </Typography>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" component="h2" sx={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                    {stats.students || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" component="h2" sx={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                    {stats.teachers || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Teachers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" component="h2" sx={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                    {stats.quizAttempts || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Quizzes Taken
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Box
          component={Paper}
          elevation={3}
          sx={{
            p: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Button component={RouterLink} to="/admin/users" variant="contained">Manage Users</Button>
          <Button component={RouterLink} to="/admin/curriculum" variant="contained">Manage Curriculum</Button>
          <Button component={RouterLink} to="/admin/schools" variant="contained">Manage Schools</Button>
          <Button component={RouterLink} to="/teacher/dashboard" variant="contained" sx={{ background: '#5cb85c' }}>Content Creation Tools</Button>
        </Box>
      </Container>
    </motion.div>
  );
}

export default AdminDashboard;