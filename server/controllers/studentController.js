// /server/controllers/studentController.js

const asyncHandler = require('express-async-handler');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const StudentBadge = require('../models/studentBadgeModel');
const NoteView = require('../models/noteViewModel');
const User = require('../models/userModel');
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

// @desc  Get learner notes for a specific sub-strand
// @route GET /api/student/notes/:subStrandId
// @access Private/Student
const getLearnerNotes = asyncHandler(async (req, res) => {
  const { subStrandId } = req.params;
  
  console.log('📚 Fetching learner notes:', {
    subStrandId,
    school: req.user.school,
    student: req.user._id
  });

  // Find published notes for this sub-strand from teachers at the same school
  const notes = await LearnerNote.find({
    subStrand: subStrandId,
    school: req.user.school,
    status: 'published',
  })
  .populate('author', 'fullName email')
  .populate('subStrand', 'name')
  .sort({ createdAt: -1 });

  console.log(`✅ Found ${notes.length} published notes for sub-strand ${subStrandId}`);
  
  res.json(notes);
});

// ✅ NEW: Get all published learner notes accessible to the student
// @desc  Get all published learner notes for student's class
// @route GET /api/student/learner-notes/published
// @access Private/Student
const getPublishedLearnerNotes = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user.id).populate('class');

  if (!student || !student.class) {
    res.status(400);
    throw new Error('Student class information not found');
  }

  // Get all published learner notes for the student's school
  const publishedNotes = await LearnerNote.find({
    status: 'published',
    school: student.school,
  })
    .populate({
      path: 'subStrand',
      populate: {
        path: 'strand',
        populate: {
          path: 'subject',
          populate: {
            path: 'class',
          },
        },
      },
    })
    .populate('quiz', 'title')
    .populate('author', 'fullName')
    .sort({ createdAt: -1 });

  // Filter notes for student's class
  const classNotes = publishedNotes.filter(note => {
    return note.subStrand?.strand?.subject?.class?._id?.toString() === student.class._id.toString();
  });

  console.log(`✅ Found ${classNotes.length} published notes for class ${student.class.name}`);

  res.json(classNotes);
});

// @desc  Get quizzes for a specific sub-strand
// @route GET /api/student/quizzes/:subStrandId
// @access Private/Student
const getQuizzes = asyncHandler(async (req, res) => {
  const { subStrandId } = req.params;
  
  console.log('🧩 Fetching quizzes:', {
    subStrandId,
    school: req.user.school,
  });

  // First get the sub-strand to find the subject
  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    select: 'subject',
  });

  if (!subStrand || !subStrand.strand || !subStrand.strand.subject) {
    console.log('⚠️ Sub-strand not found or missing subject');
    return res.json([]);
  }

  // Find quizzes for this subject at the same school
  const quizzes = await Quiz.find({
    subject: subStrand.strand.subject,
    school: req.user.school,
  })
  .populate('createdBy', 'fullName')
  .sort({ createdAt: -1 });

  console.log(`✅ Found ${quizzes.length} quizzes for subject ${subStrand.strand.subject}`);
  
  res.json(quizzes);
});

// @desc  Get resources for a specific sub-strand
// @route GET /api/student/resources/:subStrandId
// @access Private/Student
const getResources = asyncHandler(async (req, res) => {
  const { subStrandId } = req.params;
  
  console.log('📘 Fetching resources:', {
    subStrandId,
    school: req.user.school,
  });

  // Find resources for this sub-strand at the same school
  const resources = await Resource.find({
    school: req.user.school,
  })
  .populate('uploadedBy', 'fullName')
  .sort({ createdAt: -1 });

  console.log(`✅ Found ${resources.length} resources`);
  
  res.json(resources);
});

// @desc  Get details of a single quiz (hide correct answers)
// @route GET /api/student/quiz/:id
// @access Private/Student
const getQuizDetails = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ 
    _id: req.params.id, 
    school: req.user.school 
  }).populate({
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
// @route POST /api/student/quiz/:id/submit
// @access Private/Student
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
// @route GET /api/student/badges
// @access Private/Student
const getMyBadges = asyncHandler(async (req, res) => {
  const myBadges = await StudentBadge.find({ student: req.user._id }).populate(
    'badge',
    'name description icon'
  );
  res.json(myBadges);
});

// @desc  Log that a student viewed a note
// @route POST /api/student/notes/:id/view
// @access Private/Student
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

// @desc  Get the most recent quiz assigned to a student
// @route GET /api/student/quiz/current
// @access Private/Student
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
// @access Private/Student
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
    res.json({ insight: 'Keep studying and you will improve with each quiz!' });
  }
});

module.exports = {
  getLearnerNotes,
  getPublishedLearnerNotes, // ✅ NEW: Added published notes endpoint
  getQuizzes,
  getResources,
  getQuizDetails,
  submitQuiz,
  getMyBadges,
  logNoteView,
  getCurrentQuiz,
  getQuizInsights,
};