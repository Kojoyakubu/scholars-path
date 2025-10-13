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
import autoTable from 'jspdf-autotable';

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
    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const marginX = 15;
        let finalY = 15;

        // --- 1. Header Section (Using a borderless table for perfect alignment) ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TEACHER INFORMATION', doc.internal.pageSize.width / 2, finalY, { align: 'center' });
        finalY += 8;

        const headerElement = document.getElementById('note-header');
        if (headerElement) {
            const headerText = headerElement.innerText;
            // Create an array of [label, value] pairs from the header text
            const headerRows = headerText.split('\n').filter(line => line.trim() !== '').map(line => {
                const parts = line.split(':');
                const label = parts[0] ? `${parts[0]}:` : '';
                const value = parts.slice(1).join(':').trim();
                return [label, value];
            });

            autoTable(doc, {
                startY: finalY,
                body: headerRows,
                theme: 'plain', // Use 'plain' theme for no borders
                styles: {
                    fontSize: 9,
                    cellPadding: { top: 0.5, right: 1, bottom: 0.5, left: 0 },
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 55 }, // Style for labels
                    1: { fontStyle: 'normal' }, // Style for values
                },
                didDrawPage: (data) => {
                    finalY = data.cursor.y;
                },
            });
            finalY = doc.lastAutoTable.finalY;
        }

        finalY += 5;

        // --- 2. Lesson Phases Table (With specific column widths) ---
        const tableElement = document.getElementById('lesson-phases-table');
        if (tableElement) {
            autoTable(doc, {
                html: tableElement,
                startY: finalY,
                theme: 'grid',
                headStyles: {
                    fillColor: [240, 240, 240],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center',
                    lineWidth: 0.1,
                    lineColor: [100, 100, 100],
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 2,
                    lineColor: [100, 100, 100],
                    lineWidth: 0.1,
                    valign: 'top',
                },
                // Define column widths to match the screenshot
                columnStyles: {
                    0: { cellWidth: '25%' }, // PHASE 1
                    1: { cellWidth: '50%' }, // PHASE 2 (Main)
                    2: { cellWidth: '25%' }, // PHASE 3
                },
                didDrawPage: (data) => {
                    finalY = data.cursor.y;
                },
            });
            finalY = doc.lastAutoTable.finalY || finalY;
        }

        finalY += 15; // Space before footer

        // --- 3. Signature Section (With correct side-by-side alignment) ---
        if (finalY + 20 > doc.internal.pageSize.height) { // Check if space is available
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const line = '................................................................';
        const facilitatorText = `Facilitator: ${line}`;
        const vettedByText = `Vetted By: ${line}`;
        
        // First row of signatures
        doc.text(facilitatorText, marginX, finalY);
        
        // Second row of signatures
        finalY += 12;
        doc.text(`Signature: ${line}`, marginX, finalY);
        
        // Vetted By section (aligned to the right, can be adjusted)
        const vettedByX = doc.internal.pageSize.width - marginX - doc.getTextWidth(vettedByText);
        // Reset Y to align with Facilitator
        doc.text(vettedByText, vettedByX, finalY - 12);
        doc.text(`Date: ${line}`, vettedByX, finalY);


        doc.save('lesson_note_revised.pdf');

    } catch (error) {
        console.error('PDF generation error:', error);
        alert('An error occurred while generating the PDF. Check the console for details.');
    }
}, []);

  const handleDownloadWord = useCallback(() => {
    const element = document.getElementById('note-content-container');
    if (!element) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${element.innerHTML}</body></html>`;
    const blob = HTMLtoDOCX(html);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lesson_note.docx';
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

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

  // Split content into header, table, footer
  const content = currentNote.content || '';
  const lines = content.split('\n');
  const tableStartIndex = lines.findIndex(
    (line) => line.trim().startsWith('|') && line.toLowerCase().includes('phase')
  );

  if (tableStartIndex === -1) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="warning">Could not parse the lesson note. No table found.</Alert>
      </Container>
    );
  }

  let tableEndIndex = tableStartIndex;
  for (let i = tableStartIndex + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) tableEndIndex = i;
    else break;
  }

  const header = lines.slice(0, tableStartIndex).join('\n');
  const table = lines.slice(tableStartIndex, tableEndIndex + 1).join('\n');
  const footer = lines.slice(tableEndIndex + 1).join('\n');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Download Options</Typography>
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

          <div id="note-content-container">
            <Box id="note-header">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {header}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box id="note-table-container" sx={{ overflowX: 'auto' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: (props) => (
                    <Box
                      component="table"
                      id="lesson-phases-table"
                      sx={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        '& th': { p: 1.5, border: '1px solid #ddd', backgroundColor: '#f2f2f2' },
                        '& td': { p: 1.5, border: '1px solid #ddd', verticalAlign: 'top' },
                      }}
                      {...props}
                    />
                  ),
                }}
              >
                {table}
              </ReactMarkdown>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box id="note-footer">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
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
