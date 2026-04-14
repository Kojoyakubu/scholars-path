// /server/controllers/quizController.js

const asyncHandler = require('express-async-handler');
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
  let { topic, subjectName, className, numQuestions = 5, subStrandId, subjectId } = req.body;

  // if the caller passed a subStrandId we can populate a bunch of useful data
  // server-side. this allows the front end to remain lightweight (just send an
  // id instead of duplicating strings) and prevents cast errors when storing
  // the quiz document which requires the subject _id, not the name.
  if (subStrandId) {
    const SubStrand = require('../models/subStrandModel');
    const sub = await SubStrand.findById(subStrandId).populate({
      path: 'strand',
      populate: { path: 'subject', populate: { path: 'class' } },
    });
    if (sub) {
      // follow earlier logic for prompt defaults
      if (!topic) topic = sub.name || topic;
      if (!subjectName) subjectName = sub.strand?.subject?.name || subjectName;
      if (!className) className = sub.strand?.subject?.class?.name || className;
      if (!subjectId) subjectId = sub.strand?.subject?._id || subjectId;
    }
  }

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

  const mcqItems = Array.isArray(quiz?.mcq) ? quiz.mcq : [];
  const shortAnswerItems = Array.isArray(quiz?.shortAnswer) ? quiz.shortAnswer : [];
  const essayItems = Array.isArray(quiz?.essay) ? quiz.essay : [];

  // Quiz model expects subject to be an ObjectId. if we still don't have
  // a subjectId at this point then the request is malformed; such a situation
  // should generally be caught earlier when deriving from subStrandId.
  if (!subjectId) {
    res.status(400);
    throw new Error('Unable to determine subject for quiz. Please include a valid subStrandId or subjectId.');
  }

  const quizDoc = await Quiz.create({
    title: `${topic} - ${className}`,
    subject: subjectId,
    teacher: req.user.id,
    school: req.user.school,
    subStrand: subStrandId || null,
    shortAnswer: shortAnswerItems.map((q) => ({
      question: q.question,
      expectedAnswer: q.expectedAnswer,
    })),
    essay: essayItems.map((q) => ({
      question: q.question,
      markingGuide: q.markingGuide,
    })),
    // Optional AI metadata
    aiProvider: provider,
    aiModel: model,
    aiGeneratedAt: new Date(timestamp),
  });

  // ✅ Store questions linked to quiz so Quiz.questions virtual can resolve.
  let createdQuestionsCount = 0;

  for (const q of mcqItems) {
    const savedQuestion = await Question.create({
      text: q.question,
      explanation: q.explanation || '',
      topicTags: [topic, 'MCQ'].filter(Boolean),
      quiz: quizDoc._id,
    });

    // Create options for each question
    for (let i = 0; i < (q.options || []).length; i += 1) {
      const opt = q.options[i];
      await Option.create({
        question: savedQuestion._id,
        text: opt,
        isCorrect: i === q.correctIndex,
      });
    }

    createdQuestionsCount += 1;
  }

  res.status(201).json({
    message: 'Quiz generated successfully!',
    quizId: quizDoc._id,
    totalQuestions: createdQuestionsCount + shortAnswerItems.length + essayItems.length,
    breakdown: {
      mcq: createdQuestionsCount,
      shortAnswer: shortAnswerItems.length,
      essay: essayItems.length,
    },
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

  // Delete questions and options related to this quiz.
  // Do not rely on quiz.questions here because it's a virtual and this query
  // does not populate it.
  const questionDocs = await Question.find({ quiz: quiz._id }).select('_id');
  const questionIds = questionDocs.map((q) => q._id);
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
      quiz: null,
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
    shortAnswer: quiz.shortAnswer || [],
    essay: quiz.essay || [],
  });

  // Link duplicated questions to the new quiz.
  await Question.updateMany(
    { _id: { $in: newQuestionIds } },
    { $set: { quiz: duplicatedQuiz._id } }
  );

  res.status(201).json({ message: 'Quiz duplicated successfully!', duplicatedQuiz });
});

module.exports = {
  generateAiQuiz,
  getMyQuizzes,
  deleteQuiz,
  getQuizDetails,
  duplicateQuiz,
};
