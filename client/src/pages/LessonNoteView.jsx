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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  // --- PDF DOWNLOAD HANDLER (Multi-page) ---
  const handleDownloadPdf = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element || !currentNote) return;

    // Add a temporary footer for PDF
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="page-break-before: always; text-align: left; font-size: 10pt; margin-top: 10mm;">
        <strong>Facilitator:</strong> ${currentNote.teacher?.name || '________________'} <br/>
        <strong>Vetted By:</strong> __________________________ <br/>
        <strong>Signature:</strong> __________________________ <br/>
        <strong>Date:</strong> __________________________
      </div>
      <div style="text-align:center; margin-top:5mm; font-size:9pt; color:#333;">
        — End of Lesson Note —
      </div>
    `;
    element.appendChild(footer);

    html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate height of one PDF page in pixels
      const pageHeightPx = (canvasWidth / pdfWidth) * pdfHeight;

      let position = 0;

      while (position < canvasHeight) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = Math.min(pageHeightPx, canvasHeight - position);
        const ctx = pageCanvas.getContext('2d');

        ctx.drawImage(
          canvas,
          0, position, canvasWidth, pageCanvas.height,
          0, 0, canvasWidth, pageCanvas.height
        );

        const pageData = pageCanvas.toDataURL('image/png');
        if (position > 0) pdf.addPage();
        pdf.addImage(pageData, 'PNG', 0, 0, pdfWidth, (pageCanvas.height * pdfWidth) / canvasWidth);

        position += pageHeightPx;
      }

      pdf.save('lesson_note.pdf');

      // Remove temporary footer
      element.removeChild(footer);
    }).catch(err => {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    });
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
  const footerContent = content.substring(tableEnd + 1).trim();

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
                      sx={{ mb: 0.8, whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: 1.5 }}
                      {...props}
                    />
                  ),
                  strong: (props) => (
                    <Box component="strong" sx={{ fontWeight: 600, color: 'text.primary' }} {...props} />
                  ),
                }}
              >
                {header}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Lesson Phases Table */}
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
                      sx={{ mb: 1, whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: 1.5 }}
                      {...props}
                    />
                  ),
                }}
              >
                {footerContent}
              </ReactMarkdown>
            </Box>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;
