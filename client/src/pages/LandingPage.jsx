// /client/src/pages/LandingPage.jsx
// ✨ Fully Rewritten Modern Landing Page
// Clean • Focused • Professional • Ghana-friendly • High Conversion

import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
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

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const LandingPage = () => {
  const theme = useTheme();

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
            <Button component={RouterLink} to="/login" variant="text">
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              sx={{ borderRadius: 2 }}
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
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
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
                and learning paths instantly. Optimized for Ghanaian schools.
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  size="large"
                  sx={{ borderRadius: 2 }}
                >
                  Start Learning
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{ borderRadius: 2 }}
                >
                  Teacher Login
                </Button>
              </Box>
            </motion.div>
          </Grid>

          {/* Minimal Hero Illustration */}
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
                  src="https://cdn3d.iconscout.com/3d/premium/thumb/studying-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--education-boy-student-learning-pack-people-illustrations-6533693.png"
                  alt="learning"
                  style={{ width: "100%", borderRadius: 20 }}
                />
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* 🇬🇭 GHANA SECTION */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible">
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
                <Grid item xs={12} md={3} key={i}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: alpha("#fff", 0.8),
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <CheckCircleIcon
                      sx={{ fontSize: 30, color: "primary.main", mb: 1 }}
                    />
                    <Typography variant="body1">{text}</Typography>
                  </Paper>
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
                transition={{ delay: i * 0.1 }}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: alpha("#fff", 0.9),
                  border: `1px solid ${alpha("#000", 0.1)}`,
                  height: "100%",
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
            style={{ width: "100%", borderRadius: 16 }}
          />
        </Paper>
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
            },
          ].map((plan, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  border: `1px solid ${alpha("#000", 0.1)}`,
                  background: plan.popular
                    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    : "white",
                  color: plan.popular ? "white" : "inherit",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {plan.title}
                  </Typography>

                  <Typography variant="h3" sx={{ fontWeight: 900, my: 2 }}>
                    {plan.price}
                  </Typography>

                  {plan.features.map((f, idx) => (
                    <Typography key={idx} sx={{ mb: 1 }}>
                      • {f}
                    </Typography>
                  ))}
                </CardContent>

                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: plan.popular ? "white" : "primary.main",
                      color: plan.popular ? "primary.main" : "white",
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  >
                    Choose Plan
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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
          <Typography sx={{ textAlign: "center", opacity: 0.7 }}>
            © {new Date().getFullYear()} Scholar's Path — Empowering the Future
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
