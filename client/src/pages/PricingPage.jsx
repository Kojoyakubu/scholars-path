import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initializePayment, resetPayment } from '../features/payment/paymentSlice';
import { plans } from '../constants/pricingPlans'; // Import plans
import { motion } from 'framer-motion';
import { Box, Typography, Container, Button, Grid, Card, CardContent, CardActions } from '@mui/material';

function PricingPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, authorization_url } = useSelector((state) => state.payment);

  const handleSubscribe = (plan) => {
    if (!user) {
      // Consider using a proper notification/modal instead of alert
      alert('Please log in to subscribe.');
      return;
    }
    
    const paymentData = {
      email: user.email,
      amount: plan.amount,
      plan: plan.plan,
    };
    dispatch(initializePayment(paymentData));
  };

  useEffect(() => {
    // This effect listens for the authorization_url from the Redux state
    if (authorization_url) {
      window.location.href = authorization_url;
      // Reset the payment state after redirecting
      dispatch(resetPayment());
    }
  }, [authorization_url, dispatch]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Container>
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom>Pricing Plans</Typography>
          <Typography variant="h6" color="text.secondary">Choose the plan that's right for you.</Typography>
        </Box>
        <Grid container spacing={3} justifyContent="center">
          {plans.map((plan) => (
            <Grid item key={plan.name} xs={12} sm={6} md={4}>
              <Card elevation={3}>
                <CardContent sx={{ minHeight: 150 }}>
                  <Typography variant="h5" component="div">{plan.name}</Typography>
                  <Typography variant="h4" sx={{ my: 2 }}>GH₵{plan.amount / 100} <span style={{fontSize: '1rem'}}>/month</span></Typography>
                  <Typography color="text.secondary">{plan.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button fullWidth variant="contained" onClick={() => handleSubscribe(plan)} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </motion.div>
  );
}

export default PricingPage;