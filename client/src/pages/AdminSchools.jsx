import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSchools, getAiInsights } from '../../features/admin/adminSlice';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import AIInsightsCard from '../../components/AIInsightsCard';

const SchoolCard = ({ name, students, teachers }) => (
  <Paper
    elevation={2}
    sx={{ p: 3, textAlign: 'center', borderLeft: '6px solid #4caf50', borderRadius: 2 }}
    component={motion.div}
    whileHover={{ scale: 1.03 }}
  >
    <Typography variant="h6" fontWeight="bold">{name}</Typography>
    <Typography variant="body2" color="text.secondary">Students: {students}</Typography>
    <Typography variant="body2" color="text.secondary">Teachers: {teachers}</Typography>
  </Paper>
);

const AdminSchools = () => {
  const dispatch = useDispatch();
  const { schools, aiInsights, isLoading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getSchools());
    dispatch(getAiInsights({ endpoint: '/api/admin/schools/insights' }));
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress color="primary" />
        <Typography mt={2}>Loading school data...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" textAlign="center" mt={4}>{error}</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Schools Overview</Typography>

      <Grid container spacing={3}>
        {schools?.map((school) => (
          <Grid item xs={12} sm={6} md={4} key={school._id}>
            <SchoolCard
              name={school.name}
              students={school.totalStudents}
              teachers={school.totalTeachers}
            />
          </Grid>
        ))}
      </Grid>

      <AIInsightsCard title="AI Insights on Schools" content={aiInsights} />
    </Box>
  );
};

export default AdminSchools;
