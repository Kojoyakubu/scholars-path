const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');
const aiService = require('../services/aiService'); // Make sure aiService is imported

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
  // ... (function code is correct)
});

/**
 * @desc    Generate a new quiz with questions using AI
 * @route   POST /api/teacher/quizzes/generate-ai
 * @access  Private (Teacher)
 */
const generateAiQuiz = asyncHandler(async (req, res) => {
  const { title, subjectId, numQuestions, topic, className, subjectName } = req.body;
  const aiResultString = await aiService.generateWaecQuiz({
    topic: topic || title,
    className,
    subjectName,
    numQuestions,
  });
  let questionsFromAI;
  try {
    questionsFromAI = JSON.parse(aiResultString);
  } catch (error) {
    console.error("Failed to parse JSON from AI:", aiResultString);
    throw new Error("The AI returned an invalid format. Please try again.");
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const quiz = await Quiz.create([{
      title,
      subject: subjectId,
      teacher: req.user.id,
      school: req.user.school,
    }], { session });
    const quizId = quiz[0]._id;
    for (const q of questionsFromAI) {
      const question = await Question.create([{
        quiz: quizId,
        text: q.text,
        questionType: 'MCQ',
      }], { session });
      const questionId = question[0]._id;
      const optionsToCreate = q.options.map(opt => ({
        ...opt,
        question: questionId,
      }));
      await Option.create(optionsToCreate, { session });
    }
    await session.commitTransaction();
    const newQuiz = await Quiz.findById(quizId).populate({
      path: 'questions',
      populate: { path: 'options' }
    });
    res.status(201).json(newQuiz);
  } catch (error) {
    await session.abortTransaction();
    console.error("AI Quiz Generation Error:", error);
    throw new Error('Failed to save the AI-generated quiz. Please try again.');
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
    // ... (function code is correct)
});

// ✅ THE FIX IS HERE
module.exports = {
  createQuiz,
  getTeacherQuizzes,
  getQuizForEditing,
  addQuestionToQuiz,
  deleteQuiz,
  generateAiQuiz, // This line ensures the function is exported
};