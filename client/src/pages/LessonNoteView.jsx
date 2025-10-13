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
    if (!currentNote) return;

    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const marginX = 15;
        let finalY = 15;

        // --- 1. Header Section (as a two-column borderless table) ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TEACHER INFORMATION', doc.internal.pageSize.width / 2, finalY, { align: 'center' });
        finalY += 8;

        // Using the static data as requested, since it's provided during generation
        const headerData = [
            ['School:', 'Aperade Presby Basic School'],
            ['Class:', 'JHS 1'],
            ['Subject:', 'Computing'],
            ['Strand:', 'Introduction to Computing'],
            ['Sub-Strand:', 'Components of Computers & Computer Systems'],
            ['Week:', '7'],
            ['Week Ending:', 'Friday, 17th October, 2025'],
            ['Day/Date:', 'Monday, 13th October, 2025'],
            ['Term:', 'One'],
            ['Class Size:', '45'],
            ['Time/Duration:', '1hr 10 mins / 2 Periods'],
            ['Content Standard (Code):', 'B1.1.1.1: Demonstrate understanding of the basic components of a computer system.'],
            ['Indicator (Code):', 'B1.1.1.1.1: Identify and describe the difference between hardware and software components of a computer.'],
            ['Performance Indicator:', 'Learners will be able to identify and classify at least three examples of computer hardware and three examples of computer software with 80% accuracy.'],
            ['Core Competencies:', 'Communication & Collaboration, Critical Thinking & Problem Solving, Digital Literacy'],
            ['Teaching & Learning Materials:', 'A functional computer (desktop or laptop), projector (if available), charts/posters showing different computer parts... and software icons...'],
            ['Reference:', 'NaCCA Computing Curriculum for JHS 1'],
        ];

        autoTable(doc, {
            startY: finalY,
            body: headerData,
            theme: 'plain',
            styles: {
                fontSize: 9,
                cellPadding: { top: 0, right: 2, bottom: 1, left: 0 },
            },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 60 },
                1: { fontStyle: 'normal' },
            },
        });
        finalY = doc.lastAutoTable.finalY;

        // --- 2. Lesson Phases Table ---
        const tableElement = document.getElementById('lesson-phases-table');
        if (tableElement) {
            autoTable(doc, {
                html: tableElement,
                startY: finalY + 5,
                theme: 'grid',
                headStyles: {
                    fillColor: [240, 240, 240], textColor: [0, 0, 0],
                    fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: [100, 100, 100],
                },
                styles: {
                    fontSize: 9, cellPadding: 2, lineColor: [100, 100, 100],
                    lineWidth: 0.1, valign: 'top',
                },
                columnStyles: {
                    0: { cellWidth: '25%' },
                    1: { cellWidth: '50%' },
                    2: { cellWidth: '25%' },
                },
            });
            finalY = doc.lastAutoTable.finalY;
        }

        // --- 3. Signature Section ---
        finalY += 15;
        if (finalY + 20 > doc.internal.pageSize.height) {
            doc.addPage();
            finalY = 20;
        }
        
        const line = '.........................................................';
        doc.setFontSize(10);
        doc.text(`Facilitator: ${line}`, marginX, finalY);
        doc.text(`Vetted By: ${line}`, doc.internal.pageSize.width / 2 + 5, finalY);
        finalY += 12;
        doc.text(`Signature: ${line}`, marginX, finalY);
        doc.text(`Date: ${line}`, doc.internal.pageSize.width / 2 + 5, finalY);

        doc.save('lesson_note_final.pdf');

    } catch (error) {
        console.error('PDF generation error:', error);
        alert('An error occurred while generating the PDF. Check the console for details.');
    }
  }, [currentNote]); // Retained dependency for robustness with note content

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