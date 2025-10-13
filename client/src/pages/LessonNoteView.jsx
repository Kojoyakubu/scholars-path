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

  // --- PDF DOWNLOAD HANDLER (Stable, Clean A4 Layout) ---
  const handleDownloadPdf = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element || !currentNote) return;

    if (!window.html2pdf) {
      alert('PDF library not loaded. Please refresh and try again.');
      return;
    }

    // Clone content
    const clone = element.cloneNode(true);

    // Apply consistent, print-perfect A4 styles
    clone.style.width = '210mm';
    clone.style.minHeight = '297mm';
    clone.style.margin = '0 auto';
    clone.style.padding = '20mm';
    clone.style.backgroundColor = '#fff';
    clone.style.fontFamily = 'Arial, sans-serif';
    clone.style.fontSize = '10pt';
    clone.style.lineHeight = '1.5';
    clone.style.color = '#000';
    clone.style.boxSizing = 'border-box';

    // Improve tables
    const tables = clone.querySelectorAll('table');
    tables.forEach((table) => {
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';
      table.style.fontSize = '9.5pt';
      table.style.pageBreakInside = 'avoid';
    });

    // Add borders to table cells
    const cells = clone.querySelectorAll('th, td');
    cells.forEach((cell) => {
      cell.style.border = '1px solid #444';
      cell.style.padding = '6px';
      cell.style.verticalAlign = 'top';
    });

    // Ensure headers and dividers are consistent
    const headings = clone.querySelectorAll('h1, h2, h3, h4');
    headings.forEach((h) => {
      h.style.marginTop = '8pt';
      h.style.marginBottom = '4pt';
      h.style.fontSize = '11pt';
    });

    // Footer (once, at the very end)
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="text-align:center; margin-top:25mm; font-size:9pt; color:#333;">
        — End of Lesson Note —
      </div>
    `;
    clone.appendChild(footer);

    // PDF configuration
    const filename = 'lesson_note.pdf';
    const opt = {
      margin: [10, 10, 15, 10], // top, right, bottom, left
      filename,
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
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.page-break',
        after: ['#footer'],
      },
    };

    // Trigger the PDF
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

  // Split note into header, table, and footer sections
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
            <Box sx={{ mb: 3 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: (props) => (
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 0.8,
                        whiteSpace: 'pre-line',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                      }}
                      {...props}
                    />
                  ),
                  strong: (props) => (
                    <Box
                      component="strong"
                      sx={{ fontWeight: 600, color: 'text.primary' }}
                      {...props}
                    />
                  ),
                }}
              >
                {header}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Lesson Phases Table */}
            <Box
              sx={{
                overflowX: 'auto',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: (props) => (
                    <Box
                      component="table"
                      sx={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        '& th': {
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          fontWeight: 700,
                          border: '1px solid #c8e6c9',
                          padding: '10px',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                        },
                        '& td': {
                          border: '1px solid #ddd',
                          padding: '12px',
                          verticalAlign: 'top',
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.9rem',
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
                {table}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Footer Section */}
            <Box sx={{ mt: 2 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: (props) => (
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 1,
                        whiteSpace: 'pre-line',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                      }}
                      {...props}
                    />
                  ),
                }}
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
