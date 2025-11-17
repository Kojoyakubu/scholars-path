// /client/src/pages/TakeQuiz.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
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

// Answer Key Card Component
const AnswerKeyCard = ({ question, index }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <CardContent>
        {/* Question Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Chip 
            label={`Question ${index + 1}`} 
            size="small" 
            sx={{ mr: 2, fontWeight: 600 }}
          />
          {question.isCorrect ? (
            <Chip 
              icon={<CheckCircleIcon />} 
              label="Correct" 
              color="success" 
              size="small" 
            />
          ) : (
            <Chip 
              icon={<CancelIcon />} 
              label="Incorrect" 
              color="error" 
              size="small" 
            />
          )}
        </Box>

        {/* Question Text */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {question.text}
        </Typography>

        {/* Options */}
        <Stack spacing={1.5}>
          {question.options?.map((option, idx) => {
            const isCorrect = option.isCorrect;
            const isUserAnswer = question.userAnswer === option._id.toString();
            
            let bgColor = 'transparent';
            let borderColor = theme.palette.divider;
            let icon = null;
            
            if (isCorrect) {
              bgColor = 'rgba(46, 125, 50, 0.08)'; // Light green
              borderColor = theme.palette.success.main;
              icon = <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
            }
            
            if (isUserAnswer && !isCorrect) {
              bgColor = 'rgba(211, 47, 47, 0.08)'; // Light red
              borderColor = theme.palette.error.main;
              icon = <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />;
            }

            return (
              <Box
                key={idx}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: `2px solid ${borderColor}`,
                  bgcolor: bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                {icon && <Box>{icon}</Box>}
                <Typography 
                  variant="body1"
                  sx={{ 
                    flex: 1,
                    fontWeight: (isCorrect || isUserAnswer) ? 600 : 400 
                  }}
                >
                  {option.text}
                </Typography>
                {isUserAnswer && !isCorrect && (
                  <Chip label="Your answer" size="small" color="error" variant="outlined" />
                )}
                {isCorrect && (
                  <Chip label="Correct answer" size="small" color="success" variant="outlined" />
                )}
              </Box>
            );
          })}
        </Stack>

        {/* Explanation */}
        {question.explanation && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ bgcolor: 'rgba(0, 51, 102, 0.04)', p: 2.5, borderRadius: 1.5 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ color: '#003366', fontWeight: 700, mb: 1 }}
              >
                ✨ Explanation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {question.explanation}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const TakeQuiz = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams(); // Get quiz ID from URL
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
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [answerKey, setAnswerKey] = useState(null);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);

  // Load quiz questions using ID from URL
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log('Fetching quiz with ID:', id);
        const res = await api.get(`/api/student/quiz/${id}`);
        console.log('Quiz data received:', res.data);
        console.log('Questions array:', res.data.questions);
        console.log('First question:', res.data.questions?.[0]);
        console.log('First question options:', res.data.questions?.[0]?.options);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error('Failed to load quiz', err);
      }
    };
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Send answers to backend for scoring
      const answerArray = Object.keys(answers).map(questionId => ({
        questionId,
        selectedOption: answers[questionId]
      }));

      const res = await api.post(`/api/student/quiz/${id}/submit`, {
        answers: answerArray
      });

      // Backend returns the score and details
      const { score: scorePercent, correctCount: correct, wrongCount: wrong } = res.data;
      const total = questions.length;
      
      setCorrectCount(correct);
      setWrongCount(wrong);
      setScore(scorePercent);
      setShowResult(true);

      // Fetch AI feedback based on performance
      try {
        const aiRes = await api.post('/api/student/quiz/insights', {
          name: user?.fullName,
          score: scorePercent,
          totalQuestions: total,
          correctCount: correct,
          wrongCount: wrong,
        });
        setAiInsights(aiRes?.data?.insight || aiRes?.data?.message || '');
      } catch (aiErr) {
        console.error('AI feedback error', aiErr);
        setAiError(aiErr?.response?.data?.message || aiErr?.message);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAnswers = async () => {
    setIsLoadingAnswers(true);
    try {
      const res = await api.get(`/api/student/quiz/${id}/answers`);
      console.log('Answer key received:', res.data);
      setAnswerKey(res.data);
      setShowAnswerKey(true);
    } catch (err) {
      console.error('Failed to load answer key:', err);
      alert('Failed to load answer key. Please try again.');
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  const handleBackToResults = () => {
    setShowAnswerKey(false);
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

        {/* Quiz Taking View */}
        {!showResult && !showAnswerKey && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Question {current + 1} of {questions.length}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {currentQ?.text || currentQ?.question || currentQ?.questionText}
            </Typography>
            
            {/* Debug info */}
            {(!currentQ?.options || currentQ?.options?.length === 0) && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                No options loaded. Check console for details.
              </Typography>
            )}
            
            <Stack spacing={1}>
              {currentQ?.options?.map((opt, i) => {
                // Handle both string options and object options
                const optionText = typeof opt === 'string' ? opt : opt?.text;
                const optionValue = typeof opt === 'string' ? opt : opt?._id;
                
                console.log('Rendering option', i, ':', { opt, optionText, optionValue });
                
                return (
                  <Button
                    key={i}
                    variant={answers[currentQ._id] === optionValue ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => handleAnswer(currentQ._id, optionValue)}
                    fullWidth
                  >
                    {optionText || `Option ${i + 1}`}
                  </Button>
                );
              })}
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
        )}

        {/* Results View */}
        {showResult && !showAnswerKey && (
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

            {/* View Answers Button */}
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleViewAnswers}
                disabled={isLoadingAnswers}
                sx={{ minWidth: 200 }}
              >
                {isLoadingAnswers ? 'Loading...' : 'View Answers & Explanations'}
              </Button>
            </Box>

            {/* Back to Dashboard Button */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>
        )}

        {/* Answer Key View */}
        {showAnswerKey && answerKey && (
          <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToResults}
                sx={{ mb: 2 }}
              >
                Back to Results
              </Button>
              
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Answer Key with Explanations
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review your answers and the correct solutions below
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Score: ${answerKey.attemptPercentage}%`} 
                  color="primary" 
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  label={`Correct: ${answerKey.attemptScore}/${answerKey.attemptTotal}`} 
                  color="success" 
                />
                <Chip 
                  label={`Incorrect: ${answerKey.attemptTotal - answerKey.attemptScore}`} 
                  color="error" 
                />
              </Box>
            </Paper>

            {/* Questions with Answers */}
            {answerKey.questions?.map((question, index) => (
              <AnswerKeyCard 
                key={question._id || index} 
                question={question} 
                index={index} 
              />
            ))}

            {/* Back Button at bottom */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleBackToResults}
              >
                Back to Results
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default TakeQuiz;