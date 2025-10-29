// /client/src/pages/TakeQuiz.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../api/axios';

// Utility to color-highlight AI feedback dynamically
const highlightKeywords = (text) => {
  if (!text) return '';
  const patterns = [
    { regex: /\b(excellent|great|strong|amazing|outstanding|well done)\b/gi, color: '#2E7D32' }, // earthy green
    { regex: /\b(improve|could|needs|attention|try|focus)\b/gi, color: '#CDAA00' }, // deep gold
    { regex: /\b(recommended|suggests?|next step|consider)\b/gi, color: '#003366' }, // dark blue
  ];
  let result = text;
  patterns.forEach(({ regex, color }) => {
    result = result.replace(
      regex,
      (match) => `<span style="color:${color};font-weight:600">${match}</span>`
    );
  });
  return result;
};

// Inline AI card
const AIInsightsCard = ({ title, content }) => {
  if (!content) return null;
  return (
    <Paper
      sx={{ p: 3, mt: 4, borderLeft: '6px solid #2E7D32', borderRadius: 2, bgcolor: '#f9faf8' }}
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Typography variant="h6" sx={{ color: '#003366', fontWeight: 700 }} gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        dangerouslySetInnerHTML={{ __html: highlightKeywords(content) }}
      />
    </Paper>
  );
};

const TakeQuiz = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth || {});
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [aiInsights, setAiInsights] = useState('');
  const [aiError, setAiError] = useState('');

  // Load quiz questions
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get('/api/student/quiz/current');
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error('Failed to load quiz', err);
      }
    };
    fetchQuiz();
  }, []);

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Evaluate
      let correct = 0;
      questions.forEach((q) => {
        if (answers[q._id] === q.correctAnswer) correct++;
      });
      const total = questions.length;
      const wrong = total - correct;
      const scorePercent = Math.round((correct / total) * 100);
      setCorrectCount(correct);
      setWrongCount(wrong);
      setScore(scorePercent);
      setShowResult(true);

      // Fetch AI feedback based on performance
      try {
        const res = await api.post('/api/student/quiz/insights', {
          name: user?.fullName,
          score: scorePercent,
          totalQuestions: total,
          correctCount: correct,
          wrongCount: wrong,
        });
        setAiInsights(res?.data?.insight || res?.data?.message || '');
      } catch (aiErr) {
        console.error('AI feedback error', aiErr);
        setAiError(aiErr?.response?.data?.message || aiErr?.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!questions.length) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading quiz questions…</Typography>
      </Box>
    );
  }

  const currentQ = questions[current];
  const isLast = current === questions.length - 1;

  return (
    <Box sx={{ py: 8, bgcolor: theme.palette.background.default }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Take Quiz
        </Typography>

        {!showResult ? (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Question {current + 1} of {questions.length}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {currentQ?.question}
            </Typography>
            <Stack spacing={1}>
              {currentQ?.options?.map((opt, i) => (
                <Button
                  key={i}
                  variant={answers[currentQ._id] === opt ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleAnswer(currentQ._id, opt)}
                >
                  {opt}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
              <Button
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
                variant="outlined"
              >
                Previous
              </Button>
              {!isLast ? (
                <Button onClick={() => setCurrent((c) => c + 1)} variant="contained">
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit'}
                </Button>
              )}
            </Stack>
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Quiz Results
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              Score: {score}%
            </Typography>
            <Typography color="text.secondary">
              Correct: {correctCount} / {questions.length} &nbsp;|&nbsp; Wrong: {wrongCount}
            </Typography>

            {/* AI Feedback appears only after results */}
            {user && (
              <>
                {aiError ? (
                  <Typography color="error" sx={{ mt: 3 }}>
                    {aiError}
                  </Typography>
                ) : (
                  <AIInsightsCard
                    title={`Your Quiz Insights, ${user.fullName || 'Student'}`}
                    content={
                      aiInsights ||
                      'Analyzing your performance and generating personalized feedback...'
                    }
                  />
                )}
              </>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default TakeQuiz;
