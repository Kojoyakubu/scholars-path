// frontend/src/views/LessonNoteView.jsx

import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

// 💡 NOTICE: jsPDF, jspdf-autotable, and HTMLtoDOCX are no longer imported.

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector(
    (state) => state.teacher
  );

  useEffect(() => {
    if (noteId) {
      dispatch(getLessonNoteById(noteId));
    }
    return () => {
      dispatch(resetCurrentNote());
    };
  }, [dispatch, noteId]);

  /**
   * ✨ IMPROVEMENT: Simplified download handler that calls the backend.
   * This approach is more robust and scalable.
   */
  const handleDownload = useCallback((format) => {
    // This assumes your API authentication (like a JWT in a cookie) is handled
    // automatically by the browser. If you use an "Authorization" header, you'll
    // need to use fetch/axios with responseType 'blob' to download the file.
    const downloadUrl = `/api/teacher/notes/${noteId}/download/${format}`;
    window.open(downloadUrl, '_blank');
  }, [noteId]);

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

  // The logic to split content into header, table, and footer remains useful for display purposes.
  const content = currentNote.content || '';
  const lines = content.split('\n');
  const tableStartIndex = lines.findIndex(
    (line) => line.trim().startsWith('|') && line.toLowerCase().includes('phase')
  );

  if (tableStartIndex === -1) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="warning">Could not parse the lesson note. No table found.</Alert>
      </Container>
    );
  }

  let tableEndIndex = tableStartIndex;
  for (let i = tableStartIndex + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) tableEndIndex = i;
    else break;
  }

  const header = lines.slice(0, tableStartIndex).join('\n');
  const table = lines.slice(tableStartIndex, tableEndIndex + 1).join('\n');
  const footer = lines.slice(tableEndIndex + 1).join('\n');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Download Options</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => handleDownload('pdf')} // ✨ CLEANER
              >
                Download as PDF
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DescriptionIcon />}
                // Update this once the backend supports DOCX
                onClick={() => alert('DOCX generation is not yet available.')}
                // onClick={() => handleDownload('docx')}
              >
                Download as Word
              </Button>
            </Stack>
          </Box>

          {/* Display logic remains the same. The component now only focuses on displaying data. */}
          <div id="note-content-container">
            <Box id="note-header">
              <ReactMarkdown children={header} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box id="note-table-container" sx={{ overflowX: 'auto' }}>
              <ReactMarkdown
                children={table}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: (props) => (
                    <Box
                      component="table"
                      sx={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        '& th': { p: 1.5, border: '1px solid #ddd', backgroundColor: '#f2f2f2' },
                        '& td': { p: 1.5, border: '1px solid #ddd', verticalAlign: 'top' },
                      }}
                      {...props}
                    />
                  ),
                }}
              />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box id="note-footer">
              <ReactMarkdown children={footer} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} />
            </Box>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;