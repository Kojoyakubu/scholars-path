import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSchoolDashboard } from '../features/school/schoolSlice';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Grid, Card, CardContent, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function SchoolDashboard() {
  const dispatch = useDispatch();
  const { schoolId } = useParams(); // 2. Get schoolId from the URL
  const { dashboardData, isLoading } = useSelector((state) => state.school);

  useEffect(() => {
    if (schoolId) {
      dispatch(getSchoolDashboard(schoolId)); // 3. Fetch data for this specific school
    }
  }, [dispatch, schoolId]);

  if (isLoading || !dashboardData) {
    return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Container>
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1">School Admin Dashboard</Typography>
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}><Card elevation={3}><CardContent sx={{textAlign: 'center'}}><Typography variant="h3">{dashboardData.totalStudents}</Typography><Typography color="text.secondary">Total Students</Typography></CardContent></Card></Grid>
          <Grid item xs={12} sm={4}><Card elevation={3}><CardContent sx={{textAlign: 'center'}}><Typography variant="h3">{dashboardData.totalTeachers}</Typography><Typography color="text.secondary">Total Teachers</Typography></CardContent></Card></Grid>
          <Grid item xs={12} sm={4}><Card elevation={3}><CardContent sx={{textAlign: 'center'}}><Typography variant="h3">{dashboardData.totalQuizAttempts}</Typography><Typography color="text.secondary">Quizzes Taken</Typography></CardContent></Card></Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Teachers</Typography>
            <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell></TableRow></TableHead><TableBody>{dashboardData.teachers.map(t => (<TableRow key={t._id}><TableCell>{t.fullName}</TableCell><TableCell>{t.email}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Students</Typography>
            <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell></TableRow></TableHead><TableBody>{dashboardData.students.map(s => (<TableRow key={s._id}><TableCell>{s.fullName}</TableCell><TableCell>{s.email}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  );
}

export default SchoolDashboard;