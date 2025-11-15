// /client/src/pages/Quiz.jsx
// 🎯 Student Quiz Taking Component - Scholar's Path
// Features: Multiple question types, timed quiz, progress tracking, results display

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Chip,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlagIcon from '@mui/icons-material/Flag';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HomeIcon from '@mui/icons-material/Home';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  // State management
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:5000/api/student/quiz/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load quiz');
        }

        const data = await response.json();
        console.log('Quiz data loaded:', data);
        
        setQuiz(data);
        
        // Initialize timer if quiz has time limit
        if (data.timeLimit) {
          setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message || 'Failed to load quiz');
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, quizSubmitted]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigate between questions
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Calculate score
  const calculateScore = () => {
    let correct = 0;
    let total = 0;

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question._id];
      
      if (question.type === 'mcq' || question.type === 'true-false') {
        total++;
        if (userAnswer === question.correctAnswer) {
          correct++;
        }
      } else if (question.type === 'short-answer') {
        total++;
        // For short answer, do case-insensitive comparison
        if (userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
          correct++;
        }
      }
      // Essay questions aren't auto-graded
    });

    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    const scoreData = calculateScore();
    setScore(scoreData);
    setQuizSubmitted(true);

    // TODO: Send results to backend
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`http://localhost:5000/api/student/quiz/${id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          score: scoreData.percentage,
          completedAt: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <CancelIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  // Results screen
  if (quizSubmitted && score) {
    return (
      <Container maxWidth="md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 4,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: score.percentage >= 70 ? 'success.main' : score.percentage >= 50 ? 'warning.main' : 'error.main',
                margin: '0 auto',
                mb: 3,
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 50 }} />
            </Avatar>

            <Typography variant="h4" gutterBottom fontWeight={700}>
              Quiz Completed! 🎉
            </Typography>

            <Box sx={{ my: 4 }}>
              <Typography variant="h2" color="primary" fontWeight={800}>
                {score.percentage}%
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                {score.correct} out of {score.total} correct
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {score.percentage >= 70 && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Excellent work! You've mastered this topic! 🌟
              </Alert>
            )}

            {score.percentage >= 50 && score.percentage < 70 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Good effort! Review the material and try again to improve your score.
              </Alert>
            )}

            {score.percentage < 50 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Keep practicing! Review the study notes and try again.
              </Alert>
            )}

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.reload()}
              >
                Retake Quiz
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  // Quiz taking screen
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz?.questions?.length) * 100;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {quiz?.title || 'Quiz'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {quiz?.subStrand?.name || 'Practice Quiz'}
              </Typography>
            </Box>
            {timeRemaining !== null && (
              <Chip
                icon={<TimerIcon />}
                label={formatTime(timeRemaining)}
                sx={{
                  bgcolor: 'white',
                  color: timeRemaining < 60 ? 'error.main' : 'primary.main',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}
              />
            )}
          </Box>
        </Paper>

        {/* Progress */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Question {currentQuestionIndex + 1} of {quiz?.questions?.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
        </Paper>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <QuizIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Chip
                      label={currentQuestion?.type?.toUpperCase().replace('-', ' ')}
                      size="small"
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="h6" fontWeight={600}>
                      {currentQuestion?.questionText}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Answer Options */}
                {currentQuestion?.type === 'mcq' && (
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={answers[currentQuestion._id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    >
                      {currentQuestion.options?.map((option, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: `2px solid ${answers[currentQuestion._id] === option ? theme.palette.primary.main : theme.palette.divider}`,
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderColor: theme.palette.primary.main,
                            },
                          }}
                          onClick={() => handleAnswerChange(currentQuestion._id, option)}
                        >
                          <FormControlLabel
                            value={option}
                            control={<Radio />}
                            label={option}
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Paper>
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}

                {currentQuestion?.type === 'true-false' && (
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={answers[currentQuestion._id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    >
                      {['True', 'False'].map((option) => (
                        <Paper
                          key={option}
                          elevation={0}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: `2px solid ${answers[currentQuestion._id] === option ? theme.palette.primary.main : theme.palette.divider}`,
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderColor: theme.palette.primary.main,
                            },
                          }}
                          onClick={() => handleAnswerChange(currentQuestion._id, option)}
                        >
                          <FormControlLabel
                            value={option}
                            control={<Radio />}
                            label={option}
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Paper>
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}

                {currentQuestion?.type === 'short-answer' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    variant="outlined"
                  />
                )}

                {currentQuestion?.type === 'essay' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    placeholder="Write your essay answer here..."
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    variant="outlined"
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <Typography variant="body2" color="text.secondary">
              {Object.keys(answers).length} of {quiz?.questions?.length} answered
            </Typography>

            {currentQuestionIndex < quiz?.questions?.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={<FlagIcon />}
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length === 0}
              >
                Submit Quiz
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default Quiz;