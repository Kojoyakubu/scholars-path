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

  // --- PDF DOWNLOAD HANDLER (Perfect A4 Layout) ---
  const handleDownloadPdf = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element || !currentNote) return;

    if (!window.html2pdf) {
      alert('PDF library not loaded. Please refresh and try again.');
      return;
    }

    const clone = element.cloneNode(true);

    // Force consistent A4 page layout
    clone.style.width = '210mm';
    clone.style.minHeight = '297mm';
    clone.style.margin = 'auto';
    clone.style.padding = '20mm';
    clone.style.backgroundColor = '#fff';
    clone.style.fontFamily = 'Arial, sans-serif';
    clone.style.fontSize = '11pt';
    clone.style.color = '#000';
    clone.style.lineHeight = '1.6';

    // Apply styles to tables
    clone.querySelectorAll('table').forEach((table) => {
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.pageBreakInside = 'avoid';
    });
    clone.querySelectorAll('th, td').forEach((cell) => {
      cell.style.border = '1px solid #555';
      cell.style.padding = '8px';
      cell.style.verticalAlign = 'top';
    });

    // Add clean footer with facilitator info (only once)
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="margin-top: 20mm; text-align: left; font-size: 10pt;">
        <strong>Facilitator:</strong> ${currentNote.teacher?.name || '________________'} <br/>
        <strong>Signature:</strong> __________________________ <br/>
        <strong>Date:</strong> __________________________
      </div>
      <div style="text-align:center; margin-top:10mm; font-size:9pt; color:#333;">
        — End of Lesson Note —
      </div>
    `;
    clone.appendChild(footer);

    // PDF configuration
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'lesson_note.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        letterRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    window.html2pdf().set(opt).from(clone).save();
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
          <body style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6;">
            ${element.innerHTML}
            <br/><br/>
            <strong>Facilitator:</strong> ${currentNote.teacher?.name || '________________'} <br/>
            <strong>Signature:</strong> __________________________ <br/>
            <strong>Date:</strong> __________________________
          </body>
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

  // Safely split the note
  const content = currentNote.content || '';
  const tableStart = content.indexOf('| PHASE');
  const tableEnd = content.lastIndexOf('|');
  const header = tableStart !== -1 ? content.substring(0, tableStart).trim() : content;
  const table = tableStart !== -1 ? content.substring(tableStart, tableEnd + 1).trim() : '';
  const footer = tableEnd !== -1 ? content.substring(tableEnd + 1).trim() : '';

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
            <Box sx={{ mb: 3 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {header}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ overflowX: 'auto', borderRadius: 2, mb: 3 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {table}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mt: 2 }}>
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
