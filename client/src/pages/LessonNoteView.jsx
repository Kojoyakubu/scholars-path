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
        let finalY = 20;

        // --- Teacher Information Section ---
        const teacherInfo = [
            { label: 'School:', value: currentNote.school?.name || 'Aperade Presby Basic School' },
            { label: 'Subject:', value: currentNote.subject || 'Computing' },
            { label: 'Strand:', value: currentNote.strand || 'Introduction to Computing' },
            { label: 'Sub-Strand:', value: currentNote.subStrand || 'Components of Computers & Computer Systems' },
            { label: 'Week:', value: currentNote.week || '7' },
            { label: 'Week Ending:', value: currentNote.weekEnding || 'Friday, 17th October, 2025' },
            { label: 'Day/Date:', value: currentNote.day || 'Monday, 13th October, 2025' },
            { label: 'Term:', value: currentNote.term || 'One' },
            { label: 'Class:', value: currentNote.class || 'JHS 1' },
            { label: 'Class Size:', value: currentNote.classSize || '45' },
            { label: 'Time/Duration:', value: currentNote.duration || '1hr 10 mins / 2 Periods' },
            { label: 'Content Standard (Code):', value: currentNote.contentStandard || 'B1.1.1.1: Demonstrate understanding of the basic components of a computer system.' },
            { label: 'Indicator (Code):', value: currentNote.indicator || 'B1.1.1.1.1: Identify and describe the difference between hardware and software components of a computer.' },
            { label: 'Performance Indicator:', value: currentNote.performanceIndicator || 'Learners will be able to identify and classify at least three examples of computer hardware and three examples of computer software with 80% accuracy.' },
            { label: 'Core Competencies:', value: currentNote.coreCompetencies || 'Communication & Collaboration, Critical Thinking & Problem Solving, Digital Literacy' },
            { label: 'Teaching & Learning Materials:', value: currentNote.tAndLMaterials || 'A functional computer (desktop or laptop), projector (if available), charts/posters showing different computer parts (monitor, keyboard, mouse, CPU, printer) and software icons (Microsoft Word, Google Chrome, Paint), pictures of hardware and software components, whiteboard/marker.' },
            { label: 'Reference:', value: currentNote.reference || 'NaCCA Computing Curriculum for JHS 1' }
        ];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TEACHER INFORMATION', doc.internal.pageSize.width / 2, finalY, { align: 'center' });
        finalY += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        teacherInfo.forEach(info => {
            const splitValue = doc.splitTextToSize(`${info.label} ${info.value}`, doc.internal.pageSize.width - (marginX * 2));
            doc.setFont('helvetica', 'bold');
            doc.text(info.label, marginX, finalY);
            doc.setFont('helvetica', 'normal');
            const labelWidth = doc.getTextWidth(info.label);
            doc.text(info.value, marginX + labelWidth + 1, finalY);
            finalY += (splitValue.length > 1 ? (splitValue.length * 5) + 2 : 6);
        });

        finalY += 5;

        // --- Lesson Phases Table ---
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
                    lineColor: [0, 0, 0],
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                },
                didDrawPage: (data) => {
                    finalY = data.cursor.y;
                },
            });
            finalY = doc.lastAutoTable.finalY;
        }

        finalY += 15;

        // --- Signature Section ---
        if (finalY + 30 > doc.internal.pageSize.height) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFontSize(10);
        doc.text('Facilitator: ................................................................', marginX, finalY);
        doc.text('Vetted By: ................................................................', doc.internal.pageSize.width / 2, finalY);

        finalY += 10;
        doc.text('Signature: .................................................................', marginX, finalY);
        doc.text('Date: .......................................................................', doc.internal.pageSize.width / 2, finalY);

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
