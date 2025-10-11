const asyncHandler = require('express-async-handler');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const StudentBadge = require('../models/studentBadgeModel');
const NoteView = require('../models/noteViewModel');
const { checkAndAwardQuizBadges } = require('../services/badgeService');

// Helper to get SubjectID from a SubStrandID
const getSubjectIdFromSubStrand = async (subStrandId) => {
  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    select: 'subject'
  });
  return subStrand?.strand?.subject;
};

// @desc    Get learner notes for a sub-strand
const getLearnerNotes = asyncHandler(async (req, res) => {
  const notes = await LearnerNote.find({ subStrand: req.params.subStrandId, school: req.user.school });
  res.json(notes);
});

// @desc    Get quizzes for a sub-strand
const getQuizzes = asyncHandler(async (req, res) => {
  const subjectId = await getSubjectIdFromSubStrand(req.params.subStrandId);
  if (!subjectId) {
      return res.json([]);
  }
  const quizzes = await Quiz.find({ subject: subjectId, school: req.user.school });
  res.json(quizzes);
});

// @desc    Get resources for a sub-strand
const getResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ subStrand: req.params.subStrandId, school: req.user.school });
  res.json(resources);
});

// @desc    Get details of a single quiz
const getQuizDetails = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate({
      path: 'questions',
      populate: {
          path: 'options',
          model: 'Option'
      }
  });
  if (quiz) {
    res.json(quiz);
  } else {
    res.status(404);
    throw new Error('Quiz not found');
  }
});

// @desc    Submit a quiz and get results
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // Expects an array of { questionId, selectedOptionId }
  const quiz = await Quiz.findById(req.params.id).populate({
    path: 'questions',
    populate: { path: 'options', model: 'Option' }
  });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  let score = 0;
  for (const question of quiz.questions) {
    const userAnswer = answers.find(a => a.questionId.toString() === question._id.toString());
    if (userAnswer) {
      const correctOption = question.options.find(o => o.isCorrect);
      if (correctOption && userAnswer.selectedOptionId.toString() === correctOption._id.toString()) {
        score++;
      }
    }
  }

  const attempt = await QuizAttempt.create({
    quiz: quiz._id,
    student: req.user._id,
    school: req.user.school,
    score: score,
    totalQuestions: quiz.questions.length,
    answers,
  });
  
  await checkAndAwardQuizBadges(req.user._id, attempt);
  res.status(200).json({ message: 'Quiz submitted successfully', score: attempt.score, totalQuestions: attempt.totalQuestions });
});

// @desc    Get badges earned by the logged-in student
const getMyBadges = asyncHandler(async (req, res) => {
  const myBadges = await StudentBadge.find({ student: req.user._id }).populate('badge');
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
  
  // 1 minute cooldown to prevent spamming views
  if (!existingView || (new Date() - existingView.createdAt > 60000)) {
      await NoteView.create({ 
        note: note._id, 
        student: req.user._id, 
        teacher: note.author, // The teacher who created the note
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