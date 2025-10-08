import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Container, Button, Paper } from '@mui/material';

const SubscriptionGate = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // Rule 1: Always allow admins
  if (user?.role === 'admin') {
    return children;
  }

  // Rule 2: Allow users with an active subscription
  if (user?.isSubscribed) {
    return children;
  }

  // If neither rule is met, show the paywall
  return (
    <Container>
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