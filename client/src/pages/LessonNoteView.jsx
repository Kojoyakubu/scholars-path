import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box, Typography, Container, Paper, CircularProgress, Alert,
  Button, Stack,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons/material/PictureAsPdf';
import DescriptionIcon from '@mui/icons/material/Description';
import HTMLtoDOCX from 'html-docx-js-typescript';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector(
    (state) => state.teacher
  );

  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    return () => { dispatch(resetCurrentNote()); };
  }, [dispatch, noteId]);

  // ✅ PDF DOWNLOAD HANDLER: Simplified for the new linear format
  const handleDownloadPdf = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element) return;
    if (!window.html2pdf) {
      alert('PDF library not loaded. Please refresh and try again.');
      return;
    }

    const printStyles = `
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.5; }
        h3, h4 { page-break-after: avoid; }
        p, li { page-break-inside: avoid; }
        strong { font-weight: bold; }
      </style>
    `;

    const printContent = `
      <!DOCTYPE html><html><head><meta charset="UTF-8" />${printStyles}</head>
      <body>${element.innerHTML}</body></html>
    `;

    const opt = {
      margin: 15,
      filename: 'lesson_note.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(printContent).save();
  }, []);

  // ✅ WORD DOWNLOAD HANDLER: Simplified for the new linear format
  const handleDownloadWord = useCallback(() => {
    try {
      const element = document.getElementById('note-content-container');
      if (!element) return;
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /></head><body>${element.innerHTML}</body></html>`;
      const blob = HTMLtoDOCX(html);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'lesson_note.docx';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Word generation failed:', err);
      alert('Could not generate Word document.');
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
              <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>Download as PDF</Button>
              <Button variant="contained" color="secondary" startIcon={<DescriptionIcon />} onClick={handleDownloadWord}>Download as Word</Button>
            </Stack>
          </Box>

          {/* ✅ SIMPLIFIED RENDER: No more splitting. Just render the whole document. */}
          <Box id="note-content-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentNote.content}
            </ReactMarkdown>
          </Box>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;