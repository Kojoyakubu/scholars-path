// /client/src/components/QuizSeparated.jsx
// 🎯 Student Quiz Taking Component with Separated Question Types - Scholar's Path
// Part 1: Auto-graded MCQs and True/False (shown on dashboard)
// Part 2: Short Answer and Essay (for exercise books, answers viewable after submission)

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
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
  Tabs,
  Tab,
  Grid,
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
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GradingIcon from '@mui/icons-material/Grading';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const QuizSeparated = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  // State management
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Separate question types
  const [autoGradedQuestions, setAutoGradedQuestions] = useState([]); // MCQ and True/False
  const [manualQuestions, setManualQuestions] = useState([]); // Short Answer and Essay
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  // Submission states
  const [autoGradedSubmitted, setAutoGradedSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = Auto-graded, 1 = Manual
  const [showAnswers, setShowAnswers] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        
        const response = await api.get(`/api/student/quiz/${id}`);
        const data = response.data;
        
        console.log('Quiz data loaded:', data);
        
        setQuiz(data);
        
        // Separate questions by type
        // If question has no type field, treat questions with options as MCQ
        const autoGraded = data.questions?.filter(q => {
          if (q.type === 'mcq' || q.type === 'true-false') {
            return true;
          }
          // Fallback: if no type but has options, treat as MCQ
          if (!q.type && q.options && q.options.length > 0) {
            return true;
          }
          return false;
        }) || [];
        
        const manual = data.questions?.filter(q => 
          q.type === 'short-answer' || q.type === 'essay'
        ) || [];
        
        setAutoGradedQuestions(autoGraded);
        setManualQuestions(manual);
        
        console.log(`Separated: ${autoGraded.length} auto-graded, ${manual.length} manual questions`);
        console.log('Auto-graded questions:', autoGraded);
        console.log('Manual questions:', manual);
        
        // Initialize timer if quiz has time limit (only for auto-graded section)
        if (data.timeLimit && autoGraded.length > 0) {
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

  // Timer countdown (only for auto-graded section)
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || autoGradedSubmitted || activeTab !== 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitAutoGraded(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, autoGradedSubmitted, activeTab]);

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
    const currentQuestions = activeTab === 0 ? autoGradedQuestions : manualQuestions;
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Calculate score for auto-graded questions only
  const calculateAutoGradedScore = () => {
    let correct = 0;
    let total = autoGradedQuestions.length;

    autoGradedQuestions.forEach((question) => {
      const userAnswer = answers[question._id];
      
      if (question.type === 'mcq' || question.type === 'true-false') {
        if (userAnswer === question.correctAnswer) {
          correct++;
        }
      }
    });

    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0
    };
  };

  // Submit auto-graded section
  const handleSubmitAutoGraded = async () => {
    const scoreData = calculateAutoGradedScore();
    setScore(scoreData);
    setAutoGradedSubmitted(true);

    // Send results to backend
    try {
      // Only send auto-graded answers for scoring
      const autoGradedAnswers = {};
      autoGradedQuestions.forEach(q => {
        if (answers[q._id]) {
          autoGradedAnswers[q._id] = answers[q._id];
        }
      });
      
      await api.post(`/api/student/quiz/${id}/submit-auto-graded`, {
        answers: autoGradedAnswers,
        score: scoreData.percentage,
        completedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error submitting auto-graded quiz:', err);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setCurrentQuestionIndex(0); // Reset to first question in new section
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

  // Results screen for auto-graded section
  if (autoGradedSubmitted && activeTab === 0) {
    return (
      <Container maxWidth="md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Paper 
            elevation={3}
            sx={{
              p: 4,
              mt: 4,
              borderRadius: 3,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.success.main, 0.05)})`
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: score?.percentage >= 70 ? 'success.main' : score?.percentage >= 50 ? 'warning.main' : 'error.main',
                margin: '0 auto 16px'
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              Quiz Complete!
            </Typography>

            <Box sx={{ my: 4 }}>
              <Typography variant="h2" color="primary" fontWeight={700}>
                {score?.percentage}%
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                {score?.correct} out of {score?.total} correct
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), border: `2px solid ${theme.palette.success.main}` }}>
                  <CardContent>
                    <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {score?.correct}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Correct
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), border: `2px solid ${theme.palette.error.main}` }}>
                  <CardContent>
                    <CancelIcon sx={{ fontSize: 32, color: 'error.main' }} />
                    <Typography variant="h5" fontWeight={700} color="error.main">
                      {score?.total - score?.correct}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Incorrect
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {manualQuestions.length > 0 && (
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  📝 Written Questions Available
                </Typography>
                <Typography variant="body2">
                  This quiz also has {manualQuestions.length} short answer/essay question(s). 
                  Complete them in your exercise book, then view the answers below.
                </Typography>
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/dashboard')}
                size="large"
              >
                Back to Dashboard
              </Button>
              
              {manualQuestions.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<MenuBookIcon />}
                  onClick={() => setActiveTab(1)}
                  size="large"
                >
                  View Written Questions
                </Button>
              )}
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  // Main quiz taking screen
  const currentQuestions = activeTab === 0 ? autoGradedQuestions : manualQuestions;
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const progress = currentQuestions.length > 0 ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100 : 0;

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
            {timeRemaining !== null && activeTab === 0 && !autoGradedSubmitted && (
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

        {/* Section Tabs */}
        <Paper elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 600,
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GradingIcon />
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      Auto-Graded Questions
                    </Typography>
                    <Typography variant="caption">
                      {autoGradedQuestions.length} MCQs & True/False
                    </Typography>
                  </Box>
                </Box>
              }
              disabled={autoGradedSubmitted}
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuBookIcon />
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      Written Questions
                    </Typography>
                    <Typography variant="caption">
                      {manualQuestions.length} Short Answer & Essay
                    </Typography>
                  </Box>
                </Box>
              }
              disabled={!autoGradedSubmitted}
            />
          </Tabs>
        </Paper>

        {/* Info Alert for Manual Section */}
        {activeTab === 1 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              📚 Instructions for Written Questions
            </Typography>
            <Typography variant="body2">
              Complete these questions in your exercise book. After attempting all questions, 
              you can view the suggested answers to check your work.
            </Typography>
          </Alert>
        )}

        {/* No questions message */}
        {currentQuestions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {activeTab === 0 
                ? 'No auto-graded questions in this quiz' 
                : 'No written questions in this quiz'}
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Progress */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Question {currentQuestionIndex + 1} of {currentQuestions.length}
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
                key={`${activeTab}-${currentQuestionIndex}`}
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
                          label={(currentQuestion?.type || 'MCQ').toUpperCase().replace('-', ' ')}
                          size="small"
                          color="primary"
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="h6" fontWeight={600}>
                          {currentQuestion?.questionText || currentQuestion?.text || 'Question'}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Answer Options - Auto-graded Section */}
                    {activeTab === 0 && (
                      <>
                        {(currentQuestion?.type === 'mcq' || (!currentQuestion?.type && currentQuestion?.options)) && (
                          <FormControl component="fieldset" fullWidth>
                            <RadioGroup
                              value={answers[currentQuestion._id] || ''}
                              onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                            >
                              {currentQuestion.options?.map((option, index) => {
                                // Handle both string options and object options
                                const optionText = typeof option === 'string' ? option : option?.text;
                                const optionValue = typeof option === 'string' ? option : (option?._id || option?.text);
                                
                                return (
                                  <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      mb: 2,
                                      border: `2px solid ${answers[currentQuestion._id] === optionValue ? theme.palette.primary.main : theme.palette.divider}`,
                                      borderRadius: 2,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        borderColor: theme.palette.primary.main,
                                      },
                                    }}
                                    onClick={() => handleAnswerChange(currentQuestion._id, optionValue)}
                                  >
                                    <FormControlLabel
                                      value={optionValue}
                                      control={<Radio />}
                                      label={optionText}
                                      sx={{ width: '100%', m: 0 }}
                                    />
                                  </Paper>
                                );
                              })}
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
                      </>
                    )}

                    {/* Manual Section - Show questions and answers */}
                    {activeTab === 1 && (
                      <Box>
                        {currentQuestion?.type === 'short-answer' && (
                          <Box>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                ✍️ Write your answer in your exercise book
                              </Typography>
                            </Alert>
                            
                            {showAnswers && currentQuestion.correctAnswer && (
                              <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.1), border: `2px solid ${theme.palette.success.main}` }}>
                                <Typography variant="subtitle2" fontWeight={700} color="success.main" gutterBottom>
                                  ✓ Suggested Answer:
                                </Typography>
                                <Typography variant="body1">
                                  {currentQuestion.correctAnswer}
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        )}

                        {currentQuestion?.type === 'essay' && (
                          <Box>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                ✍️ Write your essay in your exercise book
                              </Typography>
                            </Alert>
                            
                            {showAnswers && currentQuestion.correctAnswer && (
                              <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.1), border: `2px solid ${theme.palette.success.main}` }}>
                                <Typography variant="subtitle2" fontWeight={700} color="success.main" gutterBottom>
                                  ✓ Suggested Answer / Key Points:
                                </Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {currentQuestion.correctAnswer}
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                {activeTab === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {Object.keys(answers).filter(id => autoGradedQuestions.find(q => q._id === id)).length} of {autoGradedQuestions.length} answered
                  </Typography>
                )}

                {activeTab === 1 && !showAnswers && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setShowAnswers(true)}
                  >
                    Show All Answers
                  </Button>
                )}

                {currentQuestionIndex < currentQuestions.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <>
                    {activeTab === 0 ? (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<FlagIcon />}
                        onClick={handleSubmitAutoGraded}
                        disabled={Object.keys(answers).filter(id => autoGradedQuestions.find(q => q._id === id)).length === 0}
                      >
                        Submit Auto-Graded Section
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/dashboard')}
                      >
                        Back to Dashboard
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
};

export default QuizSeparated;