// server/controllers/studentController.js

const asyncHandler = require('express-async-handler');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const StudentBadge = require('../models/studentBadgeModel');
const NoteView = require('../models/noteViewModel');
const { checkAndAwardQuizBadges } = require('../services/badgeService');

// --- Helper & Service Functions ---

/**
 * Calculates the score for a quiz submission.
 * @param {object} quiz - The full quiz object with questions and options.
 * @param {Array<object>} answers - The student's answers [{ questionId, selectedOptionId }].
 * @returns {number} The calculated score.
 */
const calculateQuizScore = (quiz, answers) => {
  // Use a Map for efficient answer lookup (O(1) average time complexity).
  const answerMap = new Map(answers.map(a => [a.questionId.toString(), a.selectedOptionId.toString()]));
  
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


// --- Controller Functions ---

// @desc    Get learner notes for a sub-strand, filtered by school
const getLearnerNotes = asyncHandler(async (req, res) => {
  const notes = await LearnerNote.find({ 
    subStrand: req.params.subStrandId, 
    school: req.user.school, // Security: Ensure student only sees notes for their school
    status: 'published'
  });
  res.json(notes);
});

// @desc    Get quizzes for a sub-strand, filtered by school
const getQuizzes = asyncHandler(async (req, res) => {
  const subStrand = await SubStrand.findById(req.params.subStrandId).populate({
    path: 'strand',
    select: 'subject'
  });

  if (!subStrand || !subStrand.strand || !subStrand.strand.subject) {
      return res.json([]);
  }

  const quizzes = await Quiz.find({ 
    subject: subStrand.strand.subject, 
    school: req.user.school // Security: Ensure student only sees quizzes for their school
  });
  res.json(quizzes);
});

// @desc    Get resources for a sub-strand, filtered by school
const getResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ 
    subStrand: req.params.subStrandId, 
    school: req.user.school // Security: Ensure student only sees resources for their school
  });
  res.json(resources);
});

// @desc    Get details of a single quiz
const getQuizDetails = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, school: req.user.school })
    .populate({
        path: 'questions',
        populate: { path: 'options', model: 'Option', select: '-isCorrect' } // Hide correct answer from student before submission
    });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found or not available for your school.');
  }
  res.json(quiz);
});

// @desc    Submit a quiz and get results
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // Expects an array of { questionId, selectedOptionId }
  
  if (!Array.isArray(answers)) {
      res.status(400);
      throw new Error('Answers must be an array.');
  }

  const quiz = await Quiz.findById(req.params.id).populate({
    path: 'questions',
    populate: { path: 'options', model: 'Option' } // Populate with correct answers for scoring
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
  
  // Asynchronously award badges without blocking the response
  checkAndAwardQuizBadges(req.user._id, attempt);

  res.status(200).json({ 
      message: 'Quiz submitted successfully!', 
      score: attempt.score, 
      totalQuestions: attempt.totalQuestions 
  });
});

// @desc    Get badges earned by the logged-in student
const getMyBadges = asyncHandler(async (req, res) => {
  const myBadges = await StudentBadge.find({ student: req.user._id }).populate('badge', 'name description icon');
  res.json(myBadges);
});

// @desc    Log that a student has viewed a note
const logNoteView = asyncHandler(async (req, res) => {
  const note = await LearnerNote.findById(req.params.id);
  if (!note) {
      res.status(404);
      throw new Error('Note not found');
  }

  const existingView = await NoteView.findOne({ note: note._id, student: req.user._id }).sort({ createdAt: -1 });
  
  const VIEW_COOLDOWN_MS = 60 * 1000; // 1 minute
  if (!existingView || (new Date() - existingView.createdAt > VIEW_COOLDOWN_MS)) {
      await NoteView.create({ 
        note: note._id, 
        student: req.user._id, 
        teacher: note.author,
        school: req.user.school 
      });
      res.status(201).json({ message: 'View logged' });
  } else {
      res.status(200).json({ message: 'View already logged recently' });
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
};