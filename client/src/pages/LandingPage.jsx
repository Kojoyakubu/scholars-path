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
  useMediaQuery,
  alpha,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import GroupsIcon from "@mui/icons-material/Groups";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const handleGetStarted = () => navigate("/register");
  const handleLogin = () => navigate("/login");

  const trustMetrics = [
    { label: "Teacher Hours Saved", value: "12k+" },
    { label: "Quizzes Generated", value: "85k+" },
    { label: "Schools Onboarded", value: "160+" },
  ];

  const outcomes = [
    {
      icon: BoltIcon,
      title: "Plan Faster",
      desc: "Generate weekly lesson notes and assessments in minutes.",
    },
    {
      icon: QueryStatsIcon,
      title: "Track Progress",
      desc: "See topic-level mastery and identify weak spots early.",
    },
    {
      icon: GroupsIcon,
      title: "Support Every Learner",
      desc: "Give students notes, quizzes, and explanations tailored to level.",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Pick Class + Subject",
      desc: "Choose level, strand, and sub-strand aligned to NaCCA.",
    },
    {
      step: "02",
      title: "Generate Content",
      desc: "Create lesson notes, quiz sets, and resource bundles instantly.",
    },
    {
      step: "03",
      title: "Assign + Review",
      desc: "Share with students and monitor outcomes from one dashboard.",
    },
  ];

  const pricing = [
    {
      title: "Starter",
      price: "GHS 0",
      sub: "Great for trying the platform",
      features: ["Core lesson tools", "Student dashboard", "Limited generations"],
      cta: "Start Free",
      route: "/register",
    },
    {
      title: "Teacher Pro",
      price: "GHS 25/mo",
      sub: "Built for daily classroom use",
      features: ["Unlimited lesson notes", "Unlimited quizzes", "AI insights", "Priority support"],
      cta: "Start Teacher Pro",
      route: "/register",
      featured: true,
    },
    {
      title: "School",
      price: "Custom",
      sub: "For multi-teacher institutions",
      features: ["Admin controls", "Team onboarding", "Analytics", "Dedicated support"],
      cta: "Talk to Sales",
      route: "/register",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: { xs: 10, md: 0 },
        background:
          "radial-gradient(circle at 15% 10%, rgba(37,99,235,0.16), transparent 35%), radial-gradient(circle at 85% 5%, rgba(245,158,11,0.15), transparent 30%), linear-gradient(180deg, #F8FBFF 0%, #FFFFFF 40%, #F6F8FC 100%)",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha("#FFFFFF", 0.8),
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Toolbar sx={{ py: { xs: 0.6, sm: 0.8 } }}>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(140deg, #1E3A5F 0%, #2563EB 70%, #60A5FA 100%)",
              }}
            >
              <SchoolIcon sx={{ color: "white", fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A" }}>
              Scholar&apos;s Path
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button onClick={handleLogin} variant="text" sx={{ px: 1.5, display: { xs: "none", sm: "inline-flex" } }}>
              Login
            </Button>
            <Button onClick={handleGetStarted} variant="contained" size={isMobile ? "medium" : "large"} endIcon={<ArrowForwardIcon />}>
              Start Free
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ pt: { xs: 6.5, md: 11 }, pb: { xs: 6, md: 8 } }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.div variants={reveal}>
                <Chip
                  label="Built for Ghanaian classrooms"
                  sx={{
                    mb: 2,
                    bgcolor: alpha("#2563EB", 0.1),
                    color: "#1E3A5F",
                    fontWeight: 700,
                  }}
                />
              </motion.div>

              <motion.div variants={reveal}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2rem", sm: "2.35rem", md: "3.5rem" },
                    lineHeight: 1.06,
                    mb: 2,
                    color: "#0B1324",
                    textWrap: "balance",
                  }}
                >
                  Teachers plan in minutes.
                  <Box component="span" sx={{ color: "#2563EB" }}>
                    {" "}
                    Students learn with clarity.
                  </Box>
                </Typography>
              </motion.div>

              <motion.div variants={reveal}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#334155",
                    maxWidth: 560,
                    mb: 3.5,
                  }}
                >
                  Create NaCCA-aligned lesson notes, assessments, and learning support in one flow.
                  Spend less time preparing and more time teaching.
                </Typography>
              </motion.div>

              <motion.div variants={reveal}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3.5 }}>
                  <Button
                    onClick={handleGetStarted}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    fullWidth={isMobile}
                    sx={{ px: 3.5 }}
                  >
                    Start Free as Teacher
                  </Button>
                  <Button
                    onClick={handleLogin}
                    variant="outlined"
                    size="large"
                    fullWidth={isMobile}
                    sx={{ px: 3.5, borderWidth: 2 }}
                  >
                    See Student Experience
                  </Button>
                </Stack>
              </motion.div>

              <motion.div variants={reveal}>
                <Stack direction="row" spacing={1.4} alignItems="center" flexWrap="wrap" useFlexGap>
                  <CheckCircleIcon sx={{ color: "#10B981", fontSize: 20 }} />
                  <Typography variant="body2">No credit card required</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    •
                  </Typography>
                  <Typography variant="body2">Works on low bandwidth</Typography>
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)",
                  border: `1px solid ${alpha("#1E3A5F", 0.12)}`,
                  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: `1px solid ${alpha("#1E3A5F", 0.1)}`,
                  }}
                >
                  <img
                    src="3090733_479.jpg"
                    alt="Scholar's Path classroom product preview"
                    style={{ width: "100%", display: "block", maxHeight: 520, objectFit: "cover" }}
                    loading="lazy"
                  />
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <Grid container spacing={2}>
            {trustMetrics.map((item) => (
              <Grid item xs={12} sm={4} key={item.label}>
                <motion.div variants={reveal}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.4,
                      borderRadius: 3,
                      bgcolor: alpha("#FFFFFF", 0.85),
                      border: `1px solid ${alpha("#1E3A5F", 0.1)}`,
                      textAlign: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: "1.8rem", color: "#1E3A5F" }}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      {item.label}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 11 } }}>
        <Typography
          variant="h3"
          sx={{ mb: 4.5, fontWeight: 800, textAlign: "center", fontSize: { xs: "1.7rem", sm: "2.1rem", md: "3rem" } }}
        >
          Outcomes That Matter
        </Typography>
        <Grid container spacing={3}>
          {outcomes.map((item, i) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: `1px solid ${alpha("#1E3A5F", 0.1)}`,
                  background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <item.icon sx={{ color: "#2563EB", fontSize: 34, mb: 1.2 }} />
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#475569" }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ py: { xs: 8, md: 10 }, background: "linear-gradient(180deg, #EEF4FF 0%, #FFFFFF 100%)" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ mb: 2, textAlign: "center", fontWeight: 800, fontSize: { xs: "1.7rem", sm: "2.1rem", md: "3rem" } }}
          >
            How It Works
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 5.5, color: "#475569" }}>
            One focused workflow for teachers, students, and school leaders.
          </Typography>

          <Grid container spacing={3}>
            {workflow.map((item, i) => (
              <Grid item xs={12} md={4} key={item.step}>
                <Paper
                  component={motion.div}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 4,
                    border: `1px solid ${alpha("#1E3A5F", 0.12)}`,
                    background: alpha("#FFFFFF", 0.92),
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#2563EB",
                      fontSize: "0.9rem",
                      letterSpacing: "0.08em",
                      mb: 1,
                    }}
                  >
                    STEP {item.step}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.8 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#475569" }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            textAlign: "center",
            border: `1px solid ${alpha("#1E3A5F", 0.14)}`,
            background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(245,158,11,0.1) 100%)",
          }}
        >
          <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.9rem", md: "2.125rem" } }}>
            Aligned to NaCCA. Designed for real classrooms.
          </Typography>
          <Typography variant="body1" sx={{ color: "#334155", maxWidth: 860, mx: "auto", mb: 3 }}>
            From Basic 1 to JHS, Scholar&apos;s Path supports curriculum-aligned planning, BECE-ready
            assessments, and low-bandwidth delivery for both private and public schools.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} justifyContent="center">
            <Chip label="NaCCA-aligned content" color="primary" />
            <Chip label="BECE-ready assessment flow" color="primary" variant="outlined" />
            <Chip label="Low-bandwidth friendly" color="primary" variant="outlined" />
          </Stack>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 11 } }}>
        <Typography
          variant="h3"
          sx={{ mb: 5, textAlign: "center", fontWeight: 800, fontSize: { xs: "1.7rem", sm: "2.1rem", md: "3rem" } }}
        >
          Simple Pricing
        </Typography>

        <Grid container spacing={3}>
          {pricing.map((plan, i) => (
            <Grid item xs={12} md={4} key={plan.title}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: plan.featured
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${alpha("#1E3A5F", 0.12)}`,
                  background: plan.featured
                    ? "linear-gradient(180deg, #FFFFFF 0%, #EEF4FF 100%)"
                    : "#FFFFFF",
                  position: "relative",
                }}
              >
                {plan.featured && (
                  <Chip
                    label="MOST POPULAR"
                    sx={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      bgcolor: "#2563EB",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                    }}
                  />
                )}

                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {plan.title}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: "2rem", mt: 1 }}>{plan.price}</Typography>
                  <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
                    {plan.sub}
                  </Typography>

                  <Stack spacing={1.1} sx={{ mb: 2.8 }}>
                    {plan.features.map((feature) => (
                      <Box key={feature} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ color: "#10B981", fontSize: 18 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    variant={plan.featured ? "contained" : "outlined"}
                    component={RouterLink}
                    to={plan.route}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="md" sx={{ pb: { xs: 8, md: 12 } }}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          elevation={0}
          sx={{
            p: { xs: 3.2, md: 5 },
            borderRadius: 4,
            textAlign: "center",
            background: "linear-gradient(140deg, #1E3A5F 0%, #2563EB 70%, #60A5FA 100%)",
            color: "white",
          }}
        >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.2, fontSize: { xs: "1.5rem", sm: "1.9rem", md: "2.125rem" } }}>
            Ready to Upgrade Your Classroom Workflow?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, mb: 3 }}>
            Join educators building better lessons and stronger learning outcomes every day.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: "white",
              color: "#1E3A5F",
              px: 3.2,
              "&:hover": { bgcolor: alpha("#FFFFFF", 0.92) },
            }}
          >
            Get Started Free
          </Button>
        </Paper>
      </Container>

      <Box
        sx={{
          borderTop: `1px solid ${alpha("#1E3A5F", 0.08)}`,
          bgcolor: alpha("#FFFFFF", 0.7),
          py: 3.5,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              © {new Date().getFullYear()} Scholar&apos;s Path
            </Typography>
            <Stack direction="row" spacing={2.2}>
              <Button size="small" component={RouterLink} to="/register" sx={{ color: "#64748B" }}>
                Privacy
              </Button>
              <Button size="small" component={RouterLink} to="/register" sx={{ color: "#64748B" }}>
                Terms
              </Button>
              <Button size="small" component={RouterLink} to="/login" sx={{ color: "#64748B" }}>
                Contact
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1400,
          display: { xs: "block", md: "none" },
          px: 1.5,
          py: 1,
          bgcolor: alpha("#FFFFFF", 0.88),
          backdropFilter: "blur(10px)",
          borderTop: `1px solid ${alpha("#1E3A5F", 0.14)}`,
        }}
      >
        <Button
          onClick={handleGetStarted}
          variant="contained"
          fullWidth
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{ py: 1.25 }}
        >
          Start Free as Teacher
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
