import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getLessonNoteById, resetCurrentNote } from '../features/teacher/teacherSlice';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Box, Typography, Container, Paper, CircularProgress, Alert } from '@mui/material';

function LessonNoteView() {
  const dispatch = useDispatch();
  const { noteId } = useParams();

  const { currentNote, isLoading, isError, message } = useSelector((state) => state.teacher);

  useEffect(() => {
    dispatch(getLessonNoteById(noteId));
    // Cleanup function: reset the current note when the component unmounts
    return () => {
      dispatch(resetCurrentNote());
    };
  }, [dispatch, noteId]);

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <Typography variant="h4" gutterBottom {...props} />,
              h2: ({node, ...props}) => <Typography variant="h5" sx={{mt: 3, mb: 1}} gutterBottom {...props} />,
              h3: ({node, ...props}) => <Typography variant="h6" sx={{mt: 2}} gutterBottom {...props} />,
              p: ({node, ...props}) => <Typography variant="body1" paragraph {...props} />,
              ul: ({node, ...props}) => <ul style={{ paddingLeft: '20px' }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginBottom: '8px' }}><Typography variant="body1" component="span" {...props} /></li>,
            }}
          >
            {currentNote.content}
          </ReactMarkdown>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default LessonNoteView;