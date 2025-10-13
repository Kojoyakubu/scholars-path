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
  const { currentNote, isLoading, isError, message } = useSelector(
    (state) => state.teacher
  );

  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    return () => {
      dispatch(resetCurrentNote());
    };
  }, [dispatch, noteId]);

  // --- PDF DOWNLOAD HANDLER ---
  const handleDownloadPdf = useCallback(() => {
    if (!currentNote) {
      alert('Content is not ready for download.');
      return;
    }
    if (!window.html2pdf) {
      alert('PDF library not loaded. Please refresh and try again.');
      return;
    }

    // 1. Split the raw Markdown content into logical parts.
    const content = currentNote.content;
    const tableStart = content.indexOf('| PHASE');
    const footerStart = content.lastIndexOf('---');
    const headerMarkdown = content.substring(0, tableStart).trim();
    const tableMarkdown = content.substring(tableStart, footerStart).trim();
    const footerMarkdown = content.substring(footerStart).replace('---', '').trim();

    // 2. Define print-specific CSS for a professional A4 document.
    const printStyles = `
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.4; color: #000; }
        strong { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; page-break-inside: auto; font-size: 9.5pt; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th, td { border: 1px solid #333; padding: 6px; text-align: left; vertical-align: top; }
        th { background-color: #f0f0f0; font-weight: bold; }
        br { display: block; margin-bottom: 0.5em; content: ""; }
      </style>
    `;

    // 3. Manually construct a clean HTML table from the Markdown table.
    let tableHtml = '<table>';
    const rows = tableMarkdown.split('\n').filter(row => row.startsWith('|'));
    rows.forEach((row, index) => {
      const tag = index === 0 ? 'th' : 'td';
      const cells = row.split('|').slice(1, -1); // Get content between pipes
      tableHtml += '<tr>';
      cells.forEach(cell => {
        const cellContent = cell.trim().replace(/<br>/g, '<br/>');
        tableHtml += `<${tag}>${cellContent}</${tag}>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</table>';

    // 4. Assemble the final HTML document for printing.
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          ${printStyles}
        </head>
        <body>
          <div>${headerMarkdown.replace(/\n/g, '<br/>')}</div>
          <br/>
          ${tableHtml}
          <br/>
          <div>${footerMarkdown.replace(/\n/g, '<br/>')}</div>
        </body>
      </html>
    `;

    // 5. Configure html2pdf to handle automatic multi-page splitting.
    const opt = {
      margin: 15,
      filename: 'lesson_note.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    window.html2pdf().set(opt).from(printContent).save();
  }, [currentNote]);

  // --- WORD DOWNLOAD HANDLER ---
  const handleDownloadWord = useCallback(() => {
    if (!currentNote) {
        alert('Content is not ready for download.');
        return;
    }
    try {
        const content = currentNote.content;
        const tableStart = content.indexOf('| PHASE');
        const footerStart = content.lastIndexOf('---');
        const headerMarkdown = content.substring(0, tableStart).trim();
        const tableMarkdown = content.substring(tableStart, footerStart).trim();
        const footerMarkdown = content.substring(footerStart).replace('---', '').trim();

        let tableHtml = '<table style="width:100%; border-collapse:collapse;">';
        const rows = tableMarkdown.split('\n').filter(row => row.startsWith('|'));
        rows.forEach((row, index) => {
            const tag = index === 0 ? 'th' : 'td';
            const cells = row.split('|').slice(1, -1);
            tableHtml += '<tr>';
            cells.forEach(cell => {
                const style = 'border: 1px solid black; padding: 5px;';
                const cellContent = cell.trim().replace(/<br>/g, '<br/>');
                tableHtml += `<${tag} style="${style}">${cellContent}</${tag}>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</table>';

        const html = `
            <!DOCTYPE html><html><head><meta charset="UTF-8" /></head>
            <body>
                <div style="font-family: Arial, sans-serif; font-size: 11pt;">
                    ${headerMarkdown.replace(/\n/g, '<br/>')}
                    <br/>
                    ${tableHtml}
                    <br/>
                    ${footerMarkdown.replace(/\n/g, '<br/>')}
                </div>
            </body></html>
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

  // Guard clause: Prevents rendering with null data, fixing the crash.
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

  // Content splitting logic, moved here to run only after data is confirmed to exist.
  const content = currentNote.content;
  const tableStart = content.indexOf('| PHASE');
  const footerStart = content.lastIndexOf('---');
  const header = tableStart !== -1 ? content.substring(0, tableStart).trim() : content;
  const table = tableStart !== -1 && footerStart !== -1 ? content.substring(tableStart, footerStart).trim() : '';
  const footer = footerStart !== -1 ? content.substring(footerStart).replace('---', '').trim() : '';

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

          {/* On-screen Content Display */}
          <div id="note-content-container">
            <Box sx={{ mb: 3 }}>
              <ReactMarkdown>{header}</ReactMarkdown>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ overflowX: 'auto', mb: 3 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {table}
              </ReactMarkdown>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mt: 2 }}>
              <ReactMarkdown>{footer}</ReactMarkdown>
            </Box>
          </div>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;