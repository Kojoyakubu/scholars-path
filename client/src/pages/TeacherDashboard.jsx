import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

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

// MUI Imports
import {
  Box,
  Typography,
  Button,
  Grid,
  Select,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText, // Added missing import
  CircularProgress,
  Stack,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Avatar,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Badge,
  Checkbox,
  CardActions,
} from '@mui/material';

// Icon Imports
import {
  Article,
  Delete,
  FaceRetouchingNatural,
  CheckCircle,
  Visibility,
  AddCircle,
  Quiz,
  Preview,
  Assessment,
  AutoAwesome,
  School,
  Search,
  ViewModule,
  ViewList,
  CalendarToday,
  Folder,
  ExpandMore,
  ExpandLess,
  Refresh,
  PlayArrow,
  OpenInFull,
  CloseFullscreen,
  Download,
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
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [previewSegments, setPreviewSegments] = useState([]);
  
  // Bundle generation state
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [viewBundleResult, setViewBundleResult] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBundleSelectorOpen, setIsBundleSelectorOpen] = useState(false);
  const [isLearnerOptionsOpen, setIsLearnerOptionsOpen] = useState(false);
  const [isLearnerFromLessonOpen, setIsLearnerFromLessonOpen] = useState(false);
  const [isLearnerFromStrandOpen, setIsLearnerFromStrandOpen] = useState(false);
  const [selectedLessonForLearner, setSelectedLessonForLearner] = useState('');

  // quiz generation dialogs
  const [isQuizOptionsOpen, setIsQuizOptionsOpen] = useState(false);
  const [isQuizFromLessonOpen, setIsQuizFromLessonOpen] = useState(false);
  const [isQuizFromStrandOpen, setIsQuizFromStrandOpen] = useState(false);
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState('');
  const [quizSelectedSubStrands, setQuizSelectedSubStrands] = useState([]);
  const [isMyQuizzesOpen, setIsMyQuizzesOpen] = useState(false);
  const [isQuizViewOpen, setIsQuizViewOpen] = useState(false);
  const [isMyLessonNotesOpen, setIsMyLessonNotesOpen] = useState(false);
  const [notesClassFilter, setNotesClassFilter] = useState('');
  const [notesSubjectFilter, setNotesSubjectFilter] = useState('');
  const [isMyLearnerNotesOpen, setIsMyLearnerNotesOpen] = useState(false);
  const [learnerNotesClassFilter, setLearnerNotesClassFilter] = useState('');
  const [learnerNotesSubjectFilter, setLearnerNotesSubjectFilter] = useState('');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState(null);

  // form state for gathering extra details when generating from strand
  const [strandForm, setStrandForm] = useState(INITIAL_STRAND_FORM);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [learnerNoteToDelete, setLearnerNoteToDelete] = useState(null);


  // View state
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateTools, setShowCreateTools] = useState(false);
  const planLoading = false;
  const [dialogFullscreen, setDialogFullscreen] = useState({});

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
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 4,
    },
  };

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
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 4,
      borderColor: 'primary.main',
    },
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
    '&:hover': {
      borderColor: 'primary.main',
      boxShadow: 1,
    },
  };

  const selectableListItemSx = {
    alignItems: 'flex-start',
    borderRadius: 1.5,
    mx: 0.75,
    my: 0.4,
    '&.Mui-selected': {
      bgcolor: 'primary.50',
      border: '1px solid',
      borderColor: 'primary.main',
    },
    '&.Mui-selected:hover': {
      bgcolor: 'primary.100',
    },
  };

  const analyticsKpiCardSx = {
    p: 2,
    height: '100%',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 0,
    bgcolor: 'background.paper',
  };

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
    if (!isQuizViewOpen) {
      dispatch({ type: 'teacher/clearCurrentQuiz' });
    }
  }, [isQuizViewOpen, dispatch]);

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
    // initialize segments with imgUrl field set to undefined for loading
    const init = segments.map((s) => (s.type === 'image' ? { ...s, imgUrl: undefined } : s));
    setPreviewSegments(init);

    // fetch images for any image segments asynchronously
    init.forEach((seg, idx) => {
      if (seg.type === 'image') {
        const query = seg.meta?.search_query || seg.meta?.title || '';
        if (query) {
          fetchImageForQuery(query).then((url) => {
            setPreviewSegments((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], imgUrl: url || '' };
              return next;
            });
          }).catch(() => {
            setPreviewSegments((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], imgUrl: '' };
              return next;
            });
          });
        } else {
          // no search information, mark as no image
          setPreviewSegments((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], imgUrl: '' };
            return next;
          });
        }
      }
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
      setIsNoteModalOpen(false);
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
        setIsQuizFromLessonOpen(false);
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
      setIsQuizFromStrandOpen(false);
      setQuizSelectedSubStrands([]);
    }).catch((err) => setSnackbar({ open: true, message: err || 'Failed', severity: 'error' }));
  }, [dispatch, quizSelectedSubStrands, subStrands]);

  const handleGenerateBundleSubmit = useCallback((data) => {
    dispatch(generateLessonBundle(data)).unwrap().then(() => {
      setIsBundleModalOpen(false);
      setViewBundleResult(true);
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
    setIsLearnerFromStrandOpen(false);
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
        setIsLearnerFromStrandOpen(false);
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
    setIsPlanModalOpen(false);
    setIsNoteModalOpen(true);
  }, [selections.subStrand]);

  const handlePublishBundle = useCallback((bundle) => {
    if (bundle.learnerNote?.id) {
      dispatch(publishLearnerNote(bundle.learnerNote.id));
    }
    setViewBundleResult(false);
    setSnackbar({ open: true, message: 'Bundle published! ✨', severity: 'success' });
    dispatch(getMyLessonNotes());
    dispatch(getDraftLearnerNotes());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(getMyLessonNotes()),
      dispatch(getDraftLearnerNotes()),
      dispatch(getTeacherAnalytics()),
      dispatch(getMyBundles())
    ]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const createNewToolItems = [
    {
      key: 'lesson-plan',
      label: 'Generate Lesson Plan',
      imageUrl: 'https://static.vecteezy.com/system/resources/previews/027/685/568/original/teacher-lesson-icon-flat-vector.jpg',
      onClick: () => {
        resetSelections();
        setIsPlanModalOpen(true);
      },
    },
    {
      key: 'learner-notes',
      label: 'Generate Learner Notes',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/8980/8980099.png',
      onClick: () => {
        resetSelections();
        setIsLearnerOptionsOpen(true);
      },
    },
    {
      key: 'quiz',
      label: 'Generate Quiz',
      imageUrl: 'https://static.vecteezy.com/system/resources/previews/009/742/591/large_2x/quiz-game-icon-outline-illustration-vector.jpg',
      onClick: () => setIsQuizOptionsOpen(true),
    },
    {
      key: 'bundle',
      label: 'Generate Complete Lesson Bundle',
      imageUrl: 'https://img.freepik.com/premium-vector/color-school-tools-icon_24640-20330.jpg?w=2000',
      onClick: () => {
        resetSelections();
        setIsBundleSelectorOpen(true);
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
        setIsMyLessonNotesOpen(true);
      },
    },
    {
      key: 'my-learner-notes',
      label: 'Learner Notes',
      imageUrl: 'https://media.istockphoto.com/id/1408391194/vector/reader-reciter.jpg?s=612x612&w=0&k=20&c=DpvhTP2hQqv_XrORtg56zz61WiFalK44CPO_Ka67ozg=',
      onClick: () => {
        setLearnerNotesClassFilter('');
        setLearnerNotesSubjectFilter('');
        setIsMyLearnerNotesOpen(true);
      },
    },
    {
      key: 'my-quizzes',
      label: 'Quizzes',
      imageUrl: 'https://img.freepik.com/premium-vector/quiz-logo-poll-questionnaire-icon-symbol_101884-1076.jpg?w=2000',
      onClick: () => setIsMyQuizzesOpen(true),
    },
    {
      key: 'analysis',
      label: 'Analysis',
      imageUrl: 'https://png.pngtree.com/png-vector/20191009/ourlarge/pngtree-analysis-icon-png-image_1798051.jpg',
      onClick: () => setIsAnalyticsOpen(true),
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
        <Dialog open={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} fullScreen={isDialogFullscreen('plan')} fullWidth maxWidth={isDialogFullscreen('plan') ? false : 'sm'}>
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
            <Button onClick={() => setIsPlanModalOpen(false)} disabled={planLoading}>Cancel</Button>
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
        <Dialog open={isBundleSelectorOpen} onClose={() => setIsBundleSelectorOpen(false)} fullScreen={isDialogFullscreen('bundleSelector')} fullWidth maxWidth={isDialogFullscreen('bundleSelector') ? false : 'sm'}>
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
            <Button onClick={() => setIsBundleSelectorOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                setIsBundleSelectorOpen(false);
                setIsBundleModalOpen(true);
              }}
              disabled={!selections.subStrand}
            >
              Continue
            </Button>
          </DialogActions>
        </Dialog>

        <LessonBundleForm
          open={isBundleModalOpen}
          onClose={() => setIsBundleModalOpen(false)}
          onSubmit={handleGenerateBundleSubmit}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          subStrandId={selections.subStrand}
          isLoading={isLoading}
        />
        {/* Learner Notes Options Dialog */}
        <Dialog open={isLearnerOptionsOpen} onClose={() => setIsLearnerOptionsOpen(false)} fullScreen={isDialogFullscreen('learnerOptions')} fullWidth maxWidth={isDialogFullscreen('learnerOptions') ? false : 'xs'}>
          <DialogTitleWithFullscreen title="Generate Learner Notes" isFullscreen={isDialogFullscreen('learnerOptions')} onToggle={() => toggleDialogFullscreen('learnerOptions')} />
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Choose how you want to generate learner notes:</Typography>
            <Stack spacing={2}>
              <Button variant="outlined" onClick={() => { setIsLearnerOptionsOpen(false); setIsLearnerFromLessonOpen(true); }}>
                From Lesson Note
              </Button>
              <Button variant="contained" onClick={() => { setIsLearnerOptionsOpen(false); resetSelections(); resetStrandForm(); setIsLearnerFromStrandOpen(true); }}>
                From Strands
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsLearnerOptionsOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Quiz Options Dialog */}
        <Dialog open={isQuizOptionsOpen} onClose={() => setIsQuizOptionsOpen(false)} fullScreen={isDialogFullscreen('quizOptions')} fullWidth maxWidth={isDialogFullscreen('quizOptions') ? false : 'xs'}>
          <DialogTitleWithFullscreen title="Generate Quiz" isFullscreen={isDialogFullscreen('quizOptions')} onToggle={() => toggleDialogFullscreen('quizOptions')} />
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Choose how you want to generate the quiz:</Typography>
            <Stack spacing={2}>
              <Button variant="outlined" onClick={() => { setIsQuizOptionsOpen(false); setIsQuizFromLessonOpen(true); }}>
                From Lesson Note
              </Button>
              <Button variant="contained" onClick={() => { setIsQuizOptionsOpen(false); resetSelections(); setQuizSelectedSubStrands([]); setIsQuizFromStrandOpen(true); }}>
                From Strands
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsQuizOptionsOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* My Lesson Notes flow */}
        <Dialog
          open={isMyLessonNotesOpen}
          onClose={() => {
            setIsMyLessonNotesOpen(false);
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
                            setIsMyLessonNotesOpen(false);
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
                setIsMyLessonNotesOpen(false);
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
          open={isMyLearnerNotesOpen}
          onClose={() => {
            setIsMyLearnerNotesOpen(false);
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
                            setIsMyLearnerNotesOpen(false);
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={note.status === 'published'}
                          onClick={() => {
                            dispatch(publishLearnerNote(note._id))
                              .unwrap()
                              .then(() => {
                                if (viewingNote?._id === note._id) {
                                  displayNote(null);
                                }
                                setSnackbar({ open: true, message: 'Learner note published to students.', severity: 'success' });
                              })
                              .catch((err) => {
                                setSnackbar({ open: true, message: err || 'Failed to publish learner note.', severity: 'error' });
                              });
                          }}
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
                setIsMyLearnerNotesOpen(false);
                setLearnerNotesClassFilter('');
                setLearnerNotesSubjectFilter('');
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* From Lesson Note flow */}
        <Dialog open={isLearnerFromLessonOpen} onClose={() => { setIsLearnerFromLessonOpen(false); setSelectedLessonForLearner(''); }} fullScreen={isDialogFullscreen('learnerFromLesson')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('learnerFromLesson') ? false : 'md'}>
          <DialogTitleWithFullscreen title="Generate Learner Note from an Existing Lesson Note" isFullscreen={isDialogFullscreen('learnerFromLesson')} onToggle={() => toggleDialogFullscreen('learnerFromLesson')} />
          <DialogContent tabIndex={0} sx={dialogBodySx}>
            <Typography variant="body2" sx={{ mb: 2 }}>Select a lesson note to convert into a learner-friendly note.</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Paper sx={{ maxHeight: 420, overflow: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <List>
                    {(lessonNotes || []).map((ln) => (
                      <ListItemButton
                        key={ln._id}
                        selected={selectedLessonForLearner === ln._id}
                        onClick={() => setSelectedLessonForLearner(ln._id)}
                        sx={selectableListItemSx}
                      >
                        <ListItemText
                          primary={ln.subStrand?.name || ln.title || 'Lesson Note'}
                          secondary={new Date(ln.createdAt).toLocaleString()}
                        />
                      </ListItemButton>
                    ))}
                    {(!lessonNotes || lessonNotes.length === 0) && (
                      <ListItem><ListItemText primary="No lesson notes found" /></ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, maxHeight: 520, overflow: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  {!selectedLessonForLearner ? (
                    <Typography variant="body2" color="text.secondary">Select a lesson note to preview its content here.</Typography>
                  ) : (
                    (() => {
                      const note = (lessonNotes || []).find(n => n._id === selectedLessonForLearner);
                      return note ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>Topic: {note.subStrand?.name || note.subStrand}</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Box dangerouslySetInnerHTML={{ __html: removeImageBlocks(note.content || '') }} sx={{ '& p': { lineHeight: 1.7 } }} />
                        </Box>
                      ) : (
                        <Typography>Selected note not available.</Typography>
                      );
                    })()
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setIsLearnerFromLessonOpen(false); setSelectedLessonForLearner(''); }} disabled={isLoading}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedLessonForLearner || isLoading}
              onClick={() => {
                if (!selectedLessonForLearner) return;
                // Dispatch generation
                dispatch(generateLearnerNote(selectedLessonForLearner)).unwrap().then((created) => {
                  setSnackbar({ open: true, message: 'Learner note generated (draft)!', severity: 'success' });
                  // show preview immediately
                  displayNote(created);
                  // close the selection dialog and clear selection
                  setIsLearnerFromLessonOpen(false);
                  setSelectedLessonForLearner('');
                  // refresh drafts
                  dispatch(getDraftLearnerNotes());
                }).catch((err) => {
                  setSnackbar({ open: true, message: err || 'Failed to generate learner note', severity: 'error' });
                });
              }}
            >
              {isLoading ? <CircularProgress size={18} /> : 'Generate Learner Note'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* From Strands flow */}
        <Dialog open={isLearnerFromStrandOpen} onClose={closeLearnerFromStrand} fullScreen={isDialogFullscreen('learnerFromStrand')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('learnerFromStrand') ? false : 'sm'}>
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
        <Dialog open={isQuizFromLessonOpen} onClose={() => setIsQuizFromLessonOpen(false)} fullScreen={isDialogFullscreen('quizFromLesson')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('quizFromLesson') ? false : 'md'}>
          <DialogTitleWithFullscreen title="Generate Quiz from a Lesson Note" isFullscreen={isDialogFullscreen('quizFromLesson')} onToggle={() => toggleDialogFullscreen('quizFromLesson')} />
          <DialogContent tabIndex={0} sx={dialogBodySx}>
            <Typography variant="body2" sx={{ mb: 2 }}>Select a lesson note to use as the source for the quiz.</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <Paper sx={{ maxHeight: 420, overflow: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <List>
                    {(lessonNotes || []).map((ln) => (
                      <ListItemButton
                        key={ln._id}
                        selected={selectedLessonForQuiz === ln._id}
                        onClick={() => setSelectedLessonForQuiz(ln._id)}
                        sx={selectableListItemSx}
                      >
                        <ListItemText
                          primary={ln.subStrand?.name || ln.title || 'Lesson Note'}
                          secondary={new Date(ln.createdAt).toLocaleString()}
                        />
                      </ListItemButton>
                    ))}
                    {(!lessonNotes || lessonNotes.length === 0) && (
                      <ListItem><ListItemText primary="No lesson notes found" /></ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, maxHeight: 520, overflow: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  {!selectedLessonForQuiz ? (
                    <Typography variant="body2" color="text.secondary">Select a lesson note to preview its content here.</Typography>
                  ) : (
                    (() => {
                      const note = (lessonNotes || []).find(n => n._id === selectedLessonForQuiz);
                      return note ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>Topic: {note.subStrand?.name || note.subStrand}</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Box dangerouslySetInnerHTML={{ __html: removeImageBlocks(note.content || '') }} sx={{ '& p': { lineHeight: 1.7 } }} />
                        </Box>
                      ) : (
                        <Typography>Selected note not available.</Typography>
                      );
                    })()
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setIsQuizFromLessonOpen(false); setSelectedLessonForQuiz(''); }} disabled={isLoading}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedLessonForQuiz || isLoading}
              onClick={handleGenerateQuizFromLesson}
            >
              {isLoading ? <CircularProgress size={18} /> : 'Generate Quiz'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Quiz From Strands */}
        <Dialog open={isQuizFromStrandOpen} onClose={() => setIsQuizFromStrandOpen(false)} fullScreen={isDialogFullscreen('quizFromStrand')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('quizFromStrand') ? false : 'sm'}>
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
            <Button onClick={() => setIsQuizFromStrandOpen(false)} disabled={isLoading}>Cancel</Button>
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
        <Dialog open={isMyQuizzesOpen} onClose={() => setIsMyQuizzesOpen(false)} fullScreen={isDialogFullscreen('myQuizzes')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('myQuizzes') ? false : 'md'}>
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
                          onClick={() => {
                            dispatch(getQuizById(quiz._id)).unwrap().then(() => {
                              setIsQuizViewOpen(true);
                            }).catch((err) => {
                              setSnackbar({ open: true, message: err || 'Failed to load quiz', severity: 'error' });
                            });
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            dispatch(deleteQuiz(quiz._id)).then(() => {
                              setSnackbar({ open: true, message: 'Quiz deleted!', severity: 'success' });
                            }).catch((err) => {
                              setSnackbar({ open: true, message: err || 'Failed to delete quiz', severity: 'error' });
                            });
                          }}
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
            <Button onClick={() => setIsMyQuizzesOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog
          open={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          fullScreen={isDialogFullscreen('analytics')}
          scroll="paper"
          fullWidth
          maxWidth={isDialogFullscreen('analytics') ? false : 'lg'}
        >
          <DialogTitleWithFullscreen title="Analytics" isFullscreen={isDialogFullscreen('analytics')} onToggle={() => toggleDialogFullscreen('analytics')} />
          <DialogContent tabIndex={0} sx={dialogBodySx}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={analyticsKpiCardSx}>
                  <Typography variant="caption" color="text.secondary">Lesson Notes</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{analyticsSummary.totalLessonNotes}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={analyticsKpiCardSx}>
                  <Typography variant="caption" color="text.secondary">Learner Notes</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{analyticsSummary.totalLearnerNotes}</Typography>
                  <Typography variant="body2" color="text.secondary">{analyticsSummary.publishedLearnerNotes} published • {analyticsSummary.draftOnlyLearnerNotes} draft</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={analyticsKpiCardSx}>
                  <Typography variant="caption" color="text.secondary">Quizzes Generated</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{analyticsSummary.totalQuizzes}</Typography>
                  <Typography variant="body2" color="text.secondary">{analyticsSummary.totalQuizAttempts} attempts</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={analyticsKpiCardSx}>
                  <Typography variant="caption" color="text.secondary">Average Quiz Score</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{Number(analyticsSummary.avgQuizScore).toFixed(1)}%</Typography>
                  <Typography variant="body2" color="text.secondary">{analyticsSummary.totalNoteViews} note views • {analyticsSummary.totalBundles} bundles</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>Recent Activity</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {analyticsSummary.last30Count} actions in the last 30 days
                  </Typography>
                  {analyticsSummary.recentActivity.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No recent activity yet.</Typography>
                  ) : (
                    <List sx={{ pt: 0 }}>
                      {analyticsSummary.recentActivity.map((entry, index) => (
                        <ListItem key={`${entry.type}-${entry.date}-${index}`} sx={{ px: 0, alignItems: 'flex-start' }}>
                          <ListItemText
                            primary={`${entry.type}: ${entry.title}`}
                            secondary={new Date(entry.date).toLocaleString()}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Top Topics</Typography>
                  {analyticsSummary.topTopics.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No topic data available yet.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {analyticsSummary.topTopics.map((topic) => (
                        <Box key={topic.name}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{topic.name}</Typography>
                            <Chip label={`${topic.count}`} size="small" color="primary" variant="outlined" />
                          </Box>
                          <Box sx={{ height: 8, borderRadius: 8, bgcolor: 'grey.200', overflow: 'hidden' }}>
                            <Box
                              sx={{
                                height: '100%',
                                bgcolor: 'primary.main',
                                width: `${Math.min(100, (topic.count / Math.max(...analyticsSummary.topTopics.map((item) => item.count))) * 100)}%`,
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAnalyticsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Note creation form modal */}

        {/* Quiz detail viewer */}
        <Dialog open={isQuizViewOpen} onClose={() => { setIsQuizViewOpen(false); }} fullScreen={isDialogFullscreen('quizView')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('quizView') ? false : 'md'}>
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
            <Button onClick={() => { setIsQuizViewOpen(false); }} >Close</Button>
          </DialogActions>
        </Dialog>

        <LessonNoteForm
          open={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          onSubmit={handleGenerateNoteSubmit}
          subStrandName={subStrands.find((s) => s._id === selections.subStrand)?.name || ''}
          subStrandId={selections.subStrand}
          isLoading={isLoading || planLoading}
          fullScreen={isDialogFullscreen('lessonNoteForm')}
          onToggleFullscreen={() => toggleDialogFullscreen('lessonNoteForm')}
        />
        <BundleResultViewer
          open={viewBundleResult}
          onClose={() => setViewBundleResult(false)}
          bundleData={bundleResult}
          onPublish={handlePublishBundle}
          fullScreen={isDialogFullscreen('bundleResultViewer')}
          onToggleFullscreen={() => toggleDialogFullscreen('bundleResultViewer')}
        />
        
        {/* Delete Confirmation */}
        <Dialog open={!!noteToDelete} onClose={() => setNoteToDelete(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to delete this note?</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteToDelete(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!noteToDelete?._id) return;
                dispatch(deleteLessonNote(noteToDelete._id))
                  .unwrap()
                  .then(() => {
                    if (viewingNote?._id === noteToDelete._id) {
                      displayNote(null);
                    }
                    setSnackbar({ open: true, message: 'Lesson note deleted.', severity: 'success' });
                  })
                  .catch((err) => {
                    setSnackbar({ open: true, message: err || 'Failed to delete lesson note.', severity: 'error' });
                  })
                  .finally(() => setNoteToDelete(null));
              }}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!learnerNoteToDelete} onClose={() => setLearnerNoteToDelete(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to delete this learner note?</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={() => setLearnerNoteToDelete(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!learnerNoteToDelete?._id) return;
                dispatch(deleteDraftLearnerNote(learnerNoteToDelete._id))
                  .unwrap()
                  .then(() => {
                    if (viewingNote?._id === learnerNoteToDelete._id) {
                      displayNote(null);
                    }
                    setSnackbar({ open: true, message: 'Learner note deleted.', severity: 'success' });
                  })
                  .catch((err) => {
                    setSnackbar({ open: true, message: err || 'Failed to delete learner note.', severity: 'error' });
                  })
                  .finally(() => setLearnerNoteToDelete(null));
              }}
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Note Preview */}
        <Dialog open={!!viewingNote} onClose={() => displayNote(null)} fullScreen={isDialogFullscreen('notePreview')} scroll="paper" fullWidth maxWidth={isDialogFullscreen('notePreview') ? false : 'md'}>
          <DialogTitleWithFullscreen title="Preview Lesson Note" isFullscreen={isDialogFullscreen('notePreview')} onToggle={() => toggleDialogFullscreen('notePreview')} />
          <DialogContent tabIndex={0} sx={{ bgcolor: 'grey.50', overflowY: 'auto' }}>
            <Paper elevation={0} sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Topic: {viewingNote?.subStrand?.name || viewingNote?.subStrand || ''}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{
                  '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 3, mb: 2 },
                  '& h3': { fontSize: '1.25rem', fontWeight: 600, mt: 2, mb: 1 },
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    my: 2,
                    '& td, & th': {
                      border: '1px solid #ddd',
                      padding: '12px',
                    },
                    '& th': { backgroundColor: '#f5f5f5', fontWeight: 600 },
                  },
                  '& p': { lineHeight: 1.7, mb: 1 },
                  '& ul, & ol': { pl: 3, mb: 2 },
                }}>
                {previewSegments.map((seg, idx) => {
                  if (seg.type === 'text') {
                    return (
                      <Box key={idx} dangerouslySetInnerHTML={{ __html: seg.html }} />
                    );
                  }
                  if (seg.type === 'image') {
                    // three states: undefined (loading), '' (no url/fail), string (url)
                    if (seg.imgUrl === undefined) {
                      return (
                        <Typography key={idx} variant="caption" color="text.secondary">
                          Loading image...
                        </Typography>
                      );
                    }
                    if (!seg.imgUrl) {
                      return null; // nothing to show
                    }
                    return (
                      <Box key={idx} sx={{ my: 2, textAlign: 'center' }}>
                        <img
                          src={seg.imgUrl}
                          alt={seg.meta?.title || ''}
                          style={{ maxWidth: '100%', height: 'auto' }}
                        />
                        {seg.meta?.title && (
                          <Typography variant="caption" display="block">{seg.meta.title}</Typography>
                        )}
                      </Box>
                    );
                  }
                  return null;
                })}
              </Box>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              startIcon={<Download />}
              endIcon={<ExpandMore />}
              onClick={handleOpenDownloadMenu}
              disabled={!viewingNote}
            >
              Download
            </Button>
            <Menu
              anchorEl={downloadMenuAnchorEl}
              open={Boolean(downloadMenuAnchorEl)}
              onClose={handleCloseDownloadMenu}
            >
              <MenuItem onClick={() => handleDownloadViewingNote('html')}>Download as HTML (.html)</MenuItem>
              <MenuItem onClick={() => handleDownloadViewingNote('doc')}>Download as Word (.doc)</MenuItem>
              <MenuItem onClick={() => handleDownloadViewingNote('txt')}>Download as Text (.txt)</MenuItem>
            </Menu>
            <Button onClick={() => displayNote(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default TeacherDashboard;