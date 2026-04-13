import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
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

const sectionTitleSx = {
  mb: { xs: 1.5, md: 2 },
  textAlign: "center",
  fontWeight: 800,
  fontSize: { xs: "1.6rem", sm: "2rem", md: "2.6rem" },
  lineHeight: 1.15,
  letterSpacing: "-0.01em",
  color: "#2E3A44",
};

const sectionIntroSx = {
  textAlign: "center",
  color: "#5D6A75",
  maxWidth: 760,
  mx: "auto",
  mb: { xs: 4, md: 5.2 },
  fontSize: { xs: "1rem", md: "1.05rem" },
  lineHeight: 1.7,
};

const COPY_VARIANTS = {
  A: {
    badge: "NaCCA-Aligned Teaching Platform",
    h1Start: "Plan lessons faster.",
    h1Accent: "Build quizzes smarter.",
    h1End: "Support every learner in one place.",
    heroSubtext:
      "Curriculum-aligned tools for planning, assessment, and learner support.",
    primaryCta: "Get Started Free",
    secondaryCta: "View Product Tour",
    ctaHelper: "Free to start • Fast setup",
  },
  B: {
    badge: "Classroom-Ready Learning Platform",
    h1Start: "Prepare class content faster.",
    h1Accent: "Assess learning with confidence.",
    h1End: "Keep teaching and progress in one workflow.",
    heroSubtext:
      "A simpler teaching workflow for planning, assessment, and student progress.",
    primaryCta: "Start Free Today",
    secondaryCta: "See It In Action",
    ctaHelper: "Free to start • Built for classrooms",
  },
};

const AnimatedFlowGraphic = () => (
  <Box
    sx={{
      p: { xs: 2.2, md: 2.8 },
      borderRadius: 4,
      background: alpha("#FFFFFF", 0.72),
      border: `1px solid ${alpha("#4F6678", 0.12)}`,
      minHeight: 300,
      display: "grid",
      placeItems: "center",
    }}
  >
    <motion.svg viewBox="0 0 420 250" width="100%" height="100%">
      <motion.path
        d="M52 172 C110 82, 164 82, 208 126 S304 198, 368 82"
        fill="none"
        stroke="#A7BBCB"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="10 14"
        animate={{ strokeDashoffset: [0, -96] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
      />

      {[
        { x: 56, y: 172, label: "Plan", color: "#6F889D", delay: 0 },
        { x: 204, y: 126, label: "Assess", color: "#D28B4D", delay: 0.2 },
        { x: 364, y: 82, label: "Support", color: "#10B981", delay: 0.4 },
      ].map((node) => (
        <motion.g
          key={node.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: node.delay, duration: 0.45 }}
          animate={{ y: [0, -6, 0] }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        >
          <circle cx={node.x} cy={node.y} r="28" fill={node.color} />
          <circle cx={node.x} cy={node.y} r="38" fill={alpha(node.color, 0.14)} />
          <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">
            {node.label}
          </text>
        </motion.g>
      ))}

      <motion.rect
        x="120"
        y="176"
        width="184"
        height="34"
        rx="17"
        fill="#FFFFFF"
        animate={{ y: [176, 168, 176] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <text x="212" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4F6678">
        One connected workflow
      </text>
    </motion.svg>
  </Box>
);

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const [activePreview, setActivePreview] = useState("notes");
  const [isPreviewPaused, setIsPreviewPaused] = useState(false);
  const [manualPauseUntil, setManualPauseUntil] = useState(0);

  const ACTIVE_COPY = useMemo(() => {
    const queryValue = new URLSearchParams(location.search).get("copy");
    if (queryValue === "A" || queryValue === "B") return queryValue;
    return "B";
  }, [location.search]);
  const copy = COPY_VARIANTS[ACTIVE_COPY];

  const handleGetStarted = () => navigate("/register");
  const handleLogin = () => navigate("/login");
  const scrollToHowItWorks = () => {
    const section = document.getElementById("how-it-works");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
  const previewTabKeys = useMemo(() => previewTabs.map((tab) => tab.key), [previewTabs]);

  useEffect(() => {
    if (isPreviewPaused) return undefined;

    const interval = setInterval(() => {
      setActivePreview((prev) => {
        const idx = previewTabKeys.indexOf(prev);
        const nextIdx = idx === -1 ? 0 : (idx + 1) % previewTabKeys.length;
        return previewTabKeys[nextIdx];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPreviewPaused, previewTabKeys]);

  useEffect(() => {
    if (!manualPauseUntil) return undefined;

    const timeout = setTimeout(() => {
      setIsPreviewPaused(false);
      setManualPauseUntil(0);
    }, Math.max(manualPauseUntil - Date.now(), 0));

    return () => clearTimeout(timeout);
  }, [manualPauseUntil]);

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
            <Typography variant="body2" sx={{ color: "#7A8794" }}>
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
                  border: `1px solid ${alpha("#4F6678", 0.08)}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" sx={{ color: "#7A8794" }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E3A44", textAlign: "right" }}>
                    {row.value}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
            <Typography variant="caption" sx={{ color: "#7A8794", fontWeight: 600 }}>
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
          <Typography variant="body2" sx={{ color: "#4C5C68", fontWeight: 600 }}>
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
      desc: "Generate structured lesson content fast.",
    },
    {
      icon: QuizIcon,
      title: "Build Better Quizzes",
      desc: "Create quizzes faster with less admin work.",
    },
    {
      icon: QueryStatsIcon,
      title: "Track Learning Progress",
      desc: "See weak spots by topic earlier.",
    },
    {
      icon: Inventory2Icon,
      title: "Share Learning Resources",
      desc: "Keep notes and resources in one place.",
    },
  ];

  const audiences = [
    {
      icon: WorkspacePremiumIcon,
      title: "For Teachers",
      desc: "Plan, assess, and organize from one workspace.",
    },
    {
      icon: GroupsIcon,
      title: "For Students",
      desc: "Revise with notes and quizzes by topic.",
    },
    {
      icon: SchoolIcon,
      title: "For Schools",
      desc: "Create more consistent teaching across classes.",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Choose a class and topic",
      desc: "Pick the lesson focus.",
    },
    {
      step: "02",
      title: "Generate and organize content",
      desc: "Create notes, quizzes, and materials.",
    },
    {
      step: "03",
      title: "Teach, assess, and review",
      desc: "Use results to guide next steps.",
    },
  ];

  const reasons = [
    {
      title: "Curriculum-aware workflows",
      desc: "Built around real teaching tasks.",
    },
    {
      title: "Less repetitive preparation",
      desc: "Less formatting, more teaching time.",
    },
    {
      title: "Clearer student support",
      desc: "Notes, practice, and progress stay connected.",
    },
    {
      title: "One connected workspace",
      desc: "Planning, quizzes, resources, and progress in one place.",
    },
  ];

  const paths = [
    {
      title: "Teacher",
      subtitle: "For daily planning and classroom delivery",
      features: ["Lesson note generation", "Quiz creation", "Resource organization"],
      action: "Get Started Free",
      route: "/register",
      featured: true,
    },
    {
      title: "Student",
      subtitle: "For revision, practice, and topic clarity",
      features: ["Study notes", "Quiz practice", "Clearer learning structure"],
      action: "Explore Student View",
      route: "/login",
    },
    {
      title: "School",
      subtitle: "For shared visibility across teaching teams",
      features: ["Coordinated classroom tools", "Consistency across teachers", "Scalable school use"],
      action: "Book a Demo",
      route: "/register",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: { xs: 10, md: 0 },
        background: "#F4F1EA",
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
                background: "#6F889D",
              }}
            >
              <SchoolIcon sx={{ color: "white", fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#2E3A44" }}>
              Scholar&apos;s Path
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button onClick={handleLogin} variant="text" sx={{ px: 1.5, display: { xs: "none", sm: "inline-flex" } }}>
              Login
            </Button>
            <Button onClick={handleGetStarted} variant="contained" size={isMobile ? "medium" : "large"} endIcon={<ArrowForwardIcon />}>
              {copy.primaryCta}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          position: "relative",
          backgroundImage: "url(/header.png)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(12,22,32,0.88) 0%, rgba(12,22,32,0.88) 46%, rgba(8,16,24,0.70) 100%)",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 5.5, md: 8.5 }, position: "relative", zIndex: 1 }}>
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.div variants={reveal}>
                <Chip
                  label={copy.badge}
                  sx={{
                    mb: 2,
                    bgcolor: alpha("#FFFFFF", 0.15),
                    color: "white",
                    fontWeight: 700,
                  }}
                />
              </motion.div>

              <motion.div variants={reveal}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "1.95rem", sm: "2.3rem", md: "3.25rem" },
                    lineHeight: 1.08,
                    mb: 2.2,
                    color: "white",
                    textWrap: "balance",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {copy.h1Start}
                  <Box component="span" sx={{ color: "#A8C6D8" }}>
                    {" "}{copy.h1Accent}
                  </Box>
                  <Box component="span" sx={{ color: "white" }}>
                    {" "}{copy.h1End}
                  </Box>
                </Typography>
              </motion.div>

              <motion.div variants={reveal}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "rgba(255,255,255,0.85)",
                    maxWidth: 560,
                    mb: 3.2,
                    fontSize: { xs: "1rem", md: "1.08rem" },
                    lineHeight: 1.7,
                  }}
                >
                  {copy.heroSubtext}
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
                    {copy.primaryCta}
                  </Button>
                  <Button
                    onClick={scrollToHowItWorks}
                    variant="outlined"
                    size="large"
                    fullWidth={isMobile}
                    sx={{ px: 3.5, borderWidth: 2, color: "white", borderColor: "rgba(255,255,255,0.5)", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" } }}
                  >
                    {copy.secondaryCta}
                  </Button>
                </Stack>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", display: "block", mt: 1.1, textAlign: { xs: "center", sm: "left" } }}>
                  {copy.ctaHelper}
                </Typography>
              </motion.div>

              <motion.div variants={reveal}>
                <Stack direction="row" spacing={1.4} alignItems="center" flexWrap="wrap" useFlexGap>
                  <CheckCircleIcon sx={{ color: "#34D399", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "white" }}>Teacher-first workflow</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)" }}>
                    •
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>Works on low bandwidth</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)" }}>
                    •
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>Curriculum-aligned structure</Typography>
                </Stack>
              </motion.div>

            </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 5, md: 7 }, mt: { xs: -2, md: -5 }, position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
              <Paper
                elevation={0}
                sx={{
                  p: 0,
                  borderRadius: 4,
                  background: "#FFFFFF",
                  border: `1px solid ${alpha("#4F6678", 0.12)}`,
                  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    overflowX: "auto",
                    borderBottom: `1px solid ${alpha("#4F6678", 0.08)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                  onMouseEnter={() => setIsPreviewPaused(true)}
                  onMouseLeave={() => {
                    if (!manualPauseUntil) {
                      setIsPreviewPaused(false);
                    }
                  }}
                >
                  {previewTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activePreview === tab.key;
                    return (
                      <Button
                        key={tab.key}
                        onClick={() => {
                          setActivePreview(tab.key);
                          setIsPreviewPaused(true);
                          setManualPauseUntil(Date.now() + 10000);
                        }}
                        startIcon={<Icon />}
                        sx={{
                          px: 2.2,
                          py: 1.8,
                          borderRadius: 0,
                          flexShrink: 0,
                          color: isActive ? "#2E3A44" : "#7A8794",
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
                      <Typography variant="body1" sx={{ color: "#5D6A75" }}>
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
                              border: `1px solid ${alpha("#4F6678", 0.08)}`,
                              height: "100%",
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#2E3A44" }}>
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
                      p: { xs: 2.1, md: 2.4 },
                      borderRadius: 3,
                      bgcolor: alpha("#FFFFFF", 0.85),
                      border: `1px solid ${alpha("#4F6678", 0.1)}`,
                      textAlign: "center",
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: "1.8rem", color: "#4F6678" }}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#5D6A75" }}>
                      {item.label}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 7.5, md: 10.5 } }}>
        <Typography variant="h3" sx={sectionTitleSx}>
          From planning to progress
        </Typography>
        <Typography variant="subtitle1" sx={sectionIntroSx}>
          Lesson prep, assessment, and learner support in one workspace.
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
                  border: `1px solid ${alpha("#4F6678", 0.1)}`,
                  background: "#FFFFFF",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <item.icon sx={{ color: "#6F889D", fontSize: 34, mb: 1.2 }} />
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, fontSize: "1.3rem" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#5D6A75" }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 7.5, md: 10 } }}>
        <Typography variant="h3" sx={sectionTitleSx}>
          Built for teachers, students, and schools
        </Typography>
        <Typography variant="subtitle1" sx={sectionIntroSx}>
          One platform, shaped for each role.
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
                  border: `1px solid ${alpha("#4F6678", 0.12)}`,
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
                <Typography variant="body1" sx={{ color: "#5D6A75" }}>
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box id="how-it-works" sx={{ py: { xs: 7.5, md: 9.5 }, background: "#ECE5D8" }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={sectionTitleSx}>
            How It Works
          </Typography>
          <Typography variant="subtitle1" sx={sectionIntroSx}>
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
                    border: `1px solid ${alpha("#4F6678", 0.12)}`,
                    background: alpha("#FFFFFF", 0.92),
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#6F889D",
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
                  <Typography variant="body1" sx={{ color: "#5D6A75" }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7.5, md: 9.5 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: `1px solid ${alpha("#4F6678", 0.14)}`,
            background: alpha("#6F889D", 0.1),
          }}
        >
          <Grid container spacing={3.2} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="h4" sx={{ mb: 1.4, fontWeight: 800, fontSize: { xs: "1.45rem", sm: "1.8rem", md: "2rem" } }}>
                Less reading. More movement.
              </Typography>
              <Typography variant="body1" sx={{ color: "#4C5C68", mb: 2.6, lineHeight: 1.65, maxWidth: 520 }}>
                Scholar&apos;s Path keeps the workflow simple: plan, assess, and support learners from one clear system.
              </Typography>
              <Stack spacing={1.2}>
                {reasons.map((reason) => (
                  <Paper
                    key={reason.title}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: `1px solid ${alpha("#4F6678", 0.08)}`,
                      bgcolor: alpha("#FFFFFF", 0.72),
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.2 }}>
                      {reason.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#5D6A75" }}>
                      {reason.desc}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <AnimatedFlowGraphic />
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 7.5, md: 10.5 } }}>
        <Typography variant="h3" sx={sectionTitleSx}>
          Start with the tools that matter most
        </Typography>
        <Typography variant="subtitle1" sx={sectionIntroSx}>
          Choose the path that fits your role.
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
                    : `1px solid ${alpha("#4F6678", 0.12)}`,
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
                      bgcolor: "#6F889D",
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
                  <Typography variant="body2" sx={{ color: "#7A8794", mt: 1, mb: 2.2 }}>
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

      <Container maxWidth="md" sx={{ pb: { xs: 7.5, md: 11 } }}>
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
            background: "#4F6678",
            color: "white",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.3, fontSize: { xs: "1.45rem", sm: "1.8rem", md: "2.05rem" }, lineHeight: 1.2 }}>
            Bring lesson planning, assessment, and learner support together
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, mb: 3, lineHeight: 1.7 }}>
            A simpler way to prepare, teach, and guide learning.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: "white",
                color: "#4F6678",
                px: 3.2,
                "&:hover": { bgcolor: alpha("#FFFFFF", 0.92) },
              }}
            >
              {copy.primaryCta}
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
              Book a Demo
            </Button>
          </Stack>
        </Paper>
      </Container>

      <Box
        sx={{
          borderTop: `1px solid ${alpha("#4F6678", 0.08)}`,
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
            <Typography variant="body2" sx={{ color: "#7A8794" }}>
              © {new Date().getFullYear()} Scholar&apos;s Path
            </Typography>
            <Stack direction="row" spacing={2.2}>
              <Button size="small" component={RouterLink} to="/register" sx={{ color: "#7A8794" }}>
                Privacy
              </Button>
              <Button size="small" component={RouterLink} to="/register" sx={{ color: "#7A8794" }}>
                Terms
              </Button>
              <Button size="small" component={RouterLink} to="/login" sx={{ color: "#7A8794" }}>
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
          display: { xs: "block", lg: "none" },
          px: 1.5,
          py: 1,
          bgcolor: alpha("#FFFFFF", 0.88),
          backdropFilter: "blur(10px)",
          borderTop: `1px solid ${alpha("#4F6678", 0.14)}`,
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
          {copy.primaryCta}
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
