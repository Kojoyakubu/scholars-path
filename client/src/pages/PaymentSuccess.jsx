// /src/pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  CircularProgress,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { getProfile } from '../features/auth/authSlice';

function PaymentSuccess() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // When the page loads, fetch the updated user profile after payment
    dispatch(getProfile()).finally(() => setIsLoading(false));
  }, [dispatch]);

  if (isLoading) {
    return (
      <Container>
        <Box textAlign="center" my={10}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Finalizing your subscription...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box textAlign="center" my={10}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80 }} />
        <Typography variant="h4" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your subscription is now active.
        </Typography>

        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          sx={{ mt: 4 }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
}

export default PaymentSuccess;
