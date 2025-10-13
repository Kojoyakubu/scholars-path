import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Box, Typography, Container, Paper, CircularProgress, Alert,
  Button, Stack, Divider,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import HTMLtoDOCX from 'html-docx-js-typescript';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector(
    (state) => state.teacher
  );

  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    return () => {
      dispatch(resetCurrentNote());
    };
  }, [dispatch, noteId]);

  const handleDownloadPdf = useCallback(() => { /* Your existing PDF download logic */ }, [currentNote]);
  const handleDownloadWord = useCallback(() => { /* Your existing Word download logic */ }, [currentNote]);

  // This loading check now correctly prevents the code below it from running on null data
  if (isLoading || !currentNote) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{message}</Alert>
      </Container>
    );
  }

  // ✅ **FIX:** The content splitting logic is now moved here.
  // It will only run AFTER the checks above have passed, guaranteeing `currentNote` is not null.
  const content = currentNote.content;
  const tableStart = content.indexOf('| PHASE');
  const tableEnd = content.lastIndexOf('|');
  const header = content.substring(0, tableStart).trim();
  const table = content.substring(tableStart, tableEnd + 1).trim();
  const footer = content.substring(tableEnd + 1).trim();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          {/* Download Buttons */}
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Download Options
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPdf}
              >
                Download as PDF
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DescriptionIcon />}
                onClick={handleDownloadWord}
              >
                Download as Word
              </Button>
            </Stack>
          </Box>

          {/* Content Display */}
          <div id="note-content-container">
            {/* Header Section */}
            <Box id="note-header" sx={{ mb: 3 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {header}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Lesson Phases Table */}
            <Box id="note-table-container" sx={{ overflowX: 'auto', mb: 3 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {table}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Footer Section */}
            <Box id="note-footer" sx={{ mt: 2 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {footer}
              </ReactMarkdown>
            </Box>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;