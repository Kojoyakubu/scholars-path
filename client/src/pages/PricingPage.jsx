import { useSelector, useDispatch } from 'react-redux';
import { initializePayment } from '../features/payment/paymentSlice';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Button, Grid, Card, CardContent, CardActions } from '@mui/material';

const plans = [
  // ADD THIS NEW PLAN
  { 
    name: 'Individual Learner', 
    plan: 'learner_monthly', 
    amount: 5000, // 50 GHC in pesewas
    price: 'GH₵50', 
    per: '/month', 
    description: 'Full access to all general learning content and quizzes created by our team.' 
  },
  { 
    name: 'Teacher Pro', 
    plan: 'teacher_monthly', 
    amount: 5000, // Assuming 50 GHC for teachers too
    price: 'GH₵50', 
    per: '/month', 
    description: 'Access to all teacher tools, including AI generators.' 
  },
  { 
    name: 'School Premium', 
    plan: 'school_monthly', 
    amount: 25000, 
    price: 'GH₵250', 
    per: '/month', 
    description: 'Full access for one school and all its teachers.' 
  },
];

function PricingPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.payment);

  const handleSubscribe = (plan) => {
    if (!user) return alert('Please log in to subscribe.');
    
    const paymentData = {
      email: user.email,
      amount: plan.amount, // Amount in pesewas
      plan: plan.plan,
    };
    dispatch(initializePayment(paymentData));
  };

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
                <CardContent>
                  <Typography variant="h5" component="div">{plan.name}</Typography>
                  <Typography variant="h4" sx={{ my: 2 }}>GH₵{plan.amount / 100}</Typography>
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