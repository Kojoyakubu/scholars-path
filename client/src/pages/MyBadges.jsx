import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyBadges } from '../features/student/studentSlice';
import { Box, Typography, Container, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

function MyBadges() {
  const dispatch = useDispatch();
  const { badges, isLoading } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(getMyBadges());
  }, [dispatch]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Container>
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            My Achievements
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Here are the badges you've earned!
          </Typography>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {badges.length > 0 ? (
              badges.map((studentBadge) => (
                <Grid item key={studentBadge._id} xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
                    <CardContent>
                      <Typography variant="h2" sx={{ fontSize: '60px' }}>
                        {studentBadge.badge.icon}
                      </Typography>
                      <Typography variant="h6" component="h3" sx={{ mt: 1 }}>
                        {studentBadge.badge.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        {studentBadge.badge.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box textAlign="center" width="100%">
                <Typography>
                  You haven't earned any badges yet. Complete a quiz to get started!
                </Typography>
              </Box>
            )}
          </Grid>
        )}
      </Container>
    </motion.div>
  );
}

export default MyBadges;