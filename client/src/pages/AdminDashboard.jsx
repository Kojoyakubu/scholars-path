import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { getStats } from '../features/admin/adminSlice';
import { motion } from 'framer-motion';

// --- MUI Imports ---
import { Box, Typography, Container, Button, Grid, Card, CardContent, CircularProgress, Paper } from '@mui/material';

// Reusable component for displaying a statistic
const StatCard = ({ value, title, color = 'primary.main' }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h3" component="p" sx={{ color, fontWeight: 700 }}>
          {value || 0}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

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
            Platform-wide overview and management tools.
          </Typography>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
            <StatCard value={stats?.totalUsers} title="Total Users" />
            <StatCard value={stats?.totalSchools} title="Total Schools" />
            <StatCard value={stats?.totalQuizAttempts} title="Total Quizzes Taken" />
            <StatCard value={stats?.pendingUsers} title="Pending Approvals" color="warning.main" />
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
        </Box>
      </Container>
    </motion.div>
  );
}

export default AdminDashboard;