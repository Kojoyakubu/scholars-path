// /client/src/pages/LessonNoteView.jsx (relevant sections)
import React from 'react';
import { Box, Container, Paper, Typography, Stack, Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { downloadAsPdf } from '../utils/downloadHelper';

const LessonNoteView = () => {
  const navigate = useNavigate();
  const { currentNote, isLoading } = useSelector((s) => s.teacher);

  if (isLoading || !currentNote) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => downloadAsPdf('printable-area', currentNote.subStrand?.name || 'LessonNote')}
        >
          Download A4 PDF
        </Button>
      </Stack>

      <Paper
        id="printable-area"
        elevation={0}
        sx={{
          p: '20mm', // Standard A4 visual padding
          bgcolor: 'white',
          color: 'black',
          minHeight: '297mm',
          width: '100%',
          boxSizing: 'border-box',
          // Applying the 12pt font specifically to the markdown content
          '& .markdown-body': {
            fontSize: '12pt !important',
            lineHeight: 1.6,
            '& p, & li': { mb: 2 },
            '& h1, & h2, & h3': { color: 'black', mt: 3, mb: 1 },
            '& table': { width: '100%', borderCollapse: 'collapse', mb: 2 },
            '& th, & td': { border: '1px solid #000', p: 1 },
          }
        }}
      >
        <Box className="markdown-body">
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
            {currentNote.subStrand?.name}
          </Typography>
          
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {currentNote.content || ''}
          </ReactMarkdown>
        </Box>
      </Paper>
    </Container>
  );
};

export default LessonNoteView;