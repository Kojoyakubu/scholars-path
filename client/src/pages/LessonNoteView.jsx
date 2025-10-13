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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  // --- ROBUST PDF DOWNLOAD HANDLER WITH ERROR HANDLING ---
  const handleDownloadPdf = useCallback(() => {
    if (!currentNote) {
      alert('Lesson note data is not loaded yet.');
      return;
    }

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const FONT_SIZE_NORMAL = 11;
      const FONT_SIZE_SMALL = 9;
      const LEFT_MARGIN = 15;
      const LINE_HEIGHT = 1.5;
      let finalY = 20; // Start position

      // 1. Add Header
      const headerElement = document.getElementById('note-header');
      if (headerElement) {
          const headerText = headerElement.innerText;
          const lines = headerText.split('\n');

          doc.setFontSize(FONT_SIZE_NORMAL + 4);
          doc.setFont(undefined, 'bold');
          doc.text('TEACHER INFORMATION', LEFT_MARGIN, finalY);
          finalY += 10;

          doc.setFontSize(FONT_SIZE_NORMAL);
          doc.setFont(undefined, 'normal');

          lines.forEach(line => {
              if (line.trim()) {
                  const parts = line.split(':');
                  if (parts.length > 1) {
                      const label = parts[0].trim() + ':';
                      const value = parts.slice(1).join(':').trim();
                      
                      doc.setFont(undefined, 'bold');
                      doc.text(label, LEFT_MARGIN, finalY);

                      doc.setFont(undefined, 'normal');
                      const labelWidth = doc.getStringUnitWidth(label) * doc.getFontSize() / doc.internal.scaleFactor;
                      const valueLines = doc.splitTextToSize(value, doc.internal.pageSize.width - LEFT_MARGIN - labelWidth - 20);
                      doc.text(valueLines, LEFT_MARGIN + labelWidth + 2, finalY);
                      finalY += (valueLines.length * (FONT_SIZE_NORMAL * 0.35 * LINE_HEIGHT));
                  }
              }
          });
          finalY += 5;
      }

      // 2. Add Lesson Phases Table
      const tableElement = document.getElementById('lesson-phases-table');
      if (tableElement) {
        doc.autoTable({
          html: tableElement, // Pass the element directly
          startY: finalY,
          theme: 'grid',
          headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold', halign: 'center' },
          styles: { fontSize: FONT_SIZE_NORMAL - 1, cellPadding: 2.5, lineColor: [200, 200, 200], lineWidth: 0.1 },
          didDrawPage: (data) => {
            finalY = data.cursor.y;
          }
        });
      } else {
        console.warn('Lesson phases table element not found.');
      }

      // 3. Add Footer Content
      const footerElement = document.getElementById('note-footer');
      if (footerElement) {
          const footerText = footerElement.innerText;
          const splitText = doc.splitTextToSize(footerText, doc.internal.pageSize.width - (LEFT_MARGIN * 2));
          const textHeight = doc.getTextDimensions(splitText).h;
          
          if (finalY + textHeight + 20 > doc.internal.pageSize.height) {
              doc.addPage();
              finalY = 20;
          } else {
             finalY += 10;
          }
          doc.setFontSize(FONT_SIZE_NORMAL);
          doc.setFont(undefined, 'normal');
          doc.text(splitText, LEFT_MARGIN, finalY);
          finalY += textHeight;
      }

      // 4. Add Vetting/Signature section
      if (finalY + 40 > doc.internal.pageSize.height) {
          doc.addPage();
          finalY = 20;
      } else {
         finalY += 20;
      }
      doc.setFontSize(FONT_SIZE_SMALL);
      doc.text(`Facilitator: ${currentNote.teacher?.name || '________________'}`, LEFT_MARGIN, finalY);
      finalY += 10;
      doc.text('Vetted By: __________________________', LEFT_MARGIN, finalY);
      finalY += 10;
      doc.text('Signature: __________________________', LEFT_MARGIN, finalY);
      finalY += 10;
      doc.text('Date: __________________________', LEFT_MARGIN, finalY);

      // 5. Add Page Numbers and Footer Text
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(FONT_SIZE_SMALL - 1);
          doc.setTextColor(150);
          doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: 'center' });
      }
      doc.setPage(pageCount);
      doc.text('— End of Lesson Note —', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

      // 6. Save the PDF
      doc.save('lesson_note.pdf');

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please check the console for more details.");
    }
  }, [currentNote]);

  // --- WORD DOWNLOAD HANDLER (No changes needed) ---
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

  // Split note into sections
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
              <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>
                Download as PDF
              </Button>
              <Button variant="contained" color="secondary" startIcon={<DescriptionIcon />} onClick={handleDownloadWord}>
                Download as Word
              </Button>
            </Stack>
          </Box>

          {/* Content Display */}
          <div id="note-content-container">
            {/* Header Section */}
            <Box sx={{ mb: 3 }} id="note-header">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: (props) => (
                    <Typography variant="body1" sx={{ mb: 0.8, whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: 1.5 }} {...props} />
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
                      id="lesson-phases-table"
                      sx={{
                        width: '100%', borderCollapse: 'collapse',
                        '& th': { backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, border: '1px solid #c8e6c9', padding: '10px', textAlign: 'center', fontSize: '0.9rem' },
                        '& td': { border: '1px solid #ddd', padding: '12px', verticalAlign: 'top', whiteSpace: 'pre-wrap', fontSize: '0.9rem' },
                        '& tr:nth-of-type(even)': { backgroundColor: '#fafafa' },
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
            <Box sx={{ mt: 2 }} id="note-footer">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: (props) => (
                    <Typography variant="body1" sx={{ mb: 1, whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: 1.5 }} {...props} />
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