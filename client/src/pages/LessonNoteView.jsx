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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion } from 'framer-motion';

// Redux thunks
import {
  getLessonNoteById,
  deleteLessonNote,
} from '../features/teacher/teacherSlice';

// Export helpers
import { downloadAsPdf, downloadAsWord } from '../utils/downloadHelper';

// Optional: render generated diagram images
import AiImage from '../components/AiImage';

const LessonNoteView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ FIX: Access currentNote instead of note
  const { currentNote, isLoading, isError, message } = useSelector((s) => s.teacher);

  useEffect(() => {
    console.log('📝 Loading lesson note with ID:', id);
    if (id) {
      dispatch(getLessonNoteById(id));
    }
  }, [dispatch, id]);

  const elementId = useMemo(() => `lesson-note-${id}`, [id]);

  const handleDownload = useCallback(
    (type) => {
      if (!currentNote) return;
      const topic = currentNote?.title || currentNote?.subStrand?.name || 'lesson_note';
      if (type === 'pdf') downloadAsPdf(elementId, topic);
      if (type === 'word') downloadAsWord(elementId, topic);
    },
    [currentNote, elementId]
  );

  const handleDelete = useCallback(async () => {
    if (!id) return;
    const ok = window.confirm('Delete this lesson note? This action is irreversible.');
    if (!ok) return;
    const res = await dispatch(deleteLessonNote(id));
    if (!res.error) navigate('/teacher/dashboard');
  }, [dispatch, id, navigate]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Typography mt={2} color="white">Loading lesson note…</Typography>
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box textAlign="center">
          <Typography color="white" variant="h6" mb={2}>
            Failed to load lesson note: {message}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/teacher/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  if (!currentNote) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box textAlign="center">
          <Typography color="white" variant="h6" mb={2}>
            Lesson note not found.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/teacher/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/teacher/dashboard')}
            sx={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Back to Dashboard
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => handleDownload('pdf')}
              sx={{
                background: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  background: 'rgba(255,255,255,1)',
                },
              }}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<DescriptionIcon />}
              onClick={() => handleDownload('word')}
              sx={{
                background: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  background: 'rgba(255,255,255,1)',
                },
              }}
            >
              Export Word
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleDelete}
              sx={{
                background: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  background: 'rgba(255,255,255,1)',
                },
              }}
            >
              Delete
            </Button>
          </Stack>
        </Stack>

        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {currentNote.title || `Lesson Note for ${currentNote.subStrand?.name || 'Topic'}`}
          </Typography>

          <Typography variant="caption" color="text.secondary" display="block" mb={3}>
            Created on {new Date(currentNote.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>

          <Box
            id={elementId}
            sx={{
              '& h1, & h2, & h3': { mt: 3, mb: 2, fontWeight: 700, color: '#333' },
              '& h1': { fontSize: '2rem' },
              '& h2': { fontSize: '1.5rem' },
              '& h3': { fontSize: '1.25rem' },
              '& p': { mb: 1.5, lineHeight: 1.8, color: '#555' },
              '& a': { color: '#667eea' },
              '& ul, & ol': { pl: 3, mb: 2 },
              '& li': { mb: 1 },
              '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
              '& th, & td': { border: '1px solid #e0e0e0', p: 1 },
              '& blockquote': {
                borderLeft: '4px solid #667eea',
                pl: 2,
                color: 'text.secondary',
                fontStyle: 'italic',
              },
              '& code': {
                background: '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.9em',
              },
              '& pre': {
                background: '#f5f5f5',
                p: 2,
                borderRadius: 2,
                overflow: 'auto',
              },
            }}
          >
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
              {currentNote.content || ''}
            </ReactMarkdown>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LessonNoteView;