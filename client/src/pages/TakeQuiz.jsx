import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getQuizDetails, submitQuiz, resetQuiz } from '../features/student/studentSlice';
import { motion } from 'framer-motion';

// --- MUI Imports ---
import {
  Box, Typography, Container, Button, Paper, CircularProgress,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function TakeQuiz() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentQuiz, quizResult, isLoading, isError, message } = useSelector((state) => state.student);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionId }

  useEffect(() => {
    dispatch(getQuizDetails(id));
    // Cleanup function to reset the specific quiz state when leaving the page
    return () => {
      dispatch(resetQuiz());
    };
  }, [dispatch, id]);

  const handleOptionChange = useCallback((questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId,
      selectedOptionId: answers[questionId],
    }));
    dispatch(submitQuiz({ quizId: id, answers: formattedAnswers }));
  }, [dispatch, id, answers]);

  // --- Render States ---

  if (isLoading || !currentQuiz) {
    return <Container sx={{ textAlign: 'center', mt: 10 }}><CircularProgress /></Container>;
  }

  if (isError) {
    return <Container sx={{ mt: 5 }}><Alert severity="error">{message}</Alert></Container>;
  }

  // View 1: Quiz has been submitted, show result
  if (quizResult) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ my: 10, p: 4, textAlign: 'center' }}>
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          </motion.div>
          <Typography variant="h4" gutterBottom>Quiz Complete!</Typography>
          <Typography variant="h5">Your Score: {quizResult.score} / {quizResult.totalQuestions}</Typography>
          <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 4 }}>Back to Dashboard</Button>
        </Paper>
      </Container>
    );
  }

  // View 2: Show the quiz questions
  return (
    <Container maxWidth="md">
      <Paper elevation={4} sx={{ my: 5, p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>{currentQuiz.title}</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {currentQuiz.questions.map((q, index) => (
            <FormControl key={q._id} component="fieldset" margin="normal" fullWidth>
              <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>{index + 1}. {q.text}</FormLabel>
              <RadioGroup name={q._id} value={answers[q._id] || ''} onChange={(e) => handleOptionChange(q._id, e.target.value)}>
                {q.options.map(opt => (
                  <FormControlLabel key={opt._id} value={opt._id} control={<Radio />} label={opt.text} />
                ))}
              </RadioGroup>
            </FormControl>
          ))}
          <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} disabled={Object.keys(answers).length !== currentQuiz.questions.length}>
            Submit Quiz
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default TakeQuiz;