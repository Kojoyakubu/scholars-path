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

// --- NEW IMPORTS FOR BETTER PDF GENERATION ---
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

  // --- NEW & IMPROVED PDF DOWNLOAD HANDLER ---
  const handleDownloadPdf = useCallback(() => {
    if (!currentNote) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const FONT_SIZE_NORMAL = 11;
    const FONT_SIZE_SMALL = 9;
    const LEFT_MARGIN = 15;
    const LINE_HEIGHT = 1.5;

    // Helper function to parse and add header text from the DOM
    const addHeaderInfo = () => {
        const headerElement = document.getElementById('note-header');
        if (!headerElement) return 20; // Default start position

        const headerText = headerElement.innerText;
        const lines = headerText.split('\n');
        let yPosition = 20;

        doc.setFontSize(FONT_SIZE_NORMAL + 4);
        doc.setFont(undefined, 'bold');
        doc.text('TEACHER INFORMATION', LEFT_MARGIN, yPosition);
        yPosition += 10;

        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont(undefined, 'normal');

        lines.forEach(line => {
            if (line.trim()) {
                const parts = line.split(':');
                if (parts.length > 1) {
                    const label = parts[0].trim() + ':';
                    const value = parts.slice(1).join(':').trim();
                    
                    doc.setFont(undefined, 'bold');
                    doc.text(label, LEFT_MARGIN, yPosition);

                    doc.setFont(undefined, 'normal');
                    const labelWidth = doc.getStringUnitWidth(label) * doc.getFontSize() / doc.internal.scaleFactor;
                    
                    // Handle multi-line values
                    const valueLines = doc.splitTextToSize(value, doc.internal.pageSize.width - LEFT_MARGIN - labelWidth - 20);
                    doc.text(valueLines, LEFT_MARGIN + labelWidth + 2, yPosition);

                    // Adjust yPosition based on how many lines the value took
                    yPosition += (valueLines.length * (FONT_SIZE_NORMAL * 0.35 * LINE_HEIGHT));
                }
            }
        });
        return yPosition; // Return the Y position to continue from
    };

    // 1. Add Header
    let finalY = addHeaderInfo();
    finalY += 5; // Add some space before the table

    // 2. Add Lesson Phases Table using jspdf-autotable
    doc.autoTable({
        html: '#lesson-phases-table',
        startY: finalY,
        theme: 'grid',
        headStyles: {
            fillColor: [46, 125, 50], // A nice shade of green
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: FONT_SIZE_NORMAL - 1,
            cellPadding: 2.5,
            lineColor: [200, 200, 200], // Lighter grid lines
            lineWidth: 0.1,
        },
        didDrawPage: (data) => {
            // Update finalY in case the table spans multiple pages
            finalY = data.cursor.y;
        }
    });

    // 3. Add Footer Content (Remarks, Evaluation, etc.)
    const footerElement = document.getElementById('note-footer');
    if (footerElement) {
        const footerText = footerElement.innerText;
        doc.setFontSize(FONT_SIZE_NORMAL);
        doc.setFont(undefined, 'normal');
        
        // Check if there is enough space on the current page
        const splitText = doc.splitTextToSize(footerText, doc.internal.pageSize.width - (LEFT_MARGIN * 2));
        const textHeight = doc.getTextDimensions(splitText).h;
        if (finalY + textHeight + 20 > doc.internal.pageSize.height) {
            doc.addPage();
            finalY = 20; // Reset Y position on new page
        } else {
           finalY += 10; // Space after table 
        }

        doc.text(splitText, LEFT_MARGIN, finalY);
        finalY += textHeight;
    }

    // 4. Add Vetting/Signature section
    // Check for space before adding signature lines
    if (finalY + 40 > doc.internal.pageSize.height) {
        doc.addPage();
        finalY = 20;
    } else {
       finalY += 20; // More space before signature lines 
    }

    doc.setFontSize(FONT_SIZE_SMALL);
    doc.text(`Facilitator: ${currentNote.teacher?.name || '________________'}`, LEFT_MARGIN, finalY);
    finalY += 10;
    doc.text('Vetted By: __________________________', LEFT_MARGIN, finalY);
    finalY += 10;
    doc.text('Signature: __________________________', LEFT_MARGIN, finalY);
    finalY += 10;
    doc.text('Date: __________________________', LEFT_MARGIN, finalY);

    // 5. Add a final "End of Lesson Note" centered at the bottom of the last page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(FONT_SIZE_SMALL - 1);
        doc.setTextColor(150); // Gray color
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: 'center' });
    }
     doc.setPage(pageCount); // Go back to the last page
     doc.text('— End of Lesson Note —', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // 6. Save the PDF
    doc.save('lesson_note.pdf');

  }, [currentNote]);

  // --- WORD DOWNLOAD HANDLER (No changes needed here) ---
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
            {/* Header Section - ADDED ID */}
            <Box sx={{ mb: 3 }} id="note-header">
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

            {/* Lesson Phases Table - ADDED ID TO TABLE */}
            <Box sx={{ overflowX: 'auto', borderRadius: 2, mb: 3 }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: (props) => (
                    <Box
                      component="table"
                      id="lesson-phases-table" // ID ADDED HERE
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

            {/* Footer Section - ADDED ID */}
            <Box sx={{ mt: 2 }} id="note-footer">
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