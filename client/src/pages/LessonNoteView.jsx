import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box, Typography, Container, Paper, CircularProgress,
  Alert, Button, Stack
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import HTMLtoDOCX from 'html-docx-js-typescript';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    return () => {
      dispatch(resetCurrentNote());
    };
  }, [dispatch, noteId]);

  // --- PDF DOWNLOAD HANDLER (Footer only on last page) ---
  const handleDownloadPdf = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element || !currentNote) return;

    if (!window.html2pdf) {
      alert('PDF library not loaded. Please refresh and try again.');
      return;
    }

    const cloned = element.cloneNode(true);
    cloned.style.background = '#fff';
    cloned.style.padding = '20px';
    cloned.style.width = '210mm';
    cloned.style.minHeight = '297mm';
    cloned.style.fontSize = '11px';
    cloned.style.lineHeight = '1.5';

    const opt = {
      margin: [10, 10, 15, 10],
      filename: 'lesson_note.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowWidth: document.body.scrollWidth,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        putTotalPages: true,
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '#footer',
      },
    };

    window.html2pdf()
      .set(opt)
      .from(cloned)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        pdf.setPage(totalPages); // Footer only on last page
        pdf.setFontSize(9);
        pdf.setTextColor(100);
        pdf.text(`Page ${totalPages} of ${totalPages}`, 200, 290, { align: 'right' });
      })
      .save();
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
      const safeName = 'lesson-note'.replace(/[^a-zA-Z0-9]/g, '_');
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

  // --- LOADING & ERROR STATES ---
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
          {/* Header Section */}
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

          {/* Lesson Note Content */}
          <div id="note-content-container" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginTop: '1rem',
                      marginBottom: '1rem',
                      border: '1px solid #ccc',
                    }}
                    {...props}
                  />
                ),
                th: ({ node, ...props }) => (
                  <th
                    style={{
                      border: '1px solid #ccc',
                      backgroundColor: '#f0f0f0',
                      padding: '8px',
                      textAlign: 'left',
                      fontWeight: 'bold',
                    }}
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    style={{
                      border: '1px solid #ccc',
                      padding: '8px',
                      verticalAlign: 'top',
                    }}
                    {...props}
                  />
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
