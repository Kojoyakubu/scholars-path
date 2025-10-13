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
  const { currentNote, isLoading, isError, message } = useSelector((state) => state.teacher);

  useEffect(() => {
    if (noteId) {
      dispatch(getLessonNoteById(noteId));
    }
    return () => {
      dispatch(resetCurrentNote());
    };
  }, [dispatch, noteId]);

  // --- PDF DOWNLOAD HANDLER (robust, offscreen container, cleanup) ---
  const handleDownloadPdf = useCallback(async () => {
    try {
      const element = document.getElementById('note-content-container');
      if (!element || !currentNote) {
        alert('Nothing to export.');
        return;
      }
      if (!window.html2pdf) {
        alert('PDF library not loaded. Please refresh and try again.');
        return;
      }

      // Clone and style for A4 export
      const clone = element.cloneNode(true);

      // Apply print-safe inline styles
      clone.style.width = '210mm';
      clone.style.minHeight = '297mm';
      clone.style.boxSizing = 'border-box';
      clone.style.backgroundColor = '#ffffff';
      clone.style.fontFamily = 'Arial, sans-serif';
      clone.style.fontSize = '10pt';
      clone.style.lineHeight = '1.4';
      clone.style.color = '#000';
      clone.style.padding = '15mm 20mm';

      // Normalize tables and cells inside clone
      const tables = clone.querySelectorAll('table');
      tables.forEach((table) => {
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.pageBreakInside = 'avoid';
        table.style.marginBottom = '8pt';
      });
      const cells = clone.querySelectorAll('th, td');
      cells.forEach((c) => {
        c.style.border = '1px solid #333';
        c.style.padding = '6px';
        c.style.verticalAlign = 'top';
      });
      const heads = clone.querySelectorAll('h1,h2,h3,h4');
      heads.forEach((h) => {
        h.style.marginTop = '6pt';
        h.style.marginBottom = '4pt';
      });

      // Add small end-footer (optional); won't break if long
      const endFooter = document.createElement('div');
      endFooter.style.marginTop = '12mm';
      endFooter.style.textAlign = 'center';
      endFooter.style.fontSize = '9pt';
      endFooter.style.color = '#444';
      endFooter.textContent = '— End of Lesson Note —';
      clone.appendChild(endFooter);

      // Place clone in an offscreen wrapper (so html2pdf can render it)
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-100000px'; // offscreen
      wrapper.style.top = '0';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // html2pdf options tuned for A4
      const opt = {
        margin: [10, 10, 15, 10], // mm; top,right,bottom,left
        filename: 'lesson_note.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2, // good quality without extreme memory use
          useCORS: true,
          scrollY: 0,
          letterRendering: true,
          // dpi not always respected; scale is most reliable
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['css', 'legacy'] },
      };

      // Generate PDF, then remove wrapper
      await window.html2pdf().set(opt).from(wrapper).save();

      // Cleanup
      if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Could not generate PDF. See console for details.');
      // ensure any offscreen wrapper is removed if present
      const possibleWrappers = document.querySelectorAll('body > div');
      possibleWrappers.forEach((w) => {
        // best-effort cleanup: remove any wrapper that we might have left behind (safe heuristic)
        if (w && w.style && w.style.left === '-100000px') {
          try { w.remove(); } catch (e) { /* ignore */ }
        }
      });
    }
  }, [currentNote]);

  // --- WORD DOWNLOAD HANDLER ---
  const handleDownloadWord = useCallback(() => {
    try {
      const element = document.getElementById('note-content-container');
      if (!element || !currentNote) {
        alert('Nothing to export.');
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.4; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #333; padding: 6px; vertical-align: top; }
            </style>
          </head>
          <body>${element.innerHTML}</body>
        </html>
      `;

      const blob = HTMLtoDOCX(html);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'lesson_note.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Word generation failed:', err);
      alert('Could not generate Word document. Please try again.');
    }
  }, [currentNote]);

  // --- Loading / Error UI ---
  if (isLoading) {
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

  // content may not contain the '| PHASE' marker — handle safely
  const content = currentNote?.content || '';
  let header = content;
  let table = '';
  let footer = '';

  const marker = '| PHASE';
  const tableStart = content.indexOf(marker);
  if (tableStart !== -1) {
    // try to find the end of the table by finding the last line that starts and ends with |
    // simple heuristic: find last '|' in content and split there (like you had before),
    // but guard against negative index
    const tableEnd = content.lastIndexOf('|');
    if (tableEnd > tableStart) {
      header = content.substring(0, tableStart).trim();
      table = content.substring(tableStart, tableEnd + 1).trim();
      footer = content.substring(tableEnd + 1).trim();
    } else {
      // fallback: don't split
      header = content;
      table = '';
      footer = '';
    }
  } else {
    header = content;
    table = '';
    footer = '';
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          {/* Download Options */}
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Download Options
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPdf}
                disabled={!currentNote}
              >
                Download as PDF
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DescriptionIcon />}
                onClick={handleDownloadWord}
                disabled={!currentNote}
              >
                Download as Word
              </Button>
            </Stack>
          </Box>

          {/* Note Content */}
          <div id="note-content-container">
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: (props) => (
                    <Typography
                      variant="body1"
                      sx={{ mb: 0.8, whiteSpace: 'pre-line', fontSize: '10pt', lineHeight: 1.4 }}
                      {...props}
                    />
                  ),
                  strong: (props) => (
                    <Box component="strong" sx={{ fontWeight: 600 }} {...props} />
                  ),
                }}
              >
                {header}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Table (if present) */}
            {table ? (
              <Box sx={{ overflowX: 'auto', borderRadius: 2, mb: 3 }}>
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
                            padding: '8px',
                            textAlign: 'center',
                          },
                          '& td': {
                            border: '1px solid #ddd',
                            padding: '10px',
                            verticalAlign: 'top',
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
                  {table}
                </ReactMarkdown>
              </Box>
            ) : null}

            <Divider sx={{ mb: 3 }} />

            {/* Footer */}
            <Box sx={{ mt: 2 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: (props) => (
                    <Typography
                      variant="body1"
                      sx={{ mb: 1, whiteSpace: 'pre-line', fontSize: '10pt', lineHeight: 1.4 }}
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
