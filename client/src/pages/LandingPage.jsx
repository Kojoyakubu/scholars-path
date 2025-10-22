// /client/src/pages/LandingPage.jsx

import React from 'react';
import { Box, Container, Typography, Button, Stack, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

// Placeholder for a hero image or illustration
import heroImage from '/hero-illustration.svg'; // You'll need an SVG or PNG here

const LandingPage = () => {
  const theme = useTheme();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <img
            src={heroImage} // Ensure you have a hero-illustration.svg in your public folder
            alt="Learning Illustration"
            style={{ maxWidth: '80%', height: 'auto', marginBottom: theme.spacing(4) }}
          />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ color: theme.palette.primary.dark, fontWeight: 700 }}>
            Scholar's Path
          </Typography>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.4 }}>
          <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Empowering students and teachers with AI-powered, personalized learning paths and dynamic lesson creation.
          </Typography>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.6 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/register"
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LandingPage;