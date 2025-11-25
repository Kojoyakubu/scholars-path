// /client/src/pages/LandingPage.jsx
// ✨ Modern Landing Page - FIXED ROUTES & IMPROVED
// Clean • Focused • Professional • Ghana-friendly • High Conversion

import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import DiamondIcon from "@mui/icons-material/Diamond";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
      }}
    >
      {/* 🌐 NAVBAR */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "white", py: 1 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <SchoolIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              Scholar's Path
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="text"
              sx={{ textTransform: 'none' }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 🎯 HERO SECTION */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div 
              variants={fadeIn} 
              initial="hidden" 
              animate="visible"
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.2,
                  mb: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Transform Teaching & Learning with AI-Powered Automation
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 550 }}
              >
                Generate curriculum-aligned lesson notes, quizzes, explanations,
                and learning paths instantly. Optimized for Ghanaian schools, Teachers and Students.
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap' }}>
                <Button
                  onClick={handleGetStarted}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }
                  }}
                >
                  Start Learning
                </Button>
                <Button
                  onClick={handleLogin}
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4,
                  }}
                >
                  Login
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Hero Illustration */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: alpha("#ffffff", 0.8),
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${alpha("#000", 0.1)}`,
                }}
              >
                <img
                  src="/school-students-digital-art-style-education-day.jpg"
                  alt="Student learning on Scholar's Path - AI-powered education platform for Ghana"
                  style={{ width: "100%", borderRadius: 20, objectFit: "contain", maxHeight: "500px" }}
                  loading="lazy"
                />
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* 🇬🇭 GHANA SECTION */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div 
          variants={fadeIn} 
          initial="hidden" 
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 4,
              background: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              textAlign: "center",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              🇬🇭 Built for Ghanaian Classrooms
            </Typography>

            <Typography
              variant="body1"
              sx={{ maxWidth: 800, mx: "auto", mb: 3 }}
            >
              100% aligned with NaCCA curriculum. Designed for Basic 1–9.  
              Works perfectly for both private and public schools—even on low internet.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 3 }}>
              {[
                "NaCCA-Aligned Content",
                "BECE-Ready Quizzes",
                "Low-Bandwidth Optimized",
                "Teacher Friendly Tools",
              ].map((text, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: alpha("#fff", 0.8),
                        backdropFilter: "blur(6px)",
                        height: '100%',
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ fontSize: 30, color: "primary.main", mb: 1 }}
                      />
                      <Typography variant="body1" fontWeight={600}>
                        {text}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </motion.div>
      </Container>

      {/* 🧩 FEATURES */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            textAlign: "center",
            mb: 6,
          }}
        >
          Powerful Features
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: "AI Lesson Notes",
              desc: "Generate complete teaching notes aligned with strands & substrands.",
              icon: AutoAwesomeIcon,
            },
            {
              title: "Automatic Quizzes",
              desc: "20+ MCQs, essays, true/false & simple answers—generated instantly.",
              icon: BarChartIcon,
            },
            {
              title: "Student Dashboard",
              desc: "Modern dashboard with topics, notes, quizzes & resources.",
              icon: WorkspacePremiumIcon,
            },
          ].map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: alpha("#fff", 0.9),
                  border: `1px solid ${alpha("#000", 0.1)}`,
                  height: "100%",
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                  }
                }}
              >
                <item.icon
                  sx={{
                    fontSize: 48,
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 🖼️ PRODUCT PREVIEW */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, textAlign: "center", mb: 4 }}
        >
          What You Can Create
        </Typography>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: alpha("#fff", 0.8),
            }}
          >
            <img
              src="https://cdn3d.iconscout.com/3d/premium/thumb/tablet-learning-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--elearning-study-online-course-education-pack-school-illustrations-6535902.png"
              alt="Product preview"
              style={{ width: "100%", borderRadius: 16 }}
              loading="lazy"
            />
          </Paper>
        </motion.div>
      </Container>

      {/* 💵 PRICING SECTION */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, textAlign: "center", mb: 6 }}
        >
          Simple Pricing
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: "Free Plan",
              price: "GHS 0",
              features: ["Basic access", "Student dashboard", "Limited content"],
              buttonText: "Get Started Free",
              route: "/register",
            },
            {
              title: "Teacher Pro",
              price: "GHS 25/month",
              features: [
                "Unlimited notes",
                "Unlimited quizzes",
                "Resources upload",
                "AI insights",
              ],
              popular: true,
              buttonText: "Start Free Trial",
              route: "/register",
            },
            {
              title: "School Plan",
              price: "Custom",
              features: [
                "Admin dashboard",
                "Teachers onboarding",
                "Advanced analytics",
                "Priority support",
              ],
              buttonText: "Contact Sales",
              route: "/register",
            },
          ].map((plan, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  border: plan.popular 
                    ? `2px solid ${theme.palette.primary.main}` 
                    : `1px solid ${alpha("#000", 0.1)}`,
                  background: plan.popular
                    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : "white",
                  color: plan.popular ? "white" : "inherit",
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      right: 20,
                      bgcolor: theme.palette.secondary.main,
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    POPULAR
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                    {plan.title}
                  </Typography>

                  <Typography variant="h3" sx={{ fontWeight: 900, my: 2 }}>
                    {plan.price}
                  </Typography>

                  {plan.features.map((f, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, mr: 1 }} />
                      <Typography variant="body2">{f}</Typography>
                    </Box>
                  ))}
                </CardContent>

                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    component={RouterLink}
                    to={plan.route}
                    sx={{
                      bgcolor: plan.popular ? "white" : "primary.main",
                      color: plan.popular ? "primary.main" : "white",
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': {
                        bgcolor: plan.popular ? alpha("#fff", 0.9) : "primary.dark",
                      }
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 🎉 FINAL CTA */}
      <Container maxWidth="md" sx={{ py: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 4,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
              Ready to Transform Your Classroom?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of teachers and students already using Scholar's Path
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.9),
                }
              }}
            >
              Get Started Free
            </Button>
          </Paper>
        </motion.div>
      </Container>

      {/* 🦶 FOOTER */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          py: 4,
          mt: 10,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SchoolIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                  Scholar's Path
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Empowering education through AI-powered learning tools designed for Ghanaian schools.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button component={RouterLink} to="/register" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  Features
                </Button>
                <Button component={RouterLink} to="/register" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  Pricing
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button component={RouterLink} to="/register" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  About Us
                </Button>
                <Button component={RouterLink} to="/login" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  Contact
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button component={RouterLink} to="/register" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  Privacy
                </Button>
                <Button component={RouterLink} to="/register" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  Terms
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Get Started
              </Typography>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                fullWidth
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Sign Up Free
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha('#000', 0.1)}` }}>
            <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.7 }}>
              © {new Date().getFullYear()} Scholar's Path — Empowering the Future
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;