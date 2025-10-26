// /client/src/pages/LessonNoteView.jsx
import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// --- Redux Imports ---
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';

// --- MUI Imports ---
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

// --- Helper Import ---
import { downloadAsPdf, downloadAsWord } from '../utils/downloadHelper';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector(
    (state) => state.teacher
  );

  useEffect(() => {
    if (noteId) dispatch(getLessonNoteById(noteId));
    return () => dispatch(resetCurrentNote());
  }, [dispatch, noteId]);

  const handleDownload = useCallback((type) => {
    const elementId = 'note-content-container';
    const topic = 'lesson_note';
    if (type === 'pdf') downloadAsPdf(elementId, topic);
    else if (type === 'word') downloadAsWord(elementId, topic);
  }, []);

  if (isLoading || !currentNote)
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
      </Container>
    );

  if (isError)
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{message}</Alert>
      </Container>
    );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Download Options
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => handleDownload('pdf')}
              >
                Download as PDF
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DescriptionIcon />}
                onClick={() => handleDownload('word')}
              >
                Download as Word
              </Button>
            </Stack>
          </Box>

          {/* Content captured for PDF/Word */}
          <Box
            id="note-content-container"
            sx={{
              fontSize: '10px',
              lineHeight: 1.4,
              textAlign: 'left',
              '& *': { textAlign: 'left' },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 2,
              },
              '& th, & td': {
                border: '1px solid',
                borderColor: 'divider',
                p: 1.2,
                textAlign: 'left',
                verticalAlign: 'top',
              },
              '& th': {
                backgroundColor: 'action.hover',
                fontWeight: 'bold',
              },
              '& p': { marginBottom: '0.5em' },

              // Learning Phases table width distribution
              '& table.learning-phases': {
                width: '100%',
                tableLayout: 'fixed',
                '& th:nth-of-type(1), & td:nth-of-type(1)': { width: '25%' },
                '& th:nth-of-type(2), & td:nth-of-type(2)': { width: '50%' },
                '& th:nth-of-type(3), & td:nth-of-type(3)': { width: '25%' },
              },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {currentNote.content}
            </ReactMarkdown>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;
