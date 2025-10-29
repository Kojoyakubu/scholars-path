import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion } from 'framer-motion';

// Redux thunks expected in teacher slice
import {
  getLessonNoteById,
  deleteLessonNote,
  getAiInsights,
} from '../features/teacher/teacherSlice';

// export helpers
import { downloadAsPdf, downloadAsWord } from '../utils/downloadHelper';

// optional: render generated diagram images if your notes contain markers like [DIAGRAM: ...]
import AiImage from '../components/AiImage';

const LessonNoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { note, isLoading, error, aiInsights } = useSelector((s) => s.teacher);

  useEffect(() => {
    if (id) dispatch(getLessonNoteById(id));
    dispatch(getAiInsights({ endpoint: '/api/teacher/lesson/insights', params: { noteId: id } }));
  }, [dispatch, id]);

  const elementId = useMemo(() => `lesson-note-${id}`, [id]);

  const handleDownload = useCallback(
    (type) => {
      if (!note) return;
      const topic = note?.title || 'lesson_note';
      if (type === 'pdf') downloadAsPdf(elementId, topic);
      if (type === 'word') downloadAsWord(elementId, topic);
    },
    [note, elementId]
  );

  const handleDelete = useCallback(async () => {
    if (!id) return;
    const ok = window.confirm('Delete this lesson note? This action is irreversible.');
    if (!ok) return;
    const res = await dispatch(deleteLessonNote(id));
    if (!res.error) navigate(-1);
  }, [dispatch, id, navigate]);

  if (isLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading lesson note…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">Failed to load lesson note: {error}</Typography>
      </Box>
    );
  }

  if (!note) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="text.secondary">Lesson note not found.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">{note.title || 'Lesson Note'}</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => handleDownload('pdf')}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<DescriptionIcon />}
            onClick={() => handleDownload('word')}
          >
            Export Word
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={2}
        sx={{ p: 3, borderRadius: 2 }}
        component={motion.div}
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Box id={elementId} sx={{
          '& h1, & h2, & h3': { mt: 2, fontWeight: 700 },
          '& p': { mb: 1.2 },
          '& a': { color: 'primary.main' },
          '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
          '& th, & td': { border: '1px solid #e0e0e0', p: 1 },
          '& blockquote': { borderLeft: '4px solid #e0e0e0', pl: 2, color: 'text.secondary' },
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ node, ...props }) => {
                const text = node?.children?.[0]?.value || '';
                if (typeof text === 'string' && text.startsWith('[DIAGRAM:')) {
                  return <AiImage text={text} />;
                }
                return <p {...props} />;
              },
            }}
          >
            {note.content || ''}
          </ReactMarkdown>
        </Box>
      </Paper>

      {aiInsights && (
        <Paper
          sx={{ p: 3, mt: 4, borderLeft: '6px solid #6c63ff', borderRadius: 2 }}
          component={motion.div}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h6" gutterBottom>Teaching Insights</Typography>
          <Typography variant="body1" color="text.secondary" whiteSpace="pre-line">
            {aiInsights}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default LessonNoteView;
