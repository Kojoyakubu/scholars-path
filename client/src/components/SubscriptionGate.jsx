import { useSelector } from 'redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Container, Button, Paper, CircularProgress } from '@mui/material';

const SubscriptionGate = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  // 1. Show a loading spinner while auth status is being determined
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 2. Always allow admins
  if (user?.role === 'admin') {
    return children;
  }

  // 3. Allow users with an active subscription
  if (user?.isSubscribed) {
    return children;
  }

  // 4. If none of the above, show the paywall
  return (
    <Container maxWidth="md">
      <Paper sx={{textAlign: 'center', my: 10, p: 4, mt: '20vh'}}>
        <Typography variant="h4" gutterBottom>Subscription Required</Typography>
        <Typography variant="h6" color="text.secondary" sx={{mb: 3}}>
          You need an active subscription to access this feature.
        </Typography>
        <Button component={RouterLink} to="/pricing" variant="contained" size="large">
          View Pricing Plans
        </Button>
      </Paper>
    </Container>
  );
};

export default SubscriptionGate;