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

  const handleDownloadPdf = useCallback(() => {
    const headerEl = document.getElementById('note-header');
    const tableEl = document.getElementById('note-table-container');
    const footerEl = document.getElementById('note-footer');

    if (!headerEl || !tableEl || !footerEl) {
      alert('Content is not ready for download. Please wait a moment and try again.');
      return;
    }
    if (!window.html2pdf) {
      alert('PDF library not loaded. Please refresh and try again.');
      return;
    }

    const printStyles = `
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.5; color: #000; }
        h3, h4 { page-break-after: avoid; }
        table { width: 100%; border-collapse: collapse; page-break-inside: auto; font-size: 9.5pt; }
        tr { page-break-inside: avoid; }
        th, td { border: 1px solid #333; padding: 6px; text-align: left; vertical-align: top; }
        th { background-color: #f0f0f0; font-weight: bold; }
        strong { font-weight: bold; }
        p { page-break-inside: avoid; }
      </style>
    `;

    const printContent = `
      <!DOCTYPE html><html><head><meta charset="UTF-8" />${printStyles}</head>
      <body>
        ${headerEl.innerHTML}
        <br/>
        ${tableEl.innerHTML}
        <br/>
        ${footerEl.innerHTML}
      </body></html>
    `;

    const opt = {
      margin: 15,
      filename: 'lesson_note.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, dpi: 300 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(printContent).save();
  }, [currentNote]);

  const handleDownloadWord = useCallback(() => {
    try {
      const headerEl = document.getElementById('note-header');
      const tableEl = document.getElementById('note-table-container');
      const footerEl = document.getElementById('note-footer');
      if (!headerEl || !tableEl || !footerEl) return;

      const html = `
        <!DOCTYPE html><html><head><meta charset="UTF-8" /></head>
        <body>
            ${headerEl.innerHTML}
            <br/>
            ${tableEl.innerHTML}
            <br/>
            ${footerEl.innerHTML}
        </body></html>
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

  // This guard clause is critical. It ensures the code below only runs when data is ready.
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

  // ✅ **THE FIX:** The content splitting logic is now moved here.
  // It will only execute AFTER the `isLoading` and `!currentNote` checks have passed,
  // guaranteeing `currentNote` is not null.
  const content = currentNote.content;
  const tableStart = content.indexOf('| PHASE');
  const tableEnd = content.lastIndexOf('|');
  const footerStart = content.lastIndexOf('---');

  const header = tableStart !== -1 ? content.substring(0, tableStart).trim() : content;
  const table = tableStart !== -1 && tableEnd !== -1 ? content.substring(tableStart, tableEnd + 1).trim() : '';
  const footer = footerStart !== -1 ? content.substring(footerStart).replace('---', '').trim() : '';

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

          {/* This div is crucial for the download handlers to target the content */}
          <div id="note-content-container">
            {/* Header Section */}
            <Box id="note-header" sx={{ mb: 3 }}>
              <ReactMarkdown>{header}</ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Lesson Phases Table */}
            <Box id="note-table-container" sx={{ overflowX: 'auto', mb: 3 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{table}</ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Footer Section */}
            <Box id="note-footer" sx={{ mt: 2 }}>
              <ReactMarkdown>{footer}</ReactMarkdown>
            </Box>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;