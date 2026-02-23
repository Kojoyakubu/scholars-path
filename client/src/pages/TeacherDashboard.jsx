// /client/src/pages/TeacherDashboard.jsx
// 🔥 MINIMAL PROGRESSIVE WORKFLOW VERSION

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// Redux & Components
import { syncUserFromStorage } from '../features/auth/authSlice';
import {
  fetchItems,
  fetchChildren,
  clearChildren,
} from '../features/curriculum/curriculumSlice';
import {
  generateLessonNote,
  getMyLessonNotes,
  deleteLessonNote,
  generateLearnerNote,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote as deleteDraftLearnerNote,
  resetTeacherState,
  getMyBundles,
  generateAiQuiz,
  getTeacherAnalytics,
  generateLessonBundle,
} from '../features/teacher/teacherSlice';

import LessonNoteForm from '../components/LessonNoteForm';
import AiQuizForm from '../components/AiQuizForm';
import LessonBundleForm from '../components/LessonBundleForm';
import BundleResultViewer from '../components/BundleResultViewer';
import BundleManager from '../components/BundleManager';
import PolishedStatCard from '../components/Polishedstatcard';
import DashboardBanner from '../components/DashboardBanner';

// MUI
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Avatar,
  useTheme,
  alpha,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';

// Icons
import {
  Article,
  Delete,
  CheckCircle,
  Quiz,
  AutoAwesome,
  School,
  Folder,
  Refresh,
} from '@mui/icons-material';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function TeacherDashboard() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useSelector((state) => state.auth || {});
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { lessonNotes, draftLearnerNotes, isLoading, teacherAnalytics, bundleResult } =
    useSelector((state) => state.teacher);

  const [selections, setSelections] = useState({
    level: '',
    class: '',
    subject: '',
    strand: '',
    subStrand: '',
  });

  const [workflowStep, setWorkflowStep] = useState(1);

  const [activeTab, setActiveTab] = useState(parseInt(searchParams.get('tab')) || 0);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [viewBundleResult, setViewBundleResult] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    dispatch(syncUserFromStorage());
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
    dispatch(getTeacherAnalytics());
    dispatch(getMyBundles());
    return () => dispatch(resetTeacherState());
  }, [dispatch]);

  // Fetch children automatically
  useEffect(() => {
    if (selections.level)
      dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level }));
  }, [selections.level, dispatch]);

  useEffect(() => {
    if (selections.class)
      dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class }));
  }, [selections.class, dispatch]);

  useEffect(() => {
    if (selections.subject)
      dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject }));
  }, [selections.subject, dispatch]);

  useEffect(() => {
    if (selections.strand)
      dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand }));
  }, [selections.strand, dispatch]);

  const handleSelectionChange = useCallback(
    (field, value) => {
      setSelections((prev) => {
        const next = { ...prev, [field]: value };

        const resetMap = {
          level: ['class', 'subject', 'strand', 'subStrand'],
          class: ['subject', 'strand', 'subStrand'],
          subject: ['strand', 'subStrand'],
          strand: ['subStrand'],
        };

        if (resetMap[field]) {
          resetMap[field].forEach((k) => (next[k] = ''));
          dispatch(clearChildren({ entities: resetMap[field] }));
        }

        return next;
      });

      const stepMap = {
        level: 2,
        class: 3,
        subject: 4,
        strand: 5,
        subStrand: 6,
      };

      setWorkflowStep(stepMap[field]);
    },
    [dispatch]
  );

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setSearchParams({ tab: newValue }, { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <Box sx={{ width: '98%', mx: '1%', mt: 1, pb: 2 }}>

        <DashboardBanner user={user} role="teacher" stats={[]} />

        <Paper elevation={0} sx={{ borderRadius: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Create New" />
            <Tab label="My Lesson Notes" />
            <Tab label="Draft Learner Notes" />
            <Tab label="My Bundles" />
          </Tabs>

          {/* ================= CREATE NEW TAB ================= */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 3 }}>

              {/* Progress */}
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {['Level', 'Class', 'Subject', 'Strand', 'Substrand'].map((label, index) => (
                  <Chip
                    key={label}
                    label={label}
                    color={workflowStep > index + 1 ? 'success' : 'default'}
                    icon={workflowStep > index + 1 ? <CheckCircle /> : null}
                  />
                ))}
              </Stack>

              {/* Step 1 */}
              {workflowStep >= 1 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {(levels || []).map((level) => (
                    <Grid item xs={12} sm={6} md={4} key={level._id}>
                      <Button
                        fullWidth
                        variant={selections.level === level._id ? 'contained' : 'outlined'}
                        onClick={() => handleSelectionChange('level', level._id)}
                      >
                        {level.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Step 2 */}
              {workflowStep >= 2 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {(classes || []).map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <Button
                        fullWidth
                        variant={selections.class === item._id ? 'contained' : 'outlined'}
                        onClick={() => handleSelectionChange('class', item._id)}
                      >
                        {item.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Step 3 */}
              {workflowStep >= 3 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {(subjects || []).map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <Button
                        fullWidth
                        variant={selections.subject === item._id ? 'contained' : 'outlined'}
                        onClick={() => handleSelectionChange('subject', item._id)}
                      >
                        {item.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Step 4 */}
              {workflowStep >= 4 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {(strands || []).map((item) => (
                    <Grid item xs={12} sm={6} key={item._id}>
                      <Button
                        fullWidth
                        variant={selections.strand === item._id ? 'contained' : 'outlined'}
                        onClick={() => handleSelectionChange('strand', item._id)}
                      >
                        {item.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Step 5 */}
              {workflowStep >= 5 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {(subStrands || []).map((item) => (
                    <Grid item xs={12} sm={6} key={item._id}>
                      <Button
                        fullWidth
                        variant={selections.subStrand === item._id ? 'contained' : 'outlined'}
                        onClick={() => handleSelectionChange('subStrand', item._id)}
                      >
                        {item.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Final Actions */}
              {workflowStep === 6 && (
                <Stack spacing={2}>
                  <Button variant="contained" startIcon={<Article />} onClick={() => setIsNoteModalOpen(true)}>
                    Generate Lesson Note
                  </Button>

                  <Button variant="contained" color="warning" startIcon={<Quiz />} onClick={() => setIsAiQuizModalOpen(true)}>
                    Generate AI Quiz
                  </Button>

                  <Button variant="contained" color="secondary" startIcon={<AutoAwesome />} onClick={() => setIsBundleModalOpen(true)}>
                    Generate Complete Bundle
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => {
                      setSelections({ level: '', class: '', subject: '', strand: '', subStrand: '' });
                      setWorkflowStep(1);
                    }}
                  >
                    Start Over
                  </Button>
                </Stack>
              )}
            </Box>
          </TabPanel>

        </Paper>

        {/* Modals */}
        <LessonNoteForm
          open={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSubmit={(data) => dispatch(generateLessonNote({ ...data, subStrandId: selections.subStrand }))}
          isLoading={isLoading}
        />

        <AiQuizForm
          open={isAiQuizModalOpen}
          onClose={() => setIsAiQuizModalOpen(false)}
          onSubmit={(data) => dispatch(generateAiQuiz(data))}
          isLoading={isLoading}
        />

        <LessonBundleForm
          open={isBundleModalOpen}
          onClose={() => setIsBundleModalOpen(false)}
          onSubmit={(data) => dispatch(generateLessonBundle(data))}
          subStrandId={selections.subStrand}
          isLoading={isLoading}
        />

        <BundleResultViewer
          open={viewBundleResult}
          onClose={() => setViewBundleResult(false)}
          bundleData={bundleResult}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

      </Box>
    </Box>
  );
}

export default TeacherDashboard;