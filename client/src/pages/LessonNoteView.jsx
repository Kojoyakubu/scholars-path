import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // ✅ allows <br> to render correctly

// MUI Components
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
import HTMLtoDOCX from 'html-docx-js-typescript';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector(
    (state) => state.teacher
  );

  // Fetch lesson note
  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    return () => {
      dispatch(resetCurrentNote());
    };
  }, [dispatch, noteId]);

  // --- PDF DOWNLOAD HANDLER ---
  const handleDownloadPdf = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element || !currentNote) return;

    if (!window.html2pdf) {
      alert('PDF library not loaded. Please refresh and try again.');
      return;
    }

    const filename = 'lesson_note.pdf';
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };

    window.html2pdf().set(opt).from(element).save();
  }, [currentNote]);

  // --- WORD DOWNLOAD HANDLER ---
  const handleDownloadWord = useCallback(() => {
    try {
      const element = document.getElementById('note-content-container');
      if (!element || !currentNote) return;

      const html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8" /></head>
          <body>${element.innerHTML}</body>
        </html>
      `;
      const blob = HTMLtoDOCX(html);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'lesson_note.docx';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Word generation failed:', err);
      alert('Could not generate Word document. Please try again.');
    }
  }, [currentNote]);

  // --- Conditional Rendering ---
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

  // --- MAIN RENDER ---
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

          {/* Lesson Note Display */}
          <div id="note-content-container">
            <Box
              sx={{
                overflowX: 'auto',
                boxShadow: 1,
                borderRadius: 2,
                p: 2,
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Headers
                  h1: (props) => (
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{ fontWeight: 'bold', mt: 2 }}
                      {...props}
                    />
                  ),
                  h2: (props) => (
                    <Typography
                      variant="h5"
                      sx={{ mt: 3, mb: 1, color: 'primary.main', fontWeight: 600 }}
                      gutterBottom
                      {...props}
                    />
                  ),
                  h3: (props) => (
                    <Typography
                      variant="h6"
                      sx={{ mt: 2, mb: 1, color: 'text.secondary', fontWeight: 500 }}
                      gutterBottom
                      {...props}
                    />
                  ),
                  // Paragraphs
                  p: (props) => (
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ mb: 1.5, whiteSpace: 'pre-line', lineHeight: 1.6 }}
                      {...props}
                    />
                  ),
                  // Bold text
                  strong: (props) => (
                    <Box component="strong" sx={{ fontWeight: 'bold', color: 'text.primary' }} {...props} />
                  ),
                  // Table styling
                  table: (props) => (
                    <Box
                      component="table"
                      sx={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        mt: 3,
                        mb: 3,
                        '& th': {
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          fontWeight: 'bold',
                          border: '1px solid #c8e6c9',
                          padding: '12px',
                          textAlign: 'center',
                          fontSize: '0.95rem',
                        },
                        '& td': {
                          border: '1px solid #ddd',
                          padding: '12px',
                          verticalAlign: 'top',
                          width: '33%',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                        },
                        '& tr:nth-of-type(even)': {
                          backgroundColor: '#fafafa',
                        },
                      }}
                      {...props}
                    />
                  ),
                }}
              >
                {currentNote.content}
              </ReactMarkdown>
            </Box>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;
