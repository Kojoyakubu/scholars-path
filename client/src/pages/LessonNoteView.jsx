import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

// --- THE FIX IS HERE ---
import { jsPDF } from 'jspdf'; // Changed to a named import
import html2canvas from 'html2canvas';
import HtmlToDocx from 'html-to-docx';

import {
    Box, Typography, Container, Paper, CircularProgress,
    Alert, Button, Stack
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();
  const { currentNote, isLoading, isError, message } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    return () => { dispatch(resetCurrentNote()); };
  }, [dispatch, noteId]);

  const handleDownloadPdf = useCallback(() => {
    const input = document.getElementById('note-content-container');
    if (!input || !currentNote) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const title = currentNote.content.split('\n')[1] || 'lesson-note';
      pdf.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    });
  }, [currentNote]);

  const handleDownloadWord = useCallback(async () => {
    const noteContainer = document.getElementById('note-content-container');
    if (!noteContainer || !currentNote) return;
    const fileBlob = await HtmlToDocx.getBlob(noteContainer.innerHTML);
    const url = URL.createObjectURL(fileBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const title = currentNote.content.split('\n')[1] || 'lesson-note';
    anchor.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [currentNote]);

  if (isLoading || !currentNote) {
    return <Container sx={{ textAlign: 'center', mt: 10 }}><CircularProgress /></Container>;
  }

  if (isError) {
    return <Container sx={{ mt: 5 }}><Alert severity="error">{message}</Alert></Container>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Download Options</Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPdf}>Download as PDF</Button>
              <Button variant="contained" color="secondary" startIcon={<DescriptionIcon />} onClick={handleDownloadWord}>Download as Word</Button>
            </Stack>
          </Box>
          <div id="note-content-container">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <Typography variant="h4" gutterBottom {...props} />,
                h2: ({node, ...props}) => <Typography variant="h5" sx={{mt: 3, mb: 1}} gutterBottom {...props} />,
                h3: ({node, ...props}) => <Typography variant="h6" sx={{mt: 2}} gutterBottom {...props} />,
                p: ({node, ...props}) => <Typography variant="body1" paragraph {...props} />,
                ul: ({node, ...props}) => <ul style={{ paddingLeft: '20px', marginTop: 0 }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: '8px' }}><Typography variant="body1" component="span" {...props} /></li>,
              }}
            >
              {currentNote.content}
            </ReactMarkdown>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;