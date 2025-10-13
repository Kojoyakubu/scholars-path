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

  // --- FINAL PDF DOWNLOAD HANDLER ---
  const handleDownloadPdf = useCallback(() => {
    // 1. First, check if the necessary elements exist on the page.
    const headerElement = document.getElementById('note-header');
    const tableElement = document.getElementById('lesson-phases-table');

    if (!currentNote || !headerElement || !tableElement) {
      alert('Error: Cannot generate PDF because the lesson note content is not yet visible. Please wait a moment and try again.');
      console.error('PDF Generation Aborted: Missing required elements or data.');
      return;
    }

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      let finalY = 20;
      const LEFT_MARGIN = 15;
      
      // 2. Process Header
      doc.autoTable({
        html: headerElement,
        startY: finalY,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 1 },
        didParseCell: (data) => {
            // Make text bold if it's a label (e.g., "School:", "Subject:")
            if (data.cell.text[0] && data.cell.text[0].endsWith(':')) {
                data.cell.styles.fontStyle = 'bold';
            }
        },
        didDrawPage: (data) => { finalY = data.cursor.y; }
      });
      
      finalY += 5;

      // 3. Process Lesson Phases Table
      doc.autoTable({
        html: tableElement,
        startY: finalY,
        theme: 'grid',
        headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 10, cellPadding: 2.5, lineColor: [200, 200, 200], lineWidth: 0.1 },
        didDrawPage: (data) => { finalY = data.cursor.y; }
      });

      // 4. Process Footer Content
      const footerElement = document.getElementById('note-footer');
      if (footerElement) {
          const footerText = footerElement.innerText;
          const splitText = doc.splitTextToSize(footerText, doc.internal.pageSize.width - (LEFT_MARGIN * 2));
          const textHeight = doc.getTextDimensions(splitText).h;
          if (finalY + textHeight + 20 > doc.internal.pageSize.height) { doc.addPage(); finalY = 20; } 
          else { finalY += 10; }
          doc.setFontSize(11);
          doc.text(splitText, LEFT_MARGIN, finalY);
          finalY += textHeight;
      }

      // 5. Add Vetting/Signature section
      if (finalY + 40 > doc.internal.pageSize.height) { doc.addPage(); finalY = 20; } 
      else { finalY += 20; }
      doc.setFontSize(9);
      doc.text(`Facilitator: ${currentNote.teacher?.name || '________________'}`, LEFT_MARGIN, finalY);
      finalY += 10;
      doc.text('Vetted By: __________________________', LEFT_MARGIN, finalY);
      finalY += 10;
      doc.text('Signature: __________________________', LEFT_MARGIN, finalY);
      finalY += 10;
      doc.text('Date: __________________________', LEFT_MARGIN, finalY);

      // 6. Add Page Numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      // 7. Save the PDF
      doc.save('lesson_note.pdf');

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while building the PDF. Please check the console for details.");
    }
  }, [currentNote]);

  // --- WORD DOWNLOAD HANDLER (Unchanged) ---
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
    return <Container sx={{ textAlign: 'center', mt: 10 }}><CircularProgress /></Container>;
  }

  if (isError) {
    return <Container sx={{ mt: 5 }}><Alert severity="error">{message}</Alert></Container>;
  }

  // --- Safer Content Splitting ---
  const content = currentNote.content;
  const tableStart = content.indexOf('| PHASE');
  let header, table, footerContent;

  if (tableStart === -1) {
    // If the table marker isn't found, show an error instead of crashing.
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="warning">Could not parse the lesson note. The required table format was not found.</Alert>
      </Container>
    );
  } else {
    const tableEnd = content.lastIndexOf('|');
    header = content.substring(0, tableStart).trim();
    table = content.substring(tableStart, tableEnd + 1).trim();
    footerContent = content.substring(tableEnd + 1).trim();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Download Options</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>Download as PDF</Button>
              <Button variant="contained" color="secondary" startIcon={<DescriptionIcon />} onClick={handleDownloadWord}>Download as Word</Button>
            </Stack>
          </Box>

          <div id="note-content-container">
            {/* The IDs are essential for the download functions to find the content */}
            <Box id="note-header">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{header}</ReactMarkdown>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box id="note-table-container" sx={{ overflowX: 'auto' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: (props) => <Box component="table" id="lesson-phases-table" sx={{ width: '100%', borderCollapse: 'collapse', '& th': { p: 1.5, border: '1px solid #ddd', backgroundColor: '#f2f2f2' }, '& td': { p: 1.5, border: '1px solid #ddd', verticalAlign: 'top' } }} {...props} />,
                }}
              >
                {table}
              </ReactMarkdown>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box id="note-footer">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{footerContent}</ReactMarkdown>
            </Box>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;