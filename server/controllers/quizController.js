// /server/controllers/quizController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');
const aiService = require('../services/aiService');

/**
 * @desc    Generate a WAEC-style quiz using AI
 * @route   POST /api/teacher/generate-quiz
 * @access  Private (Teacher)
 */
const generateAiQuiz = asyncHandler(async (req, res) => {
  const { topic, subjectName, className, numQuestions = 5, subStrandId } = req.body;

  if (!topic || !subjectName || !className) {
    res.status(400);
    throw new Error('Topic, subject name, and class name are required.');
  }

  // 🧠 Generate AI-powered quiz (strict JSON from aiService)
  const { quiz, provider, model, timestamp } = await aiService.generateWaecQuiz({
    topic,
    subjectName,
    className,
    numQuestions,
  });

  // ✅ Store quiz + questions in DB
  const createdQuestions = [];

  for (const q of quiz) {
    const questionDoc = new Question({
      text: q.text,
    });

    const savedQuestion = await questionDoc.save();

    // Create 4 options per question
    for (const opt of q.options) {
      const optionDoc = new Option({
        question: savedQuestion._id,
        text: opt.text,
        isCorrect: !!opt.isCorrect,
      });
      await optionDoc.save();
    }

    createdQuestions.push(savedQuestion._id);
  }

  const quizDoc = await Quiz.create({
    title: `${topic} - ${className}`,
    subject: subjectName,
    teacher: req.user.id,
    school: req.user.school,
    questions: createdQuestions,
    subStrand: subStrandId || null,
    // Optional AI metadata
    aiProvider: provider,
    aiModel: model,
    aiGeneratedAt: new Date(timestamp),
  });

  res.status(201).json({
    message: 'Quiz generated successfully!',
    quizId: quizDoc._id,
    totalQuestions: createdQuestions.length,
    provider,
    model,
  });
});

/**
 * @desc    Get all quizzes for the logged-in teacher
 * @route   GET /api/teacher/quizzes
 * @access  Private (Teacher)
 */
const getMyQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ teacher: req.user.id })
    .populate('questions')
    .sort({ createdAt: -1 });
  res.json(quizzes);
});

/**
 * @desc    Delete a quiz and its questions
 * @route   DELETE /api/teacher/quizzes/:id
 * @access  Private (Teacher)
 */
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found.');
  }

  if (quiz.teacher.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this quiz.');
  }

  // Delete questions and options related to this quiz
  const questionIds = quiz.questions || [];
  await Option.deleteMany({ question: { $in: questionIds } });
  await Question.deleteMany({ _id: { $in: questionIds } });
  await quiz.deleteOne();

  res.json({ message: 'Quiz deleted successfully.', id: req.params.id });
});

/**
 * @desc    Get details of a specific quiz (teacher view)
 * @route   GET /api/teacher/quizzes/:id
 * @access  Private (Teacher)
 */
const getQuizDetails = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    teacher: req.user.id,
  }).populate({
    path: 'questions',
    populate: {
      path: 'options',
      model: 'Option',
    },
  });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found.');
  }

  res.json(quiz);
});

/**
 * @desc    Duplicate an existing quiz
 * @route   POST /api/teacher/quizzes/:id/duplicate
 * @access  Private (Teacher)
 */
const duplicateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate({
    path: 'questions',
    populate: { path: 'options' },
  });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found.');
  }

  const newQuestionIds = [];

  for (const question of quiz.questions) {
    const newQuestion = new Question({
      text: question.text,
    });
    await newQuestion.save();

    for (const option of question.options) {
      const newOption = new Option({
        question: newQuestion._id,
        text: option.text,
        isCorrect: option.isCorrect,
      });
      await newOption.save();
    }

    newQuestionIds.push(newQuestion._id);
  }

  const duplicatedQuiz = await Quiz.create({
    title: `${quiz.title} (Copy)`,
    subject: quiz.subject,
    teacher: req.user.id,
    school: req.user.school,
    questions: newQuestionIds,
  });

  res.status(201).json({ message: 'Quiz duplicated successfully!', duplicatedQuiz });
});

module.exports = {
  generateAiQuiz,
  getMyQuizzes,
  deleteQuiz,
  getQuizDetails,
  duplicateQuiz,
};
