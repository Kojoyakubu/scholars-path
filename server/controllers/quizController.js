const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');

/**
 * @desc    Create a new quiz
 * @route   POST /api/teacher/quizzes
 * @access  Private (Teacher)
 */
const createQuiz = asyncHandler(async (req, res) => {
  const { title, subjectId } = req.body;

  const quiz = await Quiz.create({
    title,
    subject: subjectId,
    teacher: req.user.id,
    school: req.user.school,
  });

  res.status(201).json(quiz);
});

/**
 * @desc    Get all quizzes created by the logged-in teacher
 * @route   GET /api/teacher/quizzes
 * @access  Private (Teacher)
 */
const getTeacherQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ teacher: req.user.id })
    .populate('subject', 'name')
    .sort({ createdAt: -1 });
  res.json(quizzes);
});

/**
 * @desc    Get a single quiz with all its questions and options for editing
 * @route   GET /api/teacher/quizzes/:quizId
 * @access  Private (Teacher)
 */
const getQuizForEditing = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, teacher: req.user.id })
    .populate({
      path: 'questions',
      populate: { path: 'options' }
    });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found or you are not authorized to view it.');
  }

  res.json(quiz);
});

/**
 * @desc    Add a new question with options to a quiz
 * @route   POST /api/teacher/quizzes/:quizId/questions
 * @access  Private (Teacher)
 */
const addQuestionToQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { text, questionType, options } = req.body; // options is an array [{ text, isCorrect }]

  const quiz = await Quiz.findOne({ _id: quizId, teacher: req.user.id });
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found or you are not authorized to modify it.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.create([{
      quiz: quizId,
      text,
      questionType,
    }], { session });

    const questionId = question[0]._id;

    const optionsToCreate = options.map(opt => ({
      ...opt,
      question: questionId,
    }));

    await Option.create(optionsToCreate, { session });

    await session.commitTransaction();
    
    // Fetch the newly created question with its options to return
    const newQuestion = await Question.findById(questionId).populate('options');
    res.status(201).json(newQuestion);

  } catch (error) {
    await session.abortTransaction();
    throw new Error('Failed to add question. Please try again.');
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Delete a quiz
 * @route   DELETE /api/teacher/quizzes/:quizId
 * @access  Private (Teacher)
 */
const deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findOne({ _id: req.params.quizId, teacher: req.user.id });

    if (!quiz) {
        res.status(404);
        throw new Error('Quiz not found or you are not authorized to delete it.');
    }

    // The pre('deleteOne') hook in your quizModel will handle deleting associated questions.
    await quiz.deleteOne();

    res.json({ id: req.params.quizId, message: 'Quiz removed successfully' });
});

module.exports = {
  createQuiz,
  getTeacherQuizzes,
  getQuizForEditing,
  addQuestionToQuiz,
  deleteQuiz,
};