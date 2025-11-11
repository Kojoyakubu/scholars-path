// /client/src/pages/LandingPage.jsx
// 🎨 Ultra-Modern Landing Page - Premium Design with Glassmorphism
// Features: Logo integration, animated hero, interactive cards, testimonials, FAQ, modern effects

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Card,
  CardContent,
  IconButton,
  Collapse,
  Divider,
  Chip,
  TextField,
} from '@mui/material';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Logo from '../components/Logo'; // Import the Logo component

// Icons
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmailIcon from '@mui/icons-material/Email';

// 🎯 Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } 
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.8, ease: 'easeOut' } 
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

// 🔢 Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// 🎴 Modern Feature Card with Hover Effects
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => {
  const theme = useTheme();
  
  return (
    <Grid item xs={12} sm={6} md={4}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ delay }}
        whileHover={{ y: -12 }}
      >
        <Card
          sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(color, 0.15)}`,
            borderRadius: 4,
            p: 4,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: `0 20px 60px ${alpha(color, 0.25)}`,
              border: `2px solid ${alpha(color, 0.4)}`,
              transform: 'translateY(-12px)',
              '& .feature-icon': {
                transform: 'scale(1.1) rotate(5deg)',
              },
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
            },
          }}
        >
          <Avatar
            className="feature-icon"
            sx={{
              width: 70,
              height: 70,
              mb: 3,
              background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
              boxShadow: `0 8px 32px ${alpha(color, 0.4)}`,
              transition: 'transform 0.3s ease',
            }}
          >
            <Icon sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {description}
          </Typography>
        </Card>
      </motion.div>
    </Grid>
  );
};

// 🌟 Testimonial Card
const TestimonialCard = ({ name, role, content, avatar, delay }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay }}
    >
      <Card
        sx={{
          p: 4,
          height: '100%',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 4,
          position: 'relative',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <FormatQuoteIcon 
          sx={{ 
            fontSize: 48, 
            color: alpha(theme.palette.primary.main, 0.2),
            mb: 2,
          }} 
        />
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3, 
            fontStyle: 'italic',
            lineHeight: 1.8,
            color: theme.palette.text.secondary,
          }}
        >
          "{content}"
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56,
              bgcolor: theme.palette.primary.main,
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {avatar}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} sx={{ fontSize: 16, color: '#FFC107' }} />
              ))}
            </Box>
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

// ❓ FAQ Item Component
const FAQItem = ({ question, answer, delay }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay }}
    >
      <Paper
        sx={{
          mb: 2,
          overflow: 'hidden',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
      >
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            p: 3,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {question}
          </Typography>
          <IconButton
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          <Box sx={{ px: 3, pb: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {answer}
            </Typography>
          </Box>
        </Collapse>
      </Paper>
    </motion.div>
  );
};

// 📝 How It Works Step
const HowItWorksStep = ({ number, title, description, icon: Icon, delay }) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} md={4}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={scaleIn}
        transition={{ delay }}
      >
        <Box sx={{ textAlign: 'center', position: 'relative' }}>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                fontSize: '2rem',
                fontWeight: 800,
              }}
            >
              {number}
            </Avatar>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                position: 'absolute',
                bottom: -5,
                right: -5,
                bgcolor: theme.palette.success.main,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.5)}`,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Avatar>
          </Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {description}
          </Typography>
        </Box>
      </motion.div>
    </Grid>
  );
};

// 🎴 AI Insights Card Component
const AIInsightsCard = ({ title = 'AI Insights', content }) => {
  const theme = useTheme();
  
  if (!content) return null;
  
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      sx={{
        p: 5,
        borderRadius: 4,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.secondary.main, 0.1)} 0%, 
          ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 20px 60px ${alpha(theme.palette.secondary.main, 0.2)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.4)}`,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personalized just for you
          </Typography>
        </Box>
      </Box>
      <Typography 
        variant="body1" 
        sx={{ 
          color: theme.palette.text.primary,
          lineHeight: 1.9,
          whiteSpace: 'pre-line',
          fontSize: '1.1rem',
        }}
      >
        {content}
      </Typography>
    </Paper>
  );
};

// 🏠 Main Landing Page Component
const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');
  const [email, setEmail] = useState('');

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.name || user.fullName || 'there';
  };

  // Redirect logged-in users to their dashboards
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'teacher':
          case 'school_admin':
            navigate('/teacher/dashboard');
            break;
          case 'student':
            navigate('/dashboard');
            break;
          default:
            break;
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Fetch personalized AI insights
  useEffect(() => {
    let isMounted = true;
    
    const fetchInsights = async () => {
      try {
        const res = await api.get('/api/ai/onboarding/insights', {
          params: { role: user?.role, name: getUserDisplayName() },
        });
        if (!isMounted) return;
        
        const text = res?.data?.insight || res?.data?.message || '';
        setAiInsights(text);
      } catch (err) {
        if (!isMounted) return;
        setAiError(
          err?.response?.data?.message || 
          err?.message || 
          'Failed to load AI insights.'
        );
      }
    };
    
    if (user) fetchInsights();
    
    return () => { isMounted = false; };
  }, [user]);

  // Handle newsletter signup
  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    // Add your newsletter signup logic here
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  // Features data
  const features = [
    {
      icon: AutoAwesomeIcon,
      title: 'AI-Powered Learning',
      description: 'Leverage cutting-edge AI to generate personalized lesson notes, quizzes, and study materials tailored to each student\'s needs.',
      color: theme.palette.secondary.main,
      delay: 0,
    },
    {
      icon: MenuBookIcon,
      title: 'Smart Content Creation',
      description: 'Teachers can create comprehensive lesson notes and learning materials in minutes with our intelligent content generation system.',
      color: theme.palette.primary.main,
      delay: 0.1,
    },
    {
      icon: QuizIcon,
      title: 'Interactive Assessments',
      description: 'Generate dynamic quizzes and assessments that adapt to student performance, ensuring effective learning outcomes.',
      color: theme.palette.warning.main,
      delay: 0.2,
    },
    {
      icon: TrendingUpIcon,
      title: 'Progress Tracking',
      description: 'Monitor student progress with detailed analytics and insights, helping identify areas for improvement.',
      color: theme.palette.info.main,
      delay: 0.3,
    },
    {
      icon: GroupsIcon,
      title: 'Collaborative Learning',
      description: 'Foster collaboration between students and teachers with shared resources and real-time communication tools.',
      color: theme.palette.success.main,
      delay: 0.4,
    },
    {
      icon: SecurityIcon,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security ensures your data is protected with advanced encryption and regular backups.',
      color: theme.palette.error.main,
      delay: 0.5,
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'High School Teacher',
      content: 'Scholar\'s Path has transformed how I prepare lessons. What used to take hours now takes minutes, and my students are more engaged than ever!',
      avatar: 'SJ',
      delay: 0,
    },
    {
      name: 'Michael Chen',
      role: 'School Principal',
      content: 'The analytics and reporting features have given us unprecedented insights into student performance. It\'s a game-changer for our institution.',
      avatar: 'MC',
      delay: 0.1,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student',
      content: 'I love how personalized my learning experience is. The AI-generated study materials really help me understand difficult concepts better.',
      avatar: 'ER',
      delay: 0.2,
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: 'How does AI-powered content generation work?',
      answer: 'Our AI analyzes curriculum standards and learning objectives to generate high-quality, relevant content. Teachers can customize and refine the generated materials to match their teaching style and student needs.',
      delay: 0,
    },
    {
      question: 'Is Scholar\'s Path suitable for all grade levels?',
      answer: 'Yes! Scholar\'s Path is designed to support learning from primary through secondary education. Our curriculum framework adapts to different educational levels and subjects.',
      delay: 0.1,
    },
    {
      question: 'How secure is student data?',
      answer: 'We take data security very seriously. All data is encrypted in transit and at rest, and we comply with international data protection standards including GDPR and FERPA.',
      delay: 0.2,
    },
    {
      question: 'Can I integrate Scholar\'s Path with existing systems?',
      answer: 'We offer API access and integrations with popular learning management systems. Contact our team to discuss your specific integration needs.',
      delay: 0.3,
    },
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* 🎯 Hero Section with Glassmorphism */}
      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.95)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.85)} 50%,
            ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Animated Background Shapes */}
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: alpha('#FFFFFF', 0.05),
            filter: 'blur(60px)',
          }}
        />
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: alpha('#FFFFFF', 0.03),
            filter: 'blur(80px)',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left Side - Content */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {/* Logo */}
                <motion.div variants={fadeInUp}>
                  <Box 
                    sx={{ 
                      mb: 4,
                    }}
                  >
                    <Logo 
                      height={100}
                      sx={{
                        height: { xs: 60, sm: 80, md: 100 },
                        width: 'auto',
                      }}
                    />
                  </Box>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                      lineHeight: 1.2,
                      mb: 3,
                      textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Transform Education with{' '}
                    <Box
                      component="span"
                      sx={{
                        background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      AI-Powered
                    </Box>{' '}
                    Learning
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      fontWeight: 400,
                      lineHeight: 1.7,
                      color: alpha('#FFFFFF', 0.95),
                      maxWidth: 600,
                    }}
                  >
                    Empower teachers with intelligent lesson planning, engage students with personalized content, and track progress with advanced analytics.
                  </Typography>
                </motion.div>

                {/* CTA Buttons for non-logged-in users */}
                {!user && (
                  <motion.div variants={fadeInUp}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button
                        variant="contained"
                        size="large"
                        component={RouterLink}
                        to="/register"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          bgcolor: '#FFFFFF',
                          color: theme.palette.primary.dark,
                          px: 5,
                          py: 2,
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          borderRadius: 3,
                          boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: alpha('#FFFFFF', 0.95),
                            transform: 'translateY(-4px)',
                            boxShadow: '0 16px 48px rgba(255, 255, 255, 0.4)',
                          },
                        }}
                      >
                        Get Started Free
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to="/login"
                        startIcon={<PlayCircleFilledIcon />}
                        sx={{
                          borderColor: '#FFFFFF',
                          color: '#FFFFFF',
                          borderWidth: 2,
                          px: 5,
                          py: 2,
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          bgcolor: alpha('#FFFFFF', 0.1),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#FFFFFF',
                            bgcolor: alpha('#FFFFFF', 0.2),
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        Watch Demo
                      </Button>
                    </Stack>
                  </motion.div>
                )}

                {/* Trust Indicators */}
                {!user && (
                  <motion.div variants={fadeInUp}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mt: 5, flexWrap: 'wrap', gap: 2 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                        <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                          No credit card required
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                        <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                          Free 30-day trial
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                        <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.9) }}>
                          Cancel anytime
                        </Typography>
                      </Stack>
                    </Stack>
                  </motion.div>
                )}
              </motion.div>
            </Grid>

            {/* Right Side - AI Insights or Illustration */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {user ? (
                  <Box>
                    {aiError ? (
                      <Paper
                        sx={{
                          p: 5,
                          bgcolor: alpha('#FFFFFF', 0.15),
                          backdropFilter: 'blur(20px)',
                          border: `2px solid ${alpha('#FFFFFF', 0.2)}`,
                          borderRadius: 4,
                        }}
                      >
                        <Typography color="error.light" variant="body1">
                          {aiError}
                        </Typography>
                      </Paper>
                    ) : (
                      <AIInsightsCard
                        title={
                          user.role === 'teacher'
                            ? `Welcome Back, ${getUserDisplayName()}!`
                            : user.role === 'admin'
                            ? `Hello Admin ${getUserDisplayName()}`
                            : user.role === 'school_admin'
                            ? `Hello ${getUserDisplayName()} (School Admin)`
                            : `Welcome Back, ${getUserDisplayName()}!`
                        }
                        content={aiInsights || 'Redirecting you to your dashboard now...'}
                      />
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 500,
                      bgcolor: alpha('#FFFFFF', 0.15),
                      borderRadius: 5,
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha('#FFFFFF', 0.2)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {/* Decorative elements */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        height: '80%',
                        border: `2px dashed ${alpha('#FFFFFF', 0.2)}`,
                        borderRadius: '50%',
                      }}
                    />
                    <Box
                      component={motion.div}
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, 0, -5, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <Logo 
                        height={100}
                        white={true}
                        sx={{
                          height: { xs: 60, sm: 75, md: 87.5 },
                          width: 'auto',
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 🏆 Stats Section */}
      <Box sx={{ py: 8, bgcolor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    <AnimatedCounter end={500} suffix="+" />
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Schools Enrolled
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    <AnimatedCounter end={50} suffix="K+" />
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Active Students
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    <AnimatedCounter end={98} suffix="%" />
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Satisfaction Rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* 🌟 Features Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(180deg, 
            ${theme.palette.background.paper} 0%, 
            ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Features"
                sx={{
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              />
              <Typography
                variant="h2"
                gutterBottom
                sx={{ fontWeight: 800, mb: 2 }}
              >
                Everything You Need to Succeed
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}
              >
                Comprehensive tools and features designed to enhance learning experiences 
                for students, teachers, and administrators.
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 📝 How It Works Section */}
      <Box sx={{ py: 10, bgcolor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Simple Process"
                sx={{
                  mb: 2,
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              />
              <Typography
                variant="h2"
                gutterBottom
                sx={{ fontWeight: 800, mb: 2 }}
              >
                How It Works
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}
              >
                Get started in three simple steps
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={6}>
            <HowItWorksStep
              number="1"
              title="Sign Up & Set Up"
              description="Create your account and set up your school, classes, and curriculum in minutes."
              icon={SchoolIcon}
              delay={0}
            />
            <HowItWorksStep
              number="2"
              title="Create Content"
              description="Use our AI-powered tools to generate lesson notes, quizzes, and learning materials."
              icon={AutoAwesomeIcon}
              delay={0.1}
            />
            <HowItWorksStep
              number="3"
              title="Track Progress"
              description="Monitor student performance with detailed analytics and personalized insights."
              icon={AssessmentIcon}
              delay={0.2}
            />
          </Grid>
        </Container>
      </Box>

      {/* 💬 Testimonials Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(180deg, 
            ${alpha(theme.palette.primary.main, 0.02)} 0%, 
            ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="Testimonials"
                sx={{
                  mb: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              />
              <Typography
                variant="h2"
                gutterBottom
                sx={{ fontWeight: 800, mb: 2 }}
              >
                Loved by Educators Worldwide
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}
              >
                See what our users have to say about their experience
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <TestimonialCard {...testimonial} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ❓ FAQ Section */}
      <Box sx={{ py: 10, bgcolor: theme.palette.background.paper }}>
        <Container maxWidth="md">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip
                label="FAQ"
                sx={{
                  mb: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              />
              <Typography
                variant="h2"
                gutterBottom
                sx={{ fontWeight: 800, mb: 2 }}
              >
                Frequently Asked Questions
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                Find answers to common questions about Scholar's Path
              </Typography>
            </Box>
          </motion.div>

          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </Container>
      </Box>

      {/* 📧 Newsletter Section */}
      {!user && (
        <Box
          sx={{
            py: 8,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.08)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          }}
        >
          <Container maxWidth="md">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Paper
                sx={{
                  p: 6,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 4,
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    bgcolor: theme.palette.primary.main,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 2 }}>
                  Stay Updated
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                  Subscribe to our newsletter for the latest updates, features, and educational insights.
                </Typography>
                <Box
                  component="form"
                  onSubmit={handleNewsletterSignup}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    maxWidth: 500,
                    mx: 'auto',
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      px: 4,
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content',
                    }}
                  >
                    Subscribe
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          </Container>
        </Box>
      )}

      {/* 🚀 Final CTA Section */}
      {!user && (
        <Box
          sx={{
            py: 12,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.95)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated background elements */}
          <Box
            component={motion.div}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: alpha('#FFFFFF', 0.1),
              filter: 'blur(100px)',
            }}
          />

          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <Typography
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: 900,
                  mb: 3,
                  fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' },
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                }}
              >
                Ready to Transform Education?
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  color: alpha('#FFFFFF', 0.95),
                  lineHeight: 1.8,
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                Join thousands of educators and students already using Scholar's Path to create better learning experiences.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: theme.palette.primary.dark,
                    px: 6,
                    py: 2.5,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    boxShadow: '0 12px 40px rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha('#FFFFFF', 0.95),
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 60px rgba(255, 255, 255, 0.4)',
                    },
                  }}
                >
                  Start Your Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    borderColor: '#FFFFFF',
                    color: '#FFFFFF',
                    borderWidth: 2,
                    px: 6,
                    py: 2.5,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    backdropFilter: 'blur(10px)',
                    bgcolor: alpha('#FFFFFF', 0.1),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      bgcolor: alpha('#FFFFFF', 0.2),
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  Contact Sales
                </Button>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  mt: 4,
                  color: alpha('#FFFFFF', 0.8),
                  fontSize: '1rem',
                }}
              >
                No credit card required • Free 30-day trial • Cancel anytime
              </Typography>
            </motion.div>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default LandingPage;