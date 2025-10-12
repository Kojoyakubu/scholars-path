import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import HTMLtoDOCX from 'html-docx-js-typescript'; // ✅ New library

import {
  Box, Typography, Container, Paper, CircularProgress,
  Alert, Button, Stack
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    return () => { dispatch(resetCurrentNote()); };
  }, [dispatch, noteId]);

  // --- PDF DOWNLOAD HANDLER ---
  const handleDownloadPdf = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element || !currentNote) return;

    if (!window.html2pdf) {
      console.error('PDF generation library not loaded!');
      alert('Could not download PDF. Please refresh the page and try again.');
      return;
    }

    const title = currentNote.content.split('\n')[1] || 'lesson-note';
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const opt = {
      margin: 15,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save();
  }, [currentNote]);

  // --- WORD DOWNLOAD HANDLER (html-docx-js-typescript) ---
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
              h1, h2, h3 { color: #2e7d32; }
              p { margin-bottom: 8px; }
              h1, h2 { page-break-before: always; } /* optional page breaks */
            </style>
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `;

      const blob = HTMLtoDOCX(html);
      const safeName = (currentNote.content.split('\n')[1] || 'lesson-note')
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
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Download Options</Typography>
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

          <div id="note-content-container">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} />,
                h2: ({ node, ...props }) => <Typography variant="h5" sx={{ mt: 3, mb: 1 }} gutterBottom {...props} />,
                h3: ({ node, ...props }) => <Typography variant="h6" sx={{ mt: 2 }} gutterBottom {...props} />,
                p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} />,
                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', marginTop: 0 }} {...props} />,
                li: ({ node, ...props }) => (
                  <li style={{ marginBottom: '8px' }}>
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
