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
import { Box, Typography, Container, Paper, CircularProgress, Alert, Button, Stack } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

// --- Component & Helper Imports ---
import { downloadAsPdf, downloadAsWord } from '../utils/downloadHelper';
import AiImage from '../components/AiImage';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector((state) => state.teacher);

  useEffect(() => {
    if (noteId) {
      dispatch(getLessonNoteById(noteId));
    }
    return () => {
      dispatch(resetCurrentNote());
    };
  }, [dispatch, noteId]);

  const handleDownload = useCallback((type) => {
    const elementId = 'note-content-container';
    const topic = 'lesson_note';
    if (type === 'pdf') {
      downloadAsPdf(elementId, topic);
    } else if (type === 'word') {
      downloadAsWord(elementId, topic);
    }
  }, []);

  if (isLoading || !currentNote) {
    return <Container sx={{ textAlign: 'center', mt: 10 }}><CircularProgress /></Container>;
  }

  if (isError) {
    return <Container sx={{ mt: 5 }}><Alert severity="error">{message}</Alert></Container>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Download Options</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={() => handleDownload('pdf')}>Download as PDF</Button>
              <Button variant="contained" color="secondary" startIcon={<DescriptionIcon />} onClick={() => handleDownload('word')}>Download as Word</Button>
            </Stack>
          </Box>

          <Box id="note-content-container">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                p: ({ node, ...props }) => {
                  const text = node?.children[0]?.value || '';
                  if (text.startsWith('[DIAGRAM:')) {
                    return <AiImage text={text} />;
                  }
                  return <p {...props} />;
                },
                // ✅ THE FIX IS HERE: Add the 'learning-phases' class to the table
                table: ({ node, ...props }) => <table className="learning-phases" {...props} />
              }}
            >
              {currentNote.content}
            </ReactMarkdown>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;