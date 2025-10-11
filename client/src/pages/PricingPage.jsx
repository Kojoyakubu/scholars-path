import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// THE FIX IS HERE: Import the correctly named reset action
import { initializePayment, resetPaymentState } from '../features/payment/paymentSlice'; 
import { plans } from '../constants/pricingPlans';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Button, Grid, Card, CardContent, CardActions, CircularProgress } from '@mui/material';

function PricingPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading, authorization_url, isError, message } = useSelector((state) => state.payment);

  const handleSubscribe = (plan) => {
    if (!user) {
      // In a real app, you'd show a toast notification here
      alert('Please log in or register to subscribe.');
      return;
    }
    
    const paymentData = {
      email: user.email,
      amount: plan.amount,
      plan: plan.plan, // Use the plan identifier, e.g., 'learner_monthly'
    };
    dispatch(initializePayment(paymentData));
  };

  useEffect(() => {
    // This effect listens for the authorization_url from the Redux state
    if (authorization_url) {
      window.location.href = authorization_url;
      // THE FIX IS HERE: Dispatch the correctly named reset action after redirecting
      dispatch(resetPaymentState());
    }
    
    // Cleanup the state when the component unmounts
    return () => {
        dispatch(resetPaymentState());
    }
  }, [authorization_url, dispatch]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Container maxWidth="lg">
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 600}}>Pricing Plans</Typography>
          <Typography variant="h6" color="text.secondary">Choose the plan that's right for your educational journey.</Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {plans.map((plan) => (
            <Grid item key={plan.name} xs={12} sm={6} md={4}>
              <Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" sx={{fontWeight: 'bold'}}>{plan.name}</Typography>
                  <Typography variant="h4" sx={{ my: 2 }}>
                    GH₵{plan.amount / 100}
                    <Typography component="span" color="text.secondary">/month</Typography>
                  </Typography>
                  <Typography color="text.secondary">{plan.description}</Typography>
                </CardContent>
                <CardActions sx={{p: 2}}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={() => handleSubscribe(plan)} 
                    disabled={isLoading}
                    size="large"
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Subscribe Now'}
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