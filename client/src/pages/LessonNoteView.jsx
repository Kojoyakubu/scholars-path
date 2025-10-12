import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import { motion } from 'framer-motion';

// Markdown renderer and plugins
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// MUI components
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
import HTMLtoDOCX from 'html-docx-js-typescript'; // For Word download

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

  // --- PDF DOWNLOAD ---
  const handleDownloadPdf = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element || !currentNote) return;

    if (!window.html2pdf) {
      alert('PDF generator not loaded. Please refresh and try again.');
      return;
    }

    const filename = `${(currentNote?.content?.split('\n')[1] || 'lesson-note')
      .replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(element).save();
  }, [currentNote]);

  // --- WORD DOWNLOAD ---
  const handleDownloadWord = useCallback(() => {
    try {
      const element = document.getElementById('note-content-container');
      if (!element || !currentNote) return;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              table { border-collapse: collapse; width: 100%; margin-top: 10px; }
              th, td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
              th { background: #f4f4f4; }
            </style>
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `;

      const blob = HTMLtoDOCX(html);
      const safeName = (currentNote?.content?.split('\n')[1] || 'lesson-note')
        .replace(/[^a-zA-Z0-9]/g, '_');

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${safeName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Word generation failed:', err);
      alert('Could not generate Word document. Please try again.');
    }
  }, [currentNote]);

  // --- Render States ---
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          {/* --- Header / Download Buttons --- */}
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

          {/* --- Lesson Note Display --- */}
          <div id="note-content-container">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]} // 👈 Allows embedded HTML like <br>, <strong>, etc.
              components={{
                h1: (props) => (
                  <Typography variant="h4" gutterBottom {...props} />
                ),
                h2: (props) => (
                  <Typography
                    variant="h5"
                    sx={{ mt: 3, mb: 1, color: 'primary.main' }}
                    gutterBottom
                    {...props}
                  />
                ),
                h3: (props) => (
                  <Typography
                    variant="h6"
                    sx={{ mt: 2, color: 'primary.dark' }}
                    gutterBottom
                    {...props}
                  />
                ),
                p: (props) => (
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ mb: 1.5, whiteSpace: 'pre-line' }}
                    {...props}
                  />
                ),
                table: (props) => (
                  <table
                    style={{
                      borderCollapse: 'collapse',
                      width: '100%',
                      marginTop: '15px',
                    }}
                    {...props}
                  />
                ),
                th: (props) => (
                  <th
                    style={{
                      border: '1px solid #ccc',
                      backgroundColor: '#f5f5f5',
                      padding: '8px',
                      textAlign: 'left',
                    }}
                    {...props}
                  />
                ),
                td: (props) => (
                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '8px',
                      verticalAlign: 'top',
                    }}
                    {...props}
                  />
                ),
                ul: (props) => (
                  <ul
                    style={{
                      paddingLeft: '20px',
                      marginTop: '8px',
                      marginBottom: '8px',
                    }}
                    {...props}
                  />
                ),
                li: (props) => (
                  <li style={{ marginBottom: '6px' }}>
                    <Typography variant="body1" component="span" {...props} />
                  </li>
                ),
              }}
            >
              {currentNote.content}
            </ReactMarkdown>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;
