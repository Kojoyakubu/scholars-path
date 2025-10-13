import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; // Use this to correctly process <br> tags from the AI
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
  const { currentNote, isLoading, isError, message } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    return () => { dispatch(resetCurrentNote()); };
  }, [dispatch, noteId]);

  // ✅ --- START: RE-ENGINEERED PDF DOWNLOAD HANDLER ---
  const handleDownloadPdf = useCallback(() => {
    const headerEl = document.getElementById('note-header');
    const tableEl = document.getElementById('note-table-container');
    const footerEl = document.getElementById('note-footer');

    if (!headerEl || !tableEl || !footerEl || !currentNote) {
      alert('Content is not ready for download. Please wait a moment and try again.');
      return;
    }
    if (!window.html2pdf) {
      alert('PDF library not loaded. Please refresh and try again.');
      return;
    }

    // 1. Define dedicated print styles for a professional A4 look
    const printStyles = `
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 10pt; /* Enforce the required font size */
          line-height: 1.5;
          color: #000;
        }
        h3, h4 {
          color: #333;
          margin-top: 1.2em;
          margin-bottom: 0.5em;
          page-break-after: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          page-break-inside: auto;
          font-size: 9.5pt;
        }
        tr {
          page-break-inside: avoid;
        }
        th, td {
          border: 1px solid #333;
          padding: 6px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        strong {
          font-weight: bold;
        }
        p {
          margin-bottom: 0.5em;
          page-break-inside: avoid;
        }
      </style>
    `;

    // 2. Assemble the clean HTML content for the PDF
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          ${printStyles}
        </head>
        <body>
          ${headerEl.innerHTML}
          <br/>
          ${tableEl.innerHTML}
          <br/>
          ${footerEl.innerHTML}
        </body>
      </html>
    `;

    // 3. Configure html2pdf to handle automatic paging
    const opt = {
      margin: 15,
      filename: 'lesson_note.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, dpi: 300 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // 4. Generate the PDF from the clean content
    window.html2pdf().set(opt).from(printContent).save();

  }, [currentNote]);
  // ✅ --- END: RE-ENGINEERED PDF DOWNLOAD HANDLER ---

  const handleDownloadWord = useCallback(() => { /* Your Word download logic remains the same */ }, [currentNote]);

  if (isLoading || !currentNote) { /* ... loading spinner ... */ }
  if (isError) { /* ... error message ... */ }

  // Split note content for rendering on the page
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
            <Typography variant="h6" gutterBottom>Download Options</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>Download as PDF</Button>
              <Button variant="contained" color="secondary" startIcon={<DescriptionIcon />} onClick={handleDownloadWord}>Download as Word</Button>
            </Stack>
          </Box>

          {/* This wrapper is targeted by the download functions */}
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