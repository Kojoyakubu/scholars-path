import { useState } from "react";
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
  Divider,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import GroupsIcon from "@mui/icons-material/Groups";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

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
  const [activePreview, setActivePreview] = useState("notes");

  const handleGetStarted = () => navigate("/register");
  const handleLogin = () => navigate("/login");

  const previewTabs = [
    {
      key: "notes",
      label: "Lesson Notes",
      title: "Create structured notes in minutes",
      description: "Pick class, strand, and sub-strand, then generate a classroom-ready lesson note aligned to the topic you are teaching.",
      icon: MenuBookIcon,
      accent: theme.palette.primary.main,
      details: ["NaCCA-aligned objectives", "Teaching steps and examples", "Export-ready teacher format"],
      stats: ["Basic 5 Science", "3 teaching steps", "Ready to share"],
      mockLabel: "Basic 5 Science • Living Things",
      mockRows: [
        { label: "Objectives", value: "3 ready" },
        { label: "Activities", value: "Guided + group work" },
        { label: "Assessment", value: "Exit ticket included" },
      ],
      progress: 92,
      footer: "Generated note ready for review and export",
    },
    {
      key: "quizzes",
      label: "Quiz Builder",
      title: "Build practice and assessment faster",
      description: "Generate topic-based quizzes with multiple question types so students can revise and teachers can check understanding quickly.",
      icon: QuizIcon,
      accent: theme.palette.secondary.main,
      details: ["Multiple choice and written items", "Topic-based question flow", "Immediate practice support"],
      stats: ["15 questions", "Auto-graded", "Revision-ready"],
      mockLabel: "Practice Quiz • Fractions",
      mockRows: [
        { label: "MCQ", value: "10 items" },
        { label: "Short answer", value: "3 prompts" },
        { label: "Essay", value: "2 reflection items" },
      ],
      progress: 78,
      footer: "Quiz set balanced for classwork and revision",
    },
    {
      key: "progress",
      label: "Student Progress",
      title: "Track where learners need support",
      description: "See how students are performing by topic and use the signals to guide revision, follow-up, and classroom support.",
      icon: QueryStatsIcon,
      accent: theme.palette.success.main,
      details: ["Topic-level performance view", "Progress snapshots", "Teacher-friendly summaries"],
      stats: ["78% mastery", "4 active topics", "2 learners need help"],
      mockLabel: "Class Snapshot • Basic 6 Mathematics",
      mockRows: [
        { label: "Mastery", value: "78%" },
        { label: "Needs support", value: "2 learners" },
        { label: "Strongest topic", value: "Decimals" },
      ],
      progress: 78,
      footer: "Teacher insight highlights where to revise next",
    },
    {
      key: "resources",
      label: "Resource Hub",
      title: "Keep notes, quizzes, and materials together",
      description: "Organize learning materials in one simple hub so teachers and students always know where to find the right content.",
      icon: Inventory2Icon,
      accent: theme.palette.warning.main,
      details: ["One place for learning assets", "Faster topic access", "Cleaner classroom workflow"],
      stats: ["12 resources", "Sorted by topic", "Easy student access"],
      mockLabel: "Shared Folder • JHS English",
      mockRows: [
        { label: "Lesson notes", value: "4 files" },
        { label: "Practice quizzes", value: "3 sets" },
        { label: "Student resources", value: "5 items" },
      ],
      progress: 88,
      footer: "Resources organized by topic for faster access",
    },
  ];

  const activeTab = previewTabs.find((tab) => tab.key === activePreview) || previewTabs[0];

  const renderPreviewSurface = (tab) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        borderRadius: 3,
        border: `1px solid ${alpha(tab.accent, 0.18)}`,
        bgcolor: alpha(tab.accent, 0.05),
      }}
    >
      <Stack spacing={1.6}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: tab.accent,
              color: "white",
            }}
          >
            <tab.icon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {tab.label}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              {tab.mockLabel}
            </Typography>
          </Box>
          <Chip
            label="Live"
            size="small"
            sx={{
              bgcolor: alpha(tab.accent, 0.12),
              color: tab.accent,
              fontWeight: 700,
            }}
          />
        </Stack>

        <Divider />

        <Grid container spacing={1.2}>
          {tab.mockRows.map((row) => (
            <Grid item xs={12} key={row.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: "#FFFFFF",
                  border: `1px solid ${alpha("#1E3A5F", 0.08)}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" sx={{ color: "#64748B" }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A", textAlign: "right" }}>
                    {row.value}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
              Workflow readiness
            </Typography>
            <Typography variant="caption" sx={{ color: tab.accent, fontWeight: 700 }}>
              {tab.progress}%
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: alpha(tab.accent, 0.12),
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${tab.progress}%`,
                height: "100%",
                borderRadius: 999,
                bgcolor: tab.accent,
              }}
            />
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 1.4,
            borderRadius: 2.5,
            bgcolor: alpha(tab.accent, 0.08),
            border: `1px dashed ${alpha(tab.accent, 0.35)}`,
          }}
        >
          <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600 }}>
            {tab.footer}
          </Typography>
        </Paper>
      </Stack>
    </Paper>
  );

  const trustMetrics = [
    { label: "Lesson Notes Generated", value: "12k+" },
    { label: "Quizzes Completed", value: "85k+" },
    { label: "Schools Reached", value: "160+" },
  ];

  const capabilities = [
    {
      icon: MenuBookIcon,
      title: "Create Lesson Notes",
      desc: "Generate structured lesson content quickly without losing curriculum focus.",
    },
    {
      icon: QuizIcon,
      title: "Build Better Quizzes",
      desc: "Create classroom quizzes faster and support student revision with less admin work.",
    },
    {
      icon: QueryStatsIcon,
      title: "Track Learning Progress",
      desc: "Review outcomes by topic so weak spots become visible earlier.",
    },
    {
      icon: Inventory2Icon,
      title: "Share Learning Resources",
      desc: "Keep notes, quizzes, and supporting materials organized in one place.",
    },
  ];

  const audiences = [
    {
      icon: WorkspacePremiumIcon,
      title: "For Teachers",
      desc: "Prepare lessons, create assessments, and manage teaching materials without switching between scattered tools.",
    },
    {
      icon: GroupsIcon,
      title: "For Students",
      desc: "Access notes, revise with quizzes, and follow a clearer learning path by topic and subject.",
    },
    {
      icon: SchoolIcon,
      title: "For Schools",
      desc: "Support consistent classroom delivery with a platform that gives structure across teachers and learners.",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Choose a class and topic",
      desc: "Start from the subject, strand, and sub-strand you want to teach or revise.",
    },
    {
      step: "02",
      title: "Generate and organize content",
      desc: "Create lesson notes, quizzes, and supporting resources from one focused workflow.",
    },
    {
      step: "03",
      title: "Teach, assess, and review",
      desc: "Use the results to guide practice, follow-up, and learner support.",
    },
  ];

  const reasons = [
    {
      title: "Curriculum-aware workflows",
      desc: "The platform is shaped around real teaching tasks, not generic document tools.",
    },
    {
      title: "Less repetitive preparation",
      desc: "Teachers spend less time formatting and more time focusing on learning outcomes.",
    },
    {
      title: "Clearer student support",
      desc: "Notes, practice, and progress work together so learners are easier to guide.",
    },
    {
      title: "One connected workspace",
      desc: "Lesson planning, quizzes, resources, and progress live in one system instead of many scattered files.",
    },
  ];

  const paths = [
    {
      title: "Teacher",
      subtitle: "For daily planning and classroom delivery",
      features: ["Lesson note generation", "Quiz creation", "Resource organization"],
      action: "Start as Teacher",
      route: "/register",
      featured: true,
    },
    {
      title: "Student",
      subtitle: "For revision, practice, and topic clarity",
      features: ["Study notes", "Quiz practice", "Clearer learning structure"],
      action: "See Student Flow",
      route: "/login",
    },
    {
      title: "School",
      subtitle: "For shared visibility across teaching teams",
      features: ["Coordinated classroom tools", "Consistency across teachers", "Scalable school use"],
      action: "Talk to Us",
      route: "/register",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: { xs: 10, md: 0 },
        background: "#F8FBFF",
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
                background: "#2563EB",
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
                  label="NaCCA-Aligned Teaching Platform"
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
                  Plan lessons faster.
                  <Box component="span" sx={{ color: "#2563EB" }}>
                    {" "}Build quizzes smarter.
                  </Box>
                  <Box component="span" sx={{ color: "#0B1324" }}>
                    {" "}Support every learner in one place.
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
                  Scholar&apos;s Path helps teachers prepare, assess, and guide learning with
                  curriculum-aligned tools designed for real classrooms.
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
                    Start Free
                  </Button>
                  <Button
                    onClick={() => window.scrollTo({ top: 820, behavior: "smooth" })}
                    variant="outlined"
                    size="large"
                    fullWidth={isMobile}
                    sx={{ px: 3.5, borderWidth: 2 }}
                  >
                    See How It Works
                  </Button>
                </Stack>
              </motion.div>

              <motion.div variants={reveal}>
                <Stack direction="row" spacing={1.4} alignItems="center" flexWrap="wrap" useFlexGap>
                  <CheckCircleIcon sx={{ color: "#10B981", fontSize: 20 }} />
                  <Typography variant="body2">Teacher-first workflow</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    •
                  </Typography>
                  <Typography variant="body2">Works on low bandwidth</Typography>
                  <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                    •
                  </Typography>
                  <Typography variant="body2">Curriculum-aligned structure</Typography>
                </Stack>
              </motion.div>

              <motion.div variants={reveal}>
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    bgcolor: alpha("#FFFFFF", 0.9),
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#475569", mb: 1.2 }}>
                    Used by teachers, schools, and learners across Ghana.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap>
                    <Chip label="NaCCA-aware content flow" size="small" />
                    <Chip label="Teacher-ready tools" size="small" />
                    <Chip label="Student-friendly access" size="small" />
                  </Stack>
                </Paper>
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
                  p: 0,
                  borderRadius: 4,
                  background: "#FFFFFF",
                  border: `1px solid ${alpha("#1E3A5F", 0.12)}`,
                  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    overflowX: "auto",
                    borderBottom: `1px solid ${alpha("#1E3A5F", 0.08)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  {previewTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activePreview === tab.key;
                    return (
                      <Button
                        key={tab.key}
                        onClick={() => setActivePreview(tab.key)}
                        startIcon={<Icon />}
                        sx={{
                          px: 2.2,
                          py: 1.8,
                          borderRadius: 0,
                          flexShrink: 0,
                          color: isActive ? "#0B1324" : "#64748B",
                          bgcolor: isActive ? "#FFFFFF" : "transparent",
                          borderBottom: isActive ? `2px solid ${tab.accent}` : "2px solid transparent",
                        }}
                      >
                        {tab.label}
                      </Button>
                    );
                  })}
                </Box>

                <Box sx={{ p: { xs: 2.2, md: 3 } }}>
                  <Stack spacing={2.2}>
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{ color: activeTab.accent, letterSpacing: "0.08em" }}
                      >
                        Product Preview
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.6, mb: 1 }}>
                        {activeTab.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#475569" }}>
                        {activeTab.description}
                      </Typography>
                    </Box>

                    {renderPreviewSurface(activeTab)}

                    <Grid container spacing={1.2}>
                      {activeTab.stats.map((stat) => (
                        <Grid item xs={4} key={stat}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.4,
                              borderRadius: 2.5,
                              textAlign: "center",
                              bgcolor: "#F8FAFC",
                              border: `1px solid ${alpha("#1E3A5F", 0.08)}`,
                              height: "100%",
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#0F172A" }}>
                              {stat}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
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
          Everything you need to move from planning to learning
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", color: "#475569", mb: 5, maxWidth: 760, mx: "auto" }}>
          Scholar&apos;s Path brings lesson preparation, assessment, and student support into one
          simple workspace built for everyday teaching.
        </Typography>
        <Grid container spacing={3}>
          {capabilities.map((item, i) => (
            <Grid item xs={12} sm={6} key={item.title}>
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
                  background: "#FFFFFF",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <item.icon sx={{ color: "#2563EB", fontSize: 34, mb: 1.2 }} />
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, fontSize: "1.3rem" }}>
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

      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
        <Typography
          variant="h3"
          sx={{ mb: 2, textAlign: "center", fontWeight: 800, fontSize: { xs: "1.7rem", sm: "2.1rem", md: "3rem" } }}
        >
          Built for every part of the learning journey
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", color: "#475569", mb: 5.5, maxWidth: 760, mx: "auto" }}>
          Teacher-first at the top, but structured to support students and schools with the same
          connected workflow.
        </Typography>
        <Grid container spacing={3}>
          {audiences.map((item, i) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 4,
                  border: `1px solid ${alpha("#1E3A5F", 0.12)}`,
                  background: "#FFFFFF",
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  <item.icon />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.1, fontSize: "1.3rem" }}>
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

      <Box sx={{ py: { xs: 8, md: 10 }, background: "#EEF4FF" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ mb: 2, textAlign: "center", fontWeight: 800, fontSize: { xs: "1.7rem", sm: "2.1rem", md: "3rem" } }}
          >
            How It Works
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 5.5, color: "#475569" }}>
            One focused flow from classroom preparation to learner support.
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
            background: alpha("#2563EB", 0.1),
          }}
        >
          <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.9rem", md: "2.125rem" } }}>
            Why schools and teachers choose Scholar&apos;s Path
          </Typography>
          <Typography variant="body1" sx={{ color: "#334155", maxWidth: 860, mx: "auto", mb: 3.5 }}>
            The platform is designed around what teachers actually need to do each week: plan,
            assess, organize, and respond to learning progress without unnecessary complexity.
          </Typography>
          <Grid container spacing={1.4}>
            {reasons.map((reason) => (
              <Grid item xs={12} sm={6} key={reason.title}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha("#1E3A5F", 0.08)}`,
                    bgcolor: alpha("#FFFFFF", 0.7),
                    textAlign: "left",
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {reason.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#475569" }}>
                    {reason.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 11 } }}>
        <Typography
          variant="h3"
          sx={{ mb: 2, textAlign: "center", fontWeight: 800, fontSize: { xs: "1.7rem", sm: "2.1rem", md: "3rem" } }}
        >
          Start with the tools that matter most
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", color: "#475569", mb: 5 }}>
          Choose the path that matches how Scholar&apos;s Path fits into your learning environment.
        </Typography>

        <Grid container spacing={3}>
          {paths.map((path, i) => (
            <Grid item xs={12} md={4} key={path.title}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: path.featured
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${alpha("#1E3A5F", 0.12)}`,
                  background: path.featured ? alpha(theme.palette.primary.main, 0.04) : "#FFFFFF",
                  position: "relative",
                }}
              >
                {path.featured && (
                  <Chip
                    label="BEST PLACE TO START"
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
                    {path.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B", mt: 1, mb: 2.2 }}>
                    {path.subtitle}
                  </Typography>

                  <Stack spacing={1.1} sx={{ mb: 2.8 }}>
                    {path.features.map((feature) => (
                      <Box key={feature} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleIcon sx={{ color: "#10B981", fontSize: 18 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    variant={path.featured ? "contained" : "outlined"}
                    component={RouterLink}
                    to={path.route}
                  >
                    {path.action}
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
            background: "#1E3A5F",
            color: "white",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.2, fontSize: { xs: "1.5rem", sm: "1.9rem", md: "2.125rem" } }}>
            Bring lesson planning, assessment, and learner support together
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, mb: 3 }}>
            Scholar&apos;s Path gives teachers and schools a simpler way to prepare, teach, and guide learning with confidence.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} justifyContent="center">
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
              Start Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/register"
              sx={{
                color: "white",
                borderColor: alpha("#FFFFFF", 0.4),
                "&:hover": { borderColor: "white", bgcolor: alpha("#FFFFFF", 0.08) },
              }}
            >
              Talk to Us
            </Button>
          </Stack>
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
          Start Free
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
