import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

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
  generateLearnerNoteFromStrand,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote as deleteDraftLearnerNote,
  resetTeacherState,
  getMyBundles,
  getTeacherAnalytics,
  generateLessonBundle,
  generateAiQuiz,
  getMyQuizzes,
  deleteQuiz,
  getQuizById,
} from '../features/teacher/teacherSlice';

// utilities for image extraction & fetching
import { segmentHtmlWithImages, removeImageBlocks } from '../utils/imageExtractor';
import { fetchImageForQuery } from '../services/imageService';
import LessonBundleForm from '../components/LessonBundleForm'; 
import BundleResultViewer from '../components/BundleResultViewer';
import DashboardBanner from '../components/DashboardBanner';
import CurriculumSelection from '../components/CurriculumSelection';
import LessonNoteForm from '../components/LessonNoteForm';
import LessonNotePickerDialog from '../components/LessonNotePickerDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import AnalyticsDialog from '../components/AnalyticsDialog';
import NotePreviewDialog from '../components/NotePreviewDialog';

// MUI Imports
import {
  Box,
  Typography,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Stack,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Chip,
  TextField,
  Checkbox,
} from '@mui/material';

// Icon Imports
import {
  Article,
  FaceRetouchingNatural,
  Quiz,
  School,
  OpenInFull,
  CloseFullscreen,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const INITIAL_SELECTIONS = { level: '', class: '', subject: '', strand: '', subStrand: '' };
const INITIAL_STRAND_FORM = {
  term: '',
  week: '',
  dayDate: '',
  duration: '',
  classSize: '',
  contentStandardCode: '',
  indicatorCodes: '',
  reference: '',
  preferredProvider: '',
  preferredModel: '',
};

/* ── shared style tokens (module-scope, stable references) ─────────────── */

const overviewCardSx = {
  p: 2.25,
  minHeight: 184,
  borderRadius: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  border: '1px solid',
  transition: 'transform 0.22s ease, box-shadow 0.22s ease',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
};

const toolTileSx = {
  height: '100%',
  p: 2,
  borderRadius: 3,
  textAlign: 'center',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  boxShadow: 1,
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4, borderColor: 'primary.main' },
};

const toolImageSx = {
  width: 120,
  height: 120,
  margin: '0 auto 14px',
  borderRadius: 2,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  boxShadow: 2,
};

const dialogBodySx = {
  overflowY: 'auto',
  bgcolor: 'background.default',
  py: 2,
};

const dialogFilterPanelSx = {
  mb: 2,
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
};

const dialogListCardSx = {
  mb: 1.5,
  p: 1.5,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 0,
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
};

const selectableListItemSx = {
  alignItems: 'flex-start',
  borderRadius: 1.5,
  mx: 0.75,
  my: 0.4,
  '&.Mui-selected': { bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.main' },
  '&.Mui-selected:hover': { bgcolor: 'primary.100' },
};

/* ── small shared sub-components ────────────────────────────────────────── */

function DialogTitleWithFullscreen({ title, isFullscreen, onToggle }) {
  return (
    <DialogTitle sx={{ pb: 1.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
          <IconButton size="small" onClick={onToggle}>
            {isFullscreen ? <CloseFullscreen fontSize="small" /> : <OpenInFull fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </DialogTitle>
  );
}

function ToolTile({ label, imageUrl, onClick, toolTileSx, toolImageSx }) {
  return (
    <Grid item xs={6} sm={3}>
      <Paper onClick={onClick} sx={toolTileSx}>
        <Box sx={{ ...toolImageSx, backgroundImage: `url('${imageUrl}')` }} />
        <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center', color: 'text.primary' }}>
          {label}
        </Typography>
      </Paper>
    </Grid>
  );
}

function TeacherDashboard() {
  const dispatch = useDispatch();

  // Redux state
  const { user } = useSelector((state) => state.auth || {});
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const {
    lessonNotes,
    draftLearnerNotes,
    quizzes,
    bundles,
    currentQuiz,
    isLoading,
    teacherAnalytics,
    bundleResult
  } = useSelector((state) => state.teacher);


  // Local state
  const [selections, setSelections] = useState(INITIAL_SELECTIONS);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [previewSegments, setPreviewSegments] = useState([]);
  const [selectedLessonForLearner, setSelectedLessonForLearner] = useState('');
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState('');
  const [quizSelectedSubStrands, setQuizSelectedSubStrands] = useState([]);
  const [notesClassFilter, setNotesClassFilter] = useState('');
  const [notesSubjectFilter, setNotesSubjectFilter] = useState('');
  const [learnerNotesClassFilter, setLearnerNotesClassFilter] = useState('');
  const [learnerNotesSubjectFilter, setLearnerNotesSubjectFilter] = useState('');
  const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState(null);
  const [strandForm, setStrandForm] = useState(INITIAL_STRAND_FORM);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [learnerNoteToDelete, setLearnerNoteToDelete] = useState(null);

  // View state
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateTools, setShowCreateTools] = useState(false);
  const planLoading = false;
  const [dialogFullscreen, setDialogFullscreen] = useState({});

  // Single dialog state — replaces 16 boolean flags
  // Keys: 'plan' | 'bundleSelector' | 'bundleModal' | 'bundleResult' | 'noteForm'
  //       | 'learnerOptions' | 'learnerFromLesson' | 'learnerFromStrand'
  //       | 'quizOptions' | 'quizFromLesson' | 'quizFromStrand'
  //       | 'myLessonNotes' | 'myLearnerNotes' | 'myQuizzes' | 'quizView' | 'analytics'
  const [activeDialog, setActiveDialog] = useState(null);
  const closeDialog = useCallback(() => setActiveDialog(null), []);

  const overviewCards = [
    {
      key: 'lesson-notes',
      value: lessonNotes?.length || 0,
      label: 'LESSON NOTES',
      subtitle: 'Published notes',
      palette: 'primary',
      Icon: Article,
    },
    {
      key: 'draft-notes',
      value: draftLearnerNotes?.length || 0,
      label: 'DRAFT NOTES',
      subtitle: 'Pending review',
      palette: 'secondary',
      Icon: FaceRetouchingNatural,
    },
    {
      key: 'ai-quizzes',
      value: teacherAnalytics?.totalQuizzes || 0,
      label: 'AI QUIZZES',
      subtitle: 'Total generated',
      palette: 'warning',
      Icon: Quiz,
    },
    {
      key: 'students-reached',
      value: teacherAnalytics?.totalStudents || 0,
      label: 'STUDENTS REACHED',
      subtitle: 'Across all classes',
      palette: 'success',
      Icon: School,
    },
  ];

  const isDialogFullscreen = useCallback((dialogKey) => !!dialogFullscreen[dialogKey], [dialogFullscreen]);
  const toggleDialogFullscreen = useCallback((dialogKey) => {
    setDialogFullscreen((prev) => ({ ...prev, [dialogKey]: !prev[dialogKey] }));
  }, []);

  const resetSelections = useCallback(() => {
    setSelections(INITIAL_SELECTIONS);
  }, []);

  const resetStrandForm = useCallback(() => {
    setStrandForm(INITIAL_STRAND_FORM);
  }, []);

  const lessonNoteClassOptions = useMemo(() => {
    const classMap = new Map();
    (lessonNotes || []).forEach((note) => {
      const classObj = note?.subStrand?.strand?.subject?.class;
      const classId = classObj?._id || classObj?.name;
      const className = classObj?.name;
      if (classId && className && !classMap.has(String(classId))) {
        classMap.set(String(classId), { id: String(classId), name: className });
      }
    });
    return Array.from(classMap.values()).sort((first, second) => first.name.localeCompare(second.name));
  }, [lessonNotes]);

  const lessonNoteSubjectOptions = useMemo(() => {
    if (!notesClassFilter) return [];
    const subjectMap = new Map();
    (lessonNotes || []).forEach((note) => {
      const classObj = note?.subStrand?.strand?.subject?.class;
      const noteClassId = classObj?._id || classObj?.name;
      if (String(noteClassId) !== String(notesClassFilter)) return;

      const subjectObj = note?.subStrand?.strand?.subject;
      const subjectId = subjectObj?._id || subjectObj?.name;
      const subjectName = subjectObj?.name;
      if (subjectId && subjectName && !subjectMap.has(String(subjectId))) {
        subjectMap.set(String(subjectId), { id: String(subjectId), name: subjectName });
      }
    });
    return Array.from(subjectMap.values()).sort((first, second) => first.name.localeCompare(second.name));
  }, [lessonNotes, notesClassFilter]);

  const lessonNotesBySelection = useMemo(() => {
    if (!notesClassFilter || !notesSubjectFilter) return [];
    return (lessonNotes || []).filter((note) => {
      const classObj = note?.subStrand?.strand?.subject?.class;
      const subjectObj = note?.subStrand?.strand?.subject;
      const noteClassId = classObj?._id || classObj?.name;
      const noteSubjectId = subjectObj?._id || subjectObj?.name;
      return String(noteClassId) === String(notesClassFilter)
        && String(noteSubjectId) === String(notesSubjectFilter);
    });
  }, [lessonNotes, notesClassFilter, notesSubjectFilter]);

  const draftMetaBySubStrandId = useMemo(() => {
    const metaMap = new Map();
    (lessonNotes || []).forEach((note) => {
      const subStrandId = note?.subStrand?._id || note?.subStrand;
      const classObj = note?.subStrand?.strand?.subject?.class;
      const subjectObj = note?.subStrand?.strand?.subject;
      if (!subStrandId || !classObj?.name || !subjectObj?.name) return;
      metaMap.set(String(subStrandId), {
        classId: String(classObj?._id || classObj?.name),
        className: classObj?.name,
        subjectId: String(subjectObj?._id || subjectObj?.name),
        subjectName: subjectObj?.name,
      });
    });
    return metaMap;
  }, [lessonNotes]);

  const learnerNoteClassOptions = useMemo(() => {
    const classMap = new Map();
    (draftLearnerNotes || []).forEach((note) => {
      const subStrandId = String(note?.subStrand?._id || note?.subStrand || '');
      const meta = draftMetaBySubStrandId.get(subStrandId);
      if (!meta?.classId || !meta?.className || classMap.has(meta.classId)) return;
      classMap.set(meta.classId, { id: meta.classId, name: meta.className });
    });
    return Array.from(classMap.values()).sort((first, second) => first.name.localeCompare(second.name));
  }, [draftLearnerNotes, draftMetaBySubStrandId]);

  const learnerNoteSubjectOptions = useMemo(() => {
    if (!learnerNotesClassFilter) return [];
    const subjectMap = new Map();
    (draftLearnerNotes || []).forEach((note) => {
      const subStrandId = String(note?.subStrand?._id || note?.subStrand || '');
      const meta = draftMetaBySubStrandId.get(subStrandId);
      if (!meta || meta.classId !== String(learnerNotesClassFilter) || subjectMap.has(meta.subjectId)) return;
      subjectMap.set(meta.subjectId, { id: meta.subjectId, name: meta.subjectName });
    });
    return Array.from(subjectMap.values()).sort((first, second) => first.name.localeCompare(second.name));
  }, [draftLearnerNotes, draftMetaBySubStrandId, learnerNotesClassFilter]);

  const learnerNotesBySelection = useMemo(() => {
    if (!learnerNotesClassFilter || !learnerNotesSubjectFilter) return [];
    return (draftLearnerNotes || []).filter((note) => {
      const subStrandId = String(note?.subStrand?._id || note?.subStrand || '');
      const meta = draftMetaBySubStrandId.get(subStrandId);
      if (!meta) return false;
      return meta.classId === String(learnerNotesClassFilter)
        && meta.subjectId === String(learnerNotesSubjectFilter);
    });
  }, [draftLearnerNotes, draftMetaBySubStrandId, learnerNotesClassFilter, learnerNotesSubjectFilter]);

  const analyticsSummary = useMemo(() => {
    const publishedLearnerNotes = (draftLearnerNotes || []).filter((note) => note.status === 'published').length;
    const draftOnlyLearnerNotes = (draftLearnerNotes || []).filter((note) => note.status !== 'published').length;

    const now = new Date();
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    const activityEntries = [
      ...(lessonNotes || []).map((note) => ({
        type: 'Lesson note created',
        title: note?.subStrand?.name || 'Lesson note',
        date: note?.createdAt,
      })),
      ...(draftLearnerNotes || []).map((note) => ({
        type: note?.status === 'published' ? 'Learner note published' : 'Learner note created',
        title: note?.subStrand?.name || 'Learner note',
        date: note?.createdAt,
      })),
      ...(quizzes || []).map((quiz) => ({
        type: 'Quiz generated',
        title: quiz?.title || 'Quiz',
        date: quiz?.createdAt,
      })),
      ...(bundles || []).map((bundle) => ({
        type: 'Bundle generated',
        title: bundle?.title || bundle?.subStrandName || 'Lesson bundle',
        date: bundle?.createdAt,
      })),
    ]
      .filter((entry) => !!entry.date)
      .sort((first, second) => new Date(second.date) - new Date(first.date));

    const last30Count = activityEntries.filter((entry) => new Date(entry.date) >= last30Days).length;
    const recentActivity = activityEntries.slice(0, 8);

    const topicCounts = new Map();
    [...(lessonNotes || []), ...(draftLearnerNotes || [])].forEach((note) => {
      const topicName = note?.subStrand?.name;
      if (!topicName) return;
      topicCounts.set(topicName, (topicCounts.get(topicName) || 0) + 1);
    });

    const topTopics = Array.from(topicCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 5);

    return {
      totalLessonNotes: lessonNotes?.length || 0,
      totalLearnerNotes: draftLearnerNotes?.length || 0,
      publishedLearnerNotes,
      draftOnlyLearnerNotes,
      totalBundles: bundles?.length || 0,
      totalQuizzes: quizzes?.length || 0,
      totalQuizAttempts: teacherAnalytics?.totalQuizAttempts || 0,
      avgQuizScore: teacherAnalytics?.averageScore || 0,
      totalNoteViews: teacherAnalytics?.totalNoteViews || 0,
      last30Count,
      recentActivity,
      topTopics,
    };
  }, [lessonNotes, draftLearnerNotes, quizzes, bundles, teacherAnalytics]);

  // Initialization & Handlers (Preserved from original)

  useEffect(() => {
    dispatch(syncUserFromStorage());
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
    dispatch(getTeacherAnalytics());
    dispatch(getMyBundles());
    dispatch(getMyQuizzes());
    return () => { dispatch(resetTeacherState()); };
  }, [dispatch]);

  // clear loaded quiz details when the detail dialog is closed
  useEffect(() => {
    if (activeDialog !== 'quizView') {
      dispatch({ type: 'teacher/clearCurrentQuiz' });
    }
  }, [activeDialog, dispatch]);

  // Dependent fetches
  useEffect(() => { if (selections.level) dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selections.level })); }, [selections.level, dispatch]);
  useEffect(() => { if (selections.class) dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selections.class })); }, [selections.class, dispatch]);
  useEffect(() => { if (selections.subject) dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selections.subject })); }, [selections.subject, dispatch]);
  useEffect(() => { if (selections.strand) dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selections.strand })); }, [selections.strand, dispatch]);

  const handleSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelections((prev) => {
      const next = { ...prev, [name]: value };
      const resetMap = { level: ['class', 'subject', 'strand', 'subStrand'], class: ['subject', 'strand', 'subStrand'], subject: ['strand', 'subStrand'], strand: ['subStrand'] };
      if (resetMap[name]) {
        resetMap[name].forEach((k) => (next[k] = ''));
        dispatch(clearChildren({ entities: resetMap[name] }));
        // if topic selections change, clear any previously queued strands for quizzes
        setQuizSelectedSubStrands([]);
      }
      return next;
    });
  }, [dispatch]);

  const preparePreviewSegments = useCallback((note) => {
    const segments = segmentHtmlWithImages(note?.content || '');
    const init = segments.map((s) => (s.type === 'image' ? { ...s, imgUrl: undefined } : s));
    setPreviewSegments(init);

    // Collect image fetch promises and update state once when all settle
    const imageJobs = init
      .map((seg, idx) => ({ seg, idx }))
      .filter(({ seg }) => seg.type === 'image');

    if (imageJobs.length === 0) return;

    Promise.allSettled(
      imageJobs.map(({ seg }) => {
        const query = seg.meta?.search_query || seg.meta?.title || '';
        return query ? fetchImageForQuery(query) : Promise.resolve('');
      })
    ).then((results) => {
      setPreviewSegments((prev) => {
        const next = [...prev];
        imageJobs.forEach(({ idx }, i) => {
          const url = results[i].status === 'fulfilled' ? results[i].value || '' : '';
          next[idx] = { ...next[idx], imgUrl: url };
        });
        return next;
      });
    });
  }, []);

  const displayNote = useCallback((note) => {
    if (!note) {
      setViewingNote(null);
      setPreviewSegments([]);
      return;
    }
    setViewingNote(note);
    preparePreviewSegments(note);
  }, [preparePreviewSegments]);

  const handleOpenDownloadMenu = useCallback((event) => {
    setDownloadMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseDownloadMenu = useCallback(() => {
    setDownloadMenuAnchorEl(null);
  }, []);

  const handleDownloadViewingNote = useCallback((format) => {
    if (!viewingNote) return;

    const topic = viewingNote?.subStrand?.name || viewingNote?.subStrand || 'lesson-note';
    const safeFileName = topic.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '');

    const printableBody = (previewSegments || []).map((segment) => {
      if (segment.type === 'text') return segment.html || '';
      if (segment.type === 'image' && segment.imgUrl) {
        const imageTitle = segment.meta?.title ? `<figcaption>${segment.meta.title}</figcaption>` : '';
        return `
          <figure style="margin: 16px 0; text-align: center;">
            <img src="${segment.imgUrl}" alt="${segment.meta?.title || ''}" style="max-width: 100%; height: auto;" />
            ${imageTitle}
          </figure>
        `;
      }
      return '';
    }).join('');

    const htmlDocument = `
      <!doctype html>
      <html>
        <head>
          <title>${topic}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 24px; line-height: 1.6; }
            h2, h3 { margin-top: 20px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            td, th { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">Topic: ${topic}</div>
          ${printableBody}
        </body>
      </html>
    `;

    if (format === 'pdf') {
      if (!window.html2pdf) {
        handleCloseDownloadMenu();
        setSnackbar({ open: true, message: 'PDF export is not available right now.', severity: 'error' });
        return;
      }

      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'fixed';
      pdfContainer.style.left = '-99999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '800px';
      pdfContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #111827; margin: 24px; line-height: 1.6;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">Topic: ${topic}</div>
          ${printableBody}
        </div>
      `;
      document.body.appendChild(pdfContainer);

      window.html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${safeFileName || 'lesson-note'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(pdfContainer)
        .save()
        .then(() => {
          pdfContainer.remove();
        })
        .catch(() => {
          pdfContainer.remove();
          setSnackbar({ open: true, message: 'Failed to generate PDF.', severity: 'error' });
        });

      handleCloseDownloadMenu();
      setSnackbar({ open: true, message: 'Downloading as .pdf', severity: 'success' });
      return;
    }

    let blob;
    let extension;

    if (format === 'html') {
      blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' });
      extension = 'html';
    } else if (format === 'doc') {
      blob = new Blob([htmlDocument], { type: 'application/msword' });
      extension = 'doc';
    } else {
      const tmp = document.createElement('div');
      tmp.innerHTML = printableBody;
      const plainText = tmp.textContent || tmp.innerText || '';
      blob = new Blob([`Topic: ${topic}\n\n${plainText}`], { type: 'text/plain;charset=utf-8' });
      extension = 'txt';
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFileName || 'lesson-note'}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    handleCloseDownloadMenu();
    setSnackbar({ open: true, message: `Downloaded as .${extension}`, severity: 'success' });
  }, [handleCloseDownloadMenu, previewSegments, setSnackbar, viewingNote]);

  const handleGenerateNoteSubmit = useCallback((formData) => {
    dispatch(generateLessonNote(formData)).unwrap().then((createdNote) => {
      setSnackbar({ open: true, message: 'Lesson note generated!', severity: 'success' });
      closeDialog();
      displayNote(createdNote);
      // also close create tools if open
      setShowCreateTools(false);
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch, displayNote]);

  // quiz-from-lesson flow
  const handleGenerateQuizFromLesson = useCallback(() => {
    if (!selectedLessonForQuiz) return;
    const note = (lessonNotes || []).find(n => n._id === selectedLessonForQuiz);
    const topic = note?.subStrand?.name || note?.title || 'Topic';
    const subjectName = note?.subStrand?.strand?.subject?.name || '';
    const className = note?.subStrand?.strand?.subject?.class?.name || '';

    if (!subjectName || !className) {
      setSnackbar({
        open: true,
        message: 'Selected lesson note lacks curriculum metadata (subject/class). Open or regenerate the note and try again.',
        severity: 'error',
      });
      return;
    }
    const subjectId = note?.subStrand?.strand?.subject?._id || '';
    if (!subjectId) {
      setSnackbar({
        open: true,
        message: 'Unable to determine subject id for selected lesson note.',
        severity: 'error',
      });
      return;
    }

    dispatch(generateAiQuiz({
      topic,
      subjectName,
      className,
      subjectId,
      subStrandId: note?.subStrand?._id || note?.subStrand,
      numQuestions: 10,
    }))
      .unwrap()
      .then(() => {
        setSnackbar({ open: true, message: 'Quiz generated from lesson note!', severity: 'success' });
        closeDialog();
        setSelectedLessonForQuiz('');
      })
      .catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch, selectedLessonForQuiz, lessonNotes]);

  // quiz-from-strands flow
  const handleGenerateQuizFromStrands = useCallback(() => {
    if (quizSelectedSubStrands.length === 0) return;
    // generate one quiz per selected sub-strand
    Promise.all(
      quizSelectedSubStrands.map((id) => {
        const sub = subStrands.find(s => s._id === id);
        const topic = sub?.name || 'Topic';
        const subjectName = sub?.strand?.subject?.name || '';
      const className = sub?.strand?.subject?.class?.name || '';
      const subjectId = sub?.strand?.subject?._id || '';
      if (!subjectName || !className || !subjectId) {
        // should be rare because subStrands are fully populated, but guard anyway
        return Promise.reject('Curriculum data missing for selected strand');
      }
      return dispatch(generateAiQuiz({
          topic,
          subjectName,
          className,
          subjectId,
          subStrandId: id,
          numQuestions: 10,
        }));
      })
    ).then(() => {
      setSnackbar({ open: true, message: 'Quizzes generated for selected strands!', severity: 'success' });
      closeDialog();
      setQuizSelectedSubStrands([]);
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch, quizSelectedSubStrands, subStrands]);

  const handleGenerateBundleSubmit = useCallback((data) => {
    dispatch(generateLessonBundle(data)).unwrap().then(() => {
      closeDialog();
      setActiveDialog('bundleResult');
      setSnackbar({ open: true, message: 'Lesson bundle generated! 🎉', severity: 'success' });
      setShowCreateTools(false);
    }).catch((error) => setSnackbar({ open: true, message: error || 'Failed', severity: 'error' }));
  }, [dispatch]);

  // form input change for strand dialog
  const handleStrandFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setStrandForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const closeLearnerFromStrand = useCallback(() => {
    closeDialog();
    resetSelections();
    resetStrandForm();
  }, [resetSelections, resetStrandForm]);

  // dispatch generator for learner note from strand
  const handleGenerateLearnerFromStrand = useCallback(() => {
    if (!selections.subStrand) return;
    const payload = {
      subStrandId: selections.subStrand,
      school: user?.school || '',
      term: strandForm.term,
      week: strandForm.week,
      dayDate: strandForm.dayDate,
      duration: strandForm.duration,
      classSize: strandForm.classSize,
      contentStandardCode: strandForm.contentStandardCode,
      indicatorCodes: strandForm.indicatorCodes,
      reference: strandForm.reference,
      preferredProvider: strandForm.preferredProvider,
      preferredModel: strandForm.preferredModel,
    };
    dispatch(generateLearnerNoteFromStrand(payload))
      .unwrap()
      .then((created) => {
        setSnackbar({ open: true, message: 'Learner note generated (draft)!', severity: 'success' });
        displayNote(created);
        closeDialog();
        // reset selections and form
        resetSelections();
        resetStrandForm();
        dispatch(getDraftLearnerNotes());
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err || 'Failed to generate learner note', severity: 'error' });
      });
  }, [dispatch, selections.subStrand, strandForm, user, displayNote, resetSelections, resetStrandForm]);

  // Generate only lesson plan (first part of bundle)
  const handleGeneratePlan = useCallback(() => {
    if (!selections.subStrand) return;
    // close selection and open lesson note form for user completion
    closeDialog();
    setActiveDialog('noteForm');
  }, [selections.subStrand]);

  const handlePublishBundle = useCallback((bundle) => {
    if (bundle.learnerNote?.id) {
      dispatch(publishLearnerNote(bundle.learnerNote.id));
    }
    closeDialog();
    setSnackbar({ open: true, message: 'Bundle published! ✨', severity: 'success' });
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
  }, [dispatch, closeDialog]);

  const handlePublishLearnerNote = useCallback((noteId) => {
    dispatch(publishLearnerNote(noteId))
      .unwrap()
      .then(() => {
        if (viewingNote?._id === noteId) displayNote(null);
        setSnackbar({ open: true, message: 'Learner note published to students.', severity: 'success' });
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err || 'Failed to publish learner note.', severity: 'error' });
      });
  }, [dispatch, viewingNote, displayNote]);

  const handleGenerateLearnerFromLesson = useCallback(() => {
    if (!selectedLessonForLearner) return;
    dispatch(generateLearnerNote(selectedLessonForLearner))
      .unwrap()
      .then((created) => {
        setSnackbar({ open: true, message: 'Learner note generated (draft)!', severity: 'success' });
        displayNote(created);
        closeDialog();
        setSelectedLessonForLearner('');
        dispatch(getDraftLearnerNotes());
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err || 'Failed to generate learner note', severity: 'error' });
      });
  }, [dispatch, selectedLessonForLearner, displayNote, closeDialog]);

  const handleViewQuiz = useCallback((quizId) => {
    dispatch(getQuizById(quizId))
      .unwrap()
      .then(() => setActiveDialog('quizView'))
      .catch((err) => setSnackbar({ open: true, message: err || 'Failed to load quiz', severity: 'error' }));
  }, [dispatch]);

  const handleDeleteQuiz = useCallback((quizId) => {
    dispatch(deleteQuiz(quizId))
      .then(() => setSnackbar({ open: true, message: 'Quiz deleted!', severity: 'success' }))
      .catch((err) => setSnackbar({ open: true, message: err || 'Failed to delete quiz', severity: 'error' }));
  }, [dispatch]);

  const handleDeleteLessonNote = useCallback(() => {
    if (!noteToDelete?._id) return;
    dispatch(deleteLessonNote(noteToDelete._id))
      .unwrap()
      .then(() => {
        if (viewingNote?._id === noteToDelete._id) displayNote(null);
        setSnackbar({ open: true, message: 'Lesson note deleted.', severity: 'success' });
      })
      .catch((err) => setSnackbar({ open: true, message: err || 'Failed to delete lesson note.', severity: 'error' }))
      .finally(() => setNoteToDelete(null));
  }, [dispatch, noteToDelete, viewingNote, displayNote]);

  const handleDeleteLearnerNote = useCallback(() => {
    if (!learnerNoteToDelete?._id) return;
    dispatch(deleteDraftLearnerNote(learnerNoteToDelete._id))
      .unwrap()
      .then(() => {
        if (viewingNote?._id === learnerNoteToDelete._id) displayNote(null);
        setSnackbar({ open: true, message: 'Learner note deleted.', severity: 'success' });
      })
      .catch((err) => setSnackbar({ open: true, message: err || 'Failed to delete learner note.', severity: 'error' }))
      .finally(() => setLearnerNoteToDelete(null));
  }, [dispatch, learnerNoteToDelete, viewingNote, displayNote]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getMyLessonNotes()),
      dispatch(getDraftLearnerNotes()),
      dispatch(getTeacherAnalytics()),
      dispatch(getMyBundles())
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  const createNewToolItems = [
    {
      key: 'lesson-plan',
      label: 'Generate Lesson Plan',
      imageUrl: 'https://static.vecteezy.com/system/resources/previews/027/685/568/original/teacher-lesson-icon-flat-vector.jpg',
      onClick: () => {
        resetSelections();
        setActiveDialog('plan');
      },
    },
    {
      key: 'learner-notes',
      label: 'Generate Learner Notes',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/8980/8980099.png',
      onClick: () => {
        resetSelections();
        setActiveDialog('learnerOptions');
      },
    },
    {
      key: 'quiz',
      label: 'Generate Quiz',
      imageUrl: 'https://static.vecteezy.com/system/resources/previews/009/742/591/large_2x/quiz-game-icon-outline-illustration-vector.jpg',
      onClick: () => setActiveDialog('quizOptions'),
    },
    {
      key: 'bundle',
      label: 'Generate Complete Lesson Bundle',
      imageUrl: 'https://img.freepik.com/premium-vector/color-school-tools-icon_24640-20330.jpg?w=2000',
      onClick: () => {
        resetSelections();
        setActiveDialog('bundleSelector');
      },
    },
  ];

  const managementToolItems = [
    {
      key: 'create-new',
      label: 'Create New',
      imageUrl: 'https://static.vecteezy.com/system/resources/previews/015/526/676/original/presentation-creative-icon-design-free-vector.jpg',
      onClick: () => setShowCreateTools(true),
    },
    {
      key: 'my-lesson-notes',
      label: 'My Lesson Notes',
      imageUrl: 'https://i.pinimg.com/736x/d1/f0/68/d1f068f076dd1d2090b35d602f62948f.jpg',
      onClick: () => {
        setNotesClassFilter('');
        setNotesSubjectFilter('');
        setActiveDialog('myLessonNotes');
      },
    },
    {
      key: 'my-learner-notes',
      label: 'Learner Notes',
      imageUrl: 'https://media.istockphoto.com/id/1408391194/vector/reader-reciter.jpg?s=612x612&w=0&k=20&c=DpvhTP2hQqv_XrORtg56zz61WiFalK44CPO_Ka67ozg=',
      onClick: () => {
        setLearnerNotesClassFilter('');
        setLearnerNotesSubjectFilter('');
        setActiveDialog('myLearnerNotes');
      },
    },
    {
      key: 'my-quizzes',
      label: 'Quizzes',
      imageUrl: 'https://img.freepik.com/premium-vector/quiz-logo-poll-questionnaire-icon-symbol_101884-1076.jpg?w=2000',
      onClick: () => setActiveDialog('myQuizzes'),
    },
    {
      key: 'analysis',
      label: 'Analysis',
      imageUrl: 'https://png.pngtree.com/png-vector/20191009/ourlarge/pngtree-analysis-icon-png-image_1798051.jpg',
      onClick: () => setActiveDialog('analytics'),
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 4 } }}>
        
        {/* Header Banner */}
        <DashboardBanner
          user={user}
          role="teacher"
          stats={[]}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          collapsed={bannerCollapsed}
          onCollapse={setBannerCollapsed}
        />

        {/* OVERVIEW SECTION */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.primary', letterSpacing: 0.2 }}>
            Overview
          </Typography>
          <Grid container spacing={3}>
            {overviewCards.map((card) => (
              <Grid key={card.key} item xs={12} sm={6} md={3}>
                <Paper
                  sx={(theme) => ({
                    ...overviewCardSx,
                    borderColor: alpha(theme.palette[card.palette].main, 0.2),
                    background: `linear-gradient(145deg, ${alpha(theme.palette[card.palette].main, 0.2)} 0%, ${alpha(theme.palette[card.palette].main, 0.06)} 100%)`,
                    boxShadow: `0 10px 24px ${alpha(theme.palette[card.palette].main, 0.18)}`,
                  })}
                >
                  <Box
                    sx={(theme) => ({
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.palette[card.palette].main,
                      color: theme.palette[card.palette].contrastText,
                      boxShadow: `0 8px 16px ${alpha(theme.palette[card.palette].main, 0.35)}`,
                      mb: 2,
                    })}
                  >
                    <card.Icon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="h3" sx={(theme) => ({ fontWeight: 800, lineHeight: 1, mb: 1.1, color: theme.palette[card.palette].main })}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.6, color: 'text.primary', display: 'block' }}>
                    {card.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                    {card.subtitle}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 4, borderColor: 'divider' }} />

        {/* TEACHER TOOLS SECTION */}
        {showCreateTools ? (
          <Box sx={{ mt: 4, mb: 3 }}>
            <Button onClick={() => setShowCreateTools(false)} variant="text" sx={{ mb: 2 }}>← Back</Button>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'text.primary', letterSpacing: 0.2 }}>Create New</Typography>
            <Grid container spacing={3}>
              {createNewToolItems.map((tool) => (
                <ToolTile
                  key={tool.key}
                  label={tool.label}
                  imageUrl={tool.imageUrl}
                  onClick={tool.onClick}
                  toolTileSx={toolTileSx}
                  toolImageSx={toolImageSx}
                />
              ))}
            </Grid>
          </Box>
        ) : (
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'text.primary', letterSpacing: 0.2 }}>TEACHER TOOLS</Typography>
            <Grid container spacing={3}>
              {managementToolItems.map((tool) => (
                <ToolTile
                  key={tool.key}
                  label={tool.label}
                  imageUrl={tool.imageUrl}
                  onClick={tool.onClick}
                  toolTileSx={toolTileSx}
                  toolImageSx={toolImageSx}
                />
              ))}
            </Grid>
          </Box>
        )}

        {/* Modals & Dialogs */}
        {/* Plan generation modal */}
        <Dialog open={activeDialog === 'plan'} onClose={() => closeDialog()} fullScreen={isDialogFullscreen('plan')} fullWidth maxWidth={isDialogFullscreen('plan') ? false : 'sm'}>
          <DialogTitleWithFullscreen title="Select Topic for Lesson Plan" isFullscreen={isDialogFullscreen('plan')} onToggle={() => toggleDialogFullscreen('plan')} />
          <DialogContent>
            <CurriculumSelection
              levels={levels}
              classes={classes}
              subjects={subjects}
              strands={strands}
              subStrands={subStrands}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              isLoading={isLoading || planLoading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog()} disabled={planLoading}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleGeneratePlan}
              disabled={!selections.subStrand || planLoading}
              startIcon={planLoading ? <CircularProgress size={20} /> : null}
            >
              {planLoading ? 'Generating...' : 'Generate Lesson Plan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bundle topic selector dialog */}
        <Dialog open={activeDialog === 'bundleSelector'} onClose={() => closeDialog()} fullScreen={isDialogFullscreen('bundleSelector')} fullWidth maxWidth={isDialogFullscreen('bundleSelector') ? false : 'sm'}>
          <DialogTitleWithFullscreen title="Select Topic for Lesson Bundle" isFullscreen={isDialogFullscreen('bundleSelector')} onToggle={() => toggleDialogFullscreen('bundleSelector')} />
          <DialogContent>
            <CurriculumSelection
              levels={levels}
              classes={classes}
              subjects={subjects}
              strands={strands}
              subStrands={subStrands}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              isLoading={isLoading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog()}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                closeDialog();
                setActiveDialog('bundleModal');
              }}
              disabled={!selections.subStrand}
            >
              Continue
            </Button>
          </DialogActions>
        </Dialog>

        <LessonBundleForm
          open={activeDialog === 'bundleModal'}
          onClose={() => closeDialog()}
          onSubmit={handleGenerateBundleSubmit}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          subStrandId={selections.subStrand}
          isLoading={isLoading}
        />
        {/* Learner Notes Options Dialog */}
        <Dialog open={activeDialog === 'learnerOptions'} onClose={() => closeDialog()} fullScreen={isDialogFullscreen('learnerOptions')} fullWidth maxWidth={isDialogFullscreen('learnerOptions') ? false : 'xs'}>
          <DialogTitleWithFullscreen title="Generate Learner Notes" isFullscreen={isDialogFullscreen('learnerOptions')} onToggle={() => toggleDialogFullscreen('learnerOptions')} />
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Choose how you want to generate learner notes:</Typography>
            <Stack spacing={2}>
              <Button variant="outlined" onClick={() => { setActiveDialog('learnerFromLesson'); }}>
                From Lesson Note
              </Button>
              <Button variant="contained" onClick={() => { closeDialog(); resetSelections(); resetStrandForm(); setActiveDialog('learnerFromStrand'); }}>
                From Strands
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog()}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Quiz Options Dialog */}
        <Dialog open={activeDialog === 'quizOptions'} onClose={() => closeDialog()} fullScreen={isDialogFullscreen('quizOptions')} fullWidth maxWidth={isDialogFullscreen('quizOptions') ? false : 'xs'}>
          <DialogTitleWithFullscreen title="Generate Quiz" isFullscreen={isDialogFullscreen('quizOptions')} onToggle={() => toggleDialogFullscreen('quizOptions')} />
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Choose how you want to generate the quiz:</Typography>
            <Stack spacing={2}>
              <Button variant="outlined" onClick={() => { setActiveDialog('quizFromLesson'); }}>
                From Lesson Note
              </Button>
              <Button variant="contained" onClick={() => { closeDialog(); resetSelections(); setQuizSelectedSubStrands([]); setActiveDialog('quizFromStrand'); }}>
                From Strands
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog()}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* My Lesson Notes flow */}
        <Dialog
          open={activeDialog === 'myLessonNotes'}
          onClose={() => {
            closeDialog();
            setNotesClassFilter('');
            setNotesSubjectFilter('');
          }}
          fullScreen={isDialogFullscreen('myLessonNotes')}
          fullWidth
          maxWidth={isDialogFullscreen('myLessonNotes') ? false : 'md'}
        >
          <DialogTitleWithFullscreen title="My Lesson Notes" isFullscreen={isDialogFullscreen('myLessonNotes')} onToggle={() => toggleDialogFullscreen('myLessonNotes')} />
          <DialogContent sx={dialogBodySx}>
            <Grid container spacing={2} sx={dialogFilterPanelSx}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="notes-class-label">Class</InputLabel>
                  <Select
                    labelId="notes-class-label"
                    label="Class"
                    value={notesClassFilter}
                    onChange={(event) => {
                      setNotesClassFilter(event.target.value);
                      setNotesSubjectFilter('');
                    }}
                  >
                    {lessonNoteClassOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" disabled={!notesClassFilter}>
                  <InputLabel id="notes-subject-label">Subject</InputLabel>
                  <Select
                    labelId="notes-subject-label"
                    label="Subject"
                    value={notesSubjectFilter}
                    onChange={(event) => setNotesSubjectFilter(event.target.value)}
                  >
                    {lessonNoteSubjectOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {!notesClassFilter ? (
              <Typography variant="body2" color="text.secondary">Select a class to continue.</Typography>
            ) : !notesSubjectFilter ? (
              <Typography variant="body2" color="text.secondary">Select a subject to view notes.</Typography>
            ) : lessonNotesBySelection.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No lesson notes found for this class and subject.</Typography>
            ) : (
              <List>
                {lessonNotesBySelection.map((note) => (
                  <Paper key={note._id} sx={dialogListCardSx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {note.subStrand?.name || 'Lesson Note'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Unknown'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            displayNote(note);
                            closeDialog();
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setNoteToDelete(note)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                closeDialog();
                setNotesClassFilter('');
                setNotesSubjectFilter('');
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* My Learner Notes flow */}
        <Dialog
          open={activeDialog === 'myLearnerNotes'}
          onClose={() => {
            closeDialog();
            setLearnerNotesClassFilter('');
            setLearnerNotesSubjectFilter('');
          }}
          fullScreen={isDialogFullscreen('myLearnerNotes')}
          scroll="paper"
          fullWidth
          maxWidth={isDialogFullscreen('myLearnerNotes') ? false : 'md'}
        >
          <DialogTitleWithFullscreen title="My Learner Notes" isFullscreen={isDialogFullscreen('myLearnerNotes')} onToggle={() => toggleDialogFullscreen('myLearnerNotes')} />
          <DialogContent tabIndex={0} sx={dialogBodySx}>
            <Grid container spacing={2} sx={dialogFilterPanelSx}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="learner-notes-class-label">Class</InputLabel>
                  <Select
                    labelId="learner-notes-class-label"
                    label="Class"
                    value={learnerNotesClassFilter}
                    onChange={(event) => {
                      setLearnerNotesClassFilter(event.target.value);
                      setLearnerNotesSubjectFilter('');
                    }}
                  >
                    {learnerNoteClassOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" disabled={!learnerNotesClassFilter}>
                  <InputLabel id="learner-notes-subject-label">Subject</InputLabel>
                  <Select
                    labelId="learner-notes-subject-label"
                    label="Subject"
                    value={learnerNotesSubjectFilter}
                    onChange={(event) => setLearnerNotesSubjectFilter(event.target.value)}
                  >
                    {learnerNoteSubjectOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {!learnerNotesClassFilter ? (
              <Typography variant="body2" color="text.secondary">Select a class to continue.</Typography>
            ) : !learnerNotesSubjectFilter ? (
              <Typography variant="body2" color="text.secondary">Select a subject to view learner notes.</Typography>
            ) : learnerNotesBySelection.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No learner notes found for this class and subject.</Typography>
            ) : (
              <List>
                {learnerNotesBySelection.map((note) => (
                  <Paper key={note._id} sx={dialogListCardSx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {note.subStrand?.name || 'Learner Note'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Unknown'}
                        </Typography>
                        {note.status === 'published' && (
                          <Chip
                            label="Published"
                            size="small"
                            color="success"
                            sx={{ ml: 1, height: 20, fontWeight: 700 }}
                          />
                        )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            displayNote(note);
                            closeDialog();
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={note.status === 'published'}
                          onClick={() => handlePublishLearnerNote(note._id)}
                        >
                          {note.status === 'published' ? 'Published' : 'Publish'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setLearnerNoteToDelete(note)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                closeDialog();
                setLearnerNotesClassFilter('');
                setLearnerNotesSubjectFilter('');
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* From Lesson Note flow */}
        <LessonNotePickerDialog
          open={activeDialog === 'learnerFromLesson'}
          onClose={() => { closeDialog(); setSelectedLessonForLearner(''); }}
          title="Generate Learner Note from an Existing Lesson Note"
          description="Select a lesson note to convert into a learner-friendly note."
          lessonNotes={lessonNotes}
          selectedId={selectedLessonForLearner}
          onSelect={setSelectedLessonForLearner}
          onConfirm={handleGenerateLearnerFromLesson}
          confirmLabel="Generate Learner Note"
          isLoading={isLoading}
          fullScreen={isDialogFullscreen('learnerFromLesson')}
          onToggleFullscreen={() => toggleDialogFullscreen('learnerFromLesson')}
        />

        {/* From Strands flow */}
        <Dialog open={activeDialog === 'learnerFromStrand'} onClose={closeLearnerFromStrand} fullScreen={isDialogFullscreen('learnerFromStrand')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('learnerFromStrand') ? false : 'sm'}>
          <DialogTitleWithFullscreen title="Generate Learner Note from Strand" isFullscreen={isDialogFullscreen('learnerFromStrand')} onToggle={() => toggleDialogFullscreen('learnerFromStrand')} />
          <DialogContent tabIndex={0} sx={dialogBodySx}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Choose a strand/sub-strand and provide optional context details to guide the AI.
            </Typography>
            <CurriculumSelection
              levels={levels}
              classes={classes}
              subjects={subjects}
              strands={strands}
              subStrands={subStrands}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              isLoading={isLoading}
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Term"
                  name="term"
                  value={strandForm.term}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Week"
                  name="week"
                  value={strandForm.week}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  name="dayDate"
                  type="date"
                  value={strandForm.dayDate}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration"
                  name="duration"
                  value={strandForm.duration}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Class Size"
                  name="classSize"
                  value={strandForm.classSize}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Content Std. Code"
                  name="contentStandardCode"
                  value={strandForm.contentStandardCode}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Indicator Codes (comma separated)"
                  name="indicatorCodes"
                  value={strandForm.indicatorCodes}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Reference"
                  name="reference"
                  value={strandForm.reference}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred AI Provider"
                  name="preferredProvider"
                  value={strandForm.preferredProvider}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred AI Model"
                  name="preferredModel"
                  value={strandForm.preferredModel}
                  onChange={handleStrandFormChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeLearnerFromStrand} disabled={isLoading}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selections.subStrand || isLoading}
              onClick={handleGenerateLearnerFromStrand}
            >
              {isLoading ? <CircularProgress size={18} /> : 'Generate Learner Note'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Quiz From Lesson Note */}
        <LessonNotePickerDialog
          open={activeDialog === 'quizFromLesson'}
          onClose={() => { closeDialog(); setSelectedLessonForQuiz(''); }}
          title="Generate Quiz from a Lesson Note"
          description="Select a lesson note to use as the source for the quiz."
          lessonNotes={lessonNotes}
          selectedId={selectedLessonForQuiz}
          onSelect={setSelectedLessonForQuiz}
          onConfirm={handleGenerateQuizFromLesson}
          confirmLabel="Generate Quiz"
          isLoading={isLoading}
          fullScreen={isDialogFullscreen('quizFromLesson')}
          onToggleFullscreen={() => toggleDialogFullscreen('quizFromLesson')}
        />

        {/* Quiz From Strands */}
        <Dialog open={activeDialog === 'quizFromStrand'} onClose={() => closeDialog()} fullScreen={isDialogFullscreen('quizFromStrand')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('quizFromStrand') ? false : 'sm'}>
          <DialogTitleWithFullscreen title="Generate Quiz from Strands" isFullscreen={isDialogFullscreen('quizFromStrand')} onToggle={() => toggleDialogFullscreen('quizFromStrand')} />
          <DialogContent tabIndex={0} sx={dialogBodySx}>
            <Typography variant="body2" sx={{ mb: 2 }}>Use the curriculum selector below, then tick one or more sub-strands.</Typography>
            <CurriculumSelection
              levels={levels}
              classes={classes}
              subjects={subjects}
              strands={strands}
              subStrands={subStrands}
              selections={selections}
              handleSelectionChange={handleSelectionChange}
              isLoading={isLoading}
            />
            {subStrands.length > 0 && (
              <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <List>
                  {subStrands.map(s => (
                    <ListItem key={s._id} disablePadding>
                      <ListItemButton
                        role={undefined}
                        onClick={() => {
                          setQuizSelectedSubStrands(prev =>
                            prev.includes(s._id) ? prev.filter(x => x !== s._id) : [...prev, s._id]
                          );
                        }}
                        sx={selectableListItemSx}
                      >
                        <ListItemText primary={s.name} />
                        <Checkbox edge="end" checked={quizSelectedSubStrands.includes(s._id)} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {subStrands.length === 0 && <ListItem><ListItemText primary="No sub-strands available" /></ListItem>}
                </List>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog()} disabled={isLoading}>Cancel</Button>
            <Button
              variant="contained"
              disabled={quizSelectedSubStrands.length === 0 || isLoading}
              onClick={handleGenerateQuizFromStrands}
            >
              {isLoading ? <CircularProgress size={18} /> : 'Generate Quizzes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* My Quizzes Dialog */}
        <Dialog open={activeDialog === 'myQuizzes'} onClose={() => closeDialog()} fullScreen={isDialogFullscreen('myQuizzes')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('myQuizzes') ? false : 'md'}>
          <DialogTitleWithFullscreen title="My Quizzes" isFullscreen={isDialogFullscreen('myQuizzes')} onToggle={() => toggleDialogFullscreen('myQuizzes')} />
          <DialogContent tabIndex={0} sx={dialogBodySx}>
            {(!quizzes || quizzes.length === 0) ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No quizzes created yet. Start by generating a quiz from the "Create New" section.</Typography>
              </Box>
            ) : (
              <List>
                {quizzes.map((quiz) => (
                  <Paper key={quiz._id} sx={dialogListCardSx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6">{quiz.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {quiz.createdAt ? new Date(quiz.createdAt).toLocaleString() : 'Unknown'}
                        </Typography>
                        {quiz.aiProvider && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            Generated by {quiz.aiModel}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewQuiz(quiz._id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog()}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Analytics Dialog */}
        <AnalyticsDialog
          open={activeDialog === 'analytics'}
          onClose={closeDialog}
          analyticsSummary={analyticsSummary}
          fullScreen={isDialogFullscreen('analytics')}
          onToggleFullscreen={() => toggleDialogFullscreen('analytics')}
        />

        {/* Note creation form modal */}

        {/* Quiz detail viewer */}
        <Dialog open={activeDialog === 'quizView'} onClose={() => { closeDialog(); }} fullScreen={isDialogFullscreen('quizView')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('quizView') ? false : 'md'}>
          <DialogTitleWithFullscreen title="Quiz Details" isFullscreen={isDialogFullscreen('quizView')} onToggle={() => toggleDialogFullscreen('quizView')} />
          <DialogContent tabIndex={0} sx={dialogBodySx}>
            {currentQuiz ? (
              <Box>
                <Typography variant="h6" gutterBottom>{currentQuiz.title}</Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Created: {currentQuiz.createdAt ? new Date(currentQuiz.createdAt).toLocaleString() : 'Unknown'}
                </Typography>
                {currentQuiz.questions && currentQuiz.questions.length > 0 ? (
                  <List>
                    {currentQuiz.questions.map((q, idx) => (
                      <Paper key={q._id} sx={dialogListCardSx}>
                        <Typography><strong>Q{idx + 1}.</strong> {q.text}</Typography>
                        <List>
                          {q.options.map((opt) => (
                            <ListItem key={opt._id}>
                              <ListItemText
                                primary={opt.text}
                                secondary={opt.isCorrect ? 'Correct' : ''}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No questions available.</Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { closeDialog(); }} >Close</Button>
          </DialogActions>
        </Dialog>

        <LessonNoteForm
          open={activeDialog === 'noteForm'}
          onClose={() => closeDialog()}
          onSubmit={handleGenerateNoteSubmit}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          subStrandId={selections.subStrand}
          isLoading={isLoading || planLoading}
          fullScreen={isDialogFullscreen('lessonNoteForm')}
          onToggleFullscreen={() => toggleDialogFullscreen('lessonNoteForm')}
        />
        <BundleResultViewer
          open={activeDialog === 'bundleResult'}
          onClose={() => closeDialog()}
          bundleData={bundleResult}
          onPublish={handlePublishBundle}
          fullScreen={isDialogFullscreen('bundleResultViewer')}
          onToggleFullscreen={() => toggleDialogFullscreen('bundleResultViewer')}
        />
        
        {/* Delete Confirmations */}
        <ConfirmDialog
          open={!!noteToDelete}
          title="Delete Lesson Note"
          message="Are you sure you want to delete this lesson note? This action cannot be undone."
          severity="error"
          confirmLabel="Delete"
          onConfirm={handleDeleteLessonNote}
          onCancel={() => setNoteToDelete(null)}
        />

        <ConfirmDialog
          open={!!learnerNoteToDelete}
          title="Delete Learner Note"
          message="Are you sure you want to delete this learner note? This action cannot be undone."
          severity="error"
          confirmLabel="Delete"
          onConfirm={handleDeleteLearnerNote}
          onCancel={() => setLearnerNoteToDelete(null)}
        />

        {/* Note Preview */}
        <NotePreviewDialog
          open={!!viewingNote}
          onClose={() => displayNote(null)}
          note={viewingNote}
          segments={previewSegments}
          downloadMenuAnchorEl={downloadMenuAnchorEl}
          onOpenDownloadMenu={handleOpenDownloadMenu}
          onCloseDownloadMenu={handleCloseDownloadMenu}
          onDownload={handleDownloadViewingNote}
          fullScreen={isDialogFullscreen('notePreview')}
          onToggleFullscreen={() => toggleDialogFullscreen('notePreview')}
        />

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default TeacherDashboard;