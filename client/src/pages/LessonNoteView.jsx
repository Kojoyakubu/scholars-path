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
      const headerElement = document.getElementById('note-header');
      const tableElement = document.getElementById('lesson-phases-table');
      const footerElement = document.getElementById('note-footer');

      if (!headerElement || !tableElement) {
        alert('Cannot generate PDF — please wait for content to load.');
        return;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      let finalY = 15;
      const marginX = 14;

      // Add header (convert to text lines)
      const headerText = headerElement.innerText || '';
      const headerLines = doc.splitTextToSize(headerText, 180);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(headerLines, marginX, finalY);
      finalY += headerLines.length * 7;

      // Add table
      autoTable(doc, {
        html: tableElement,
        startY: finalY,
        theme: 'grid',
        headStyles: {
          fillColor: [46, 125, 50],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        styles: {
          fontSize: 9,
          cellPadding: 2.5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        didDrawPage: (data) => {
          finalY = data.cursor.y;
        },
      });

      finalY = doc.lastAutoTable?.finalY || finalY + 10;

      // Footer
      if (footerElement) {
        const footerText = footerElement.innerText;
        const splitText = doc.splitTextToSize(footerText, 180);
        doc.setFontSize(11);
        if (finalY + splitText.length * 7 > 280) {
          doc.addPage();
          finalY = 20;
        }
        doc.text(splitText, marginX, finalY + 10);
        finalY += splitText.length * 6;
      }

      // Signature lines
      if (finalY + 40 > 280) {
        doc.addPage();
        finalY = 20;
      }
      doc.setFontSize(10);
      doc.text(`Facilitator: ${currentNote.teacher?.name || '________________'}`, marginX, finalY + 10);
      doc.text('Vetted By: __________________________', marginX, finalY + 20);
      doc.text('Signature: __________________________', marginX, finalY + 30);
      doc.text('Date: __________________________', marginX, finalY + 40);

      // Page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save('lesson_note.pdf');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('An error occurred while generating the PDF. Check the console for details.');
    }
  }, [currentNote]);

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
