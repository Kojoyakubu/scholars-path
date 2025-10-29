// /client/src/pages/PricingPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../api/axios';

// Inline AI card component
const AIInsightsCard = ({ title = 'AI Insights', content }) => {
  if (!content) return null;
  return (
    <Paper
      sx={{ p: 3, mt: 4, borderLeft: '6px solid #6c63ff', borderRadius: 2 }}
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body1" color="text.secondary" whiteSpace="pre-line">
        {content}
      </Typography>
    </Paper>
  );
};

const PricingPage = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth || {});
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      features: [
        'Basic AI lesson generation',
        'Limited quiz creation',
        '1 class / 20 students',
      ],
    },
    {
      name: 'Pro',
      price: 'GHS 49/month',
      features: [
        'Unlimited lesson notes',
        'Full quiz generator',
        'Advanced analytics',
        'Priority AI processing',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'For schools and districts',
        'Centralized management',
        'Unlimited teachers & students',
        'Dedicated support and AI reports',
      ],
    },
  ];

  // Personalized AI plan suggestion
  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      try {
        const res = await api.get('/api/ai/pricing/insights', {
          params: { role: user?.role, name: user?.fullName },
        });
        if (!isMounted) return;
        const text = res?.data?.insight || res?.data?.message || '';
        setAiInsights(text);
      } catch (err) {
        if (!isMounted) return;
        setAiError(err?.response?.data?.message || err?.message || 'Failed to load AI insights.');
      }
    };
    if (user) fetchInsights();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <Box
      sx={{
        py: 8,
        bgcolor: theme.palette.background.default,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Unlock the full power of Scholar&apos;s Path for your classroom, school, or learning journey.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {plans.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-8px)' },
                }}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {plan.name}
                </Typography>
                <Typography
                  variant="h4"
                  color="primary"
                  fontWeight={700}
                  gutterBottom
                >
                  {plan.price}
                </Typography>

                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {plan.features.map((feature, i) => (
                    <Typography key={i} color="text.secondary">
                      • {feature}
                    </Typography>
                  ))}
                </Stack>

                <Button
                  variant={index === 1 ? 'contained' : 'outlined'}
                  color="primary"
                  size="large"
                  fullWidth
                >
                  {index === 0
                    ? 'Get Started'
                    : index === 1
                    ? 'Upgrade to Pro'
                    : 'Contact Sales'}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Personalized AI Recommendation */}
        {user && (
          <>
            {aiError ? (
              <Typography color="error" sx={{ mt: 3 }}>
                {aiError}
              </Typography>
            ) : (
              <AIInsightsCard
                title={
                  user.role === 'teacher'
                    ? `Hi ${user.fullName}, Recommended Plan for You`
                    : user.role === 'student'
                    ? `Hi ${user.fullName}, Here's the Best Plan for Your Learning`
                    : user.role === 'school_admin'
                    ? `Welcome ${user.fullName} — School Plan Insights`
                    : `Hello ${user.fullName}`
                }
                content={aiInsights}
              />
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default PricingPage;
