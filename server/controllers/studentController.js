// /server/controllers/studentController.js

const asyncHandler = require('express-async-handler');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const StudentBadge = require('../models/studentBadgeModel');
const NoteView = require('../models/noteViewModel');
const { checkAndAwardQuizBadges } = require('../services/badgeService');
const aiService = require('../services/aiService');

// --- Helper Function: Score Calculation ---
const calculateQuizScore = (quiz, answers) => {
  const answerMap = new Map(
    answers.map(a => [a.questionId.toString(), a.selectedOptionId.toString()])
  );
  let score = 0;

  for (const question of quiz.questions) {
    const correctOption = question.options.find(o => o.isCorrect);
    const userAnswerId = answerMap.get(question._id.toString());
    if (correctOption && userAnswerId === correctOption._id.toString()) {
      score++;
    }
  }
  return score;
};

// ============================================================================
// 🎓 Student Controllers
// ============================================================================

// @desc  Get learner notes for a sub-strand
// @route GET /api/student/learner-notes
const getLearnerNotes = asyncHandler(async (req, res) => {
  const notes = await LearnerNote.find({
    school: req.user.school,
    status: 'published',
  });
  res.json(notes);
});

// @desc  Get quizzes for a sub-strand
// @route GET /api/student/quizzes/:subStrandId
const getQuizzes = asyncHandler(async (req, res) => {
  const subStrand = await SubStrand.findById(req.params.subStrandId).populate({
    path: 'strand',
    select: 'subject',
  });

  if (!subStrand || !subStrand.strand || !subStrand.strand.subject) {
    return res.json([]);
  }

  const quizzes = await Quiz.find({
    subject: subStrand.strand.subject,
    school: req.user.school,
  });
  res.json(quizzes);
});

// @desc  Get resources for a sub-strand
// @route GET /api/student/resources
const getResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ school: req.user.school });
  res.json(resources);
});

// @desc  Get details of a single quiz (hide correct answers)
const getQuizDetails = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, school: req.user.school }).populate({
    path: 'questions',
    populate: { path: 'options', model: 'Option', select: '-isCorrect' },
  });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found or unavailable for your school.');
  }

  res.json(quiz);
});

// @desc  Submit a quiz and get AI-powered feedback
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    res.status(400);
    throw new Error('Answers must be an array.');
  }

  const quiz = await Quiz.findById(req.params.id).populate({
    path: 'questions',
    populate: { path: 'options', model: 'Option' },
  });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found.');
  }

  const score = calculateQuizScore(quiz, answers);

  const attempt = await QuizAttempt.create({
    quiz: quiz._id,
    student: req.user._id,
    school: req.user.school,
    score,
    totalQuestions: quiz.questions.length,
    answers,
  });

  // Asynchronously award badges
  checkAndAwardQuizBadges(req.user._id, attempt);

  // 🧠 Generate personalized AI feedback
  let feedback = '';
  try {
    const prompt = `
You are a Ghanaian educational coach.
Provide short motivational feedback for a student after a quiz.

Subject: ${quiz.subject || 'N/A'}
Quiz Title: ${quiz.title || 'Untitled'}
Total Questions: ${quiz.questions.length}
Score: ${score}
Performance: ${((score / quiz.questions.length) * 100).toFixed(1)}%

Keep it under 6 sentences, positive and constructive.`;

    const result = await aiService.generateTextCore({
      prompt,
      task: 'quizFeedback',
      temperature: 0.6,
      preferredProvider: 'claude',
    });

    feedback = result.text;
  } catch (err) {
    console.error('AI feedback failed:', err.message);
    feedback = 'Good effort! Keep practicing to improve.';
  }

  res.status(200).json({
    message: 'Quiz submitted successfully!',
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: ((score / quiz.questions.length) * 100).toFixed(1),
    feedback,
  });
});

// @desc  Get badges earned by logged-in student
const getMyBadges = asyncHandler(async (req, res) => {
  const myBadges = await StudentBadge.find({ student: req.user._id }).populate(
    'badge',
    'name description icon'
  );
  res.json(myBadges);
});

// @desc  Log that a student viewed a note
const logNoteView = asyncHandler(async (req, res) => {
  const note = await LearnerNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  const existingView = await NoteView.findOne({
    note: note._id,
    student: req.user._id,
  }).sort({ createdAt: -1 });

  const VIEW_COOLDOWN_MS = 60 * 1000;
  if (!existingView || new Date() - existingView.createdAt > VIEW_COOLDOWN_MS) {
    await NoteView.create({
      note: note._id,
      student: req.user._id,
      teacher: note.author,
      school: req.user.school,
    });
    res.status(201).json({ message: 'View logged' });
  } else {
    res.status(200).json({ message: 'View already logged recently' });
  }
});

// ============================================================================
// ✅ NEW ROUTES TO FIX YOUR ERROR
// ============================================================================

// @desc  Get the most recent quiz assigned to a student
// @route GET /api/student/quiz/current
const getCurrentQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ school: req.user.school })
    .sort({ createdAt: -1 })
    .limit(1);

  if (!quiz) {
    res.status(404);
    throw new Error('No quiz available currently.');
  }

  res.json(quiz);
});

// @desc  Generate AI insights after a quiz submission
// @route POST /api/student/quiz/insights
const getQuizInsights = asyncHandler(async (req, res) => {
  const { score, totalQuestions, subject, title } = req.body;
  const prompt = `
Generate a short motivational insight for a student who just completed a ${subject} quiz titled "${title}".
They scored ${score}/${totalQuestions}.
Focus on encouragement and next steps in learning.`;

  try {
    const result = await aiService.generateTextCore({
      prompt,
      task: 'quizInsight',
      temperature: 0.7,
      preferredProvider: 'claude',
    });
    res.json({ insight: result.text });
  } catch (err) {
    res.json({ insight: 'Keep studying and you’ll improve with each quiz!' });
  }
});

module.exports = {
  getLearnerNotes,
  getQuizzes,
  getResources,
  getQuizDetails,
  submitQuiz,
  getMyBadges,
  logNoteView,
  getCurrentQuiz,
  getQuizInsights,
};
