const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');
const Resource = require('../models/resourceModel');
const NoteView = require('../models/noteViewModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const aiService = require('../services/aiService');

// @desc    Get all lesson notes for the logged-in teacher
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
});

// @desc    Generate a lesson note with AI
const generateLessonNote = asyncHandler(async (req, res) => {
  const { subStrandId, objectives, aids, duration } = req.body;
  const subStrand = await SubStrand.findById(subStrandId).populate({
      path: 'strand',
      populate: { path: 'subject', populate: { path: 'class', populate: 'level' } }
  });

  if (!subStrand) {
      res.status(404);
      throw new Error('Sub-strand not found');
  }
  
  const prompt = `Generate a detailed lesson note for a class on the topic "${subStrand.name}". Class Level: ${subStrand.strand.subject.class.level.name} - ${subStrand.strand.subject.class.name}, Subject: ${subStrand.strand.subject.name}, Strand: ${subStrand.strand.name}, Learning Objectives: ${objectives}, Teaching Aids: ${aids}, Duration: ${duration}. The note should be comprehensive, well-structured, and suitable for a teacher to use. Format the output in Markdown.`;

  const aiContent = await aiService.generateContent(prompt);

  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    content: aiContent,
    learningObjectives: objectives,
    teachingAids: aids,
    duration,
  });
  res.status(201).json(lessonNote);
});

// @desc    Get a single lesson note by ID
const getLessonNoteById = asyncHandler(async (req, res) => {
  const note = await LessonNote.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Lesson note not found');
  }

  if (note.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('User not authorized to view this note');
  }

  res.json(note);
});

// @desc    Generate a learner's version of a lesson note
const generateLearnerNote = asyncHandler(async (req, res) => {
    const { lessonNoteId } = req.body;
    const lessonNote = await LessonNote.findById(lessonNoteId);
    if (!lessonNote) { res.status(404); throw new Error('Lesson note not found'); }
    const prompt = `Based on the following teacher's lesson note, create a simplified, engaging, and easy-to-understand version for students:\n\n${lessonNote.content}`;
    const learnerContent = await aiService.generateContent(prompt);
    const learnerNote = await LearnerNote.create({
        author: req.user._id, school: req.user.school, subStrand: lessonNote.subStrand, content: learnerContent,
    });
    res.status(201).json(learnerNote);
});

// @desc    Create a new quiz
const createQuiz = asyncHandler(async (req, res) => {
    const { title, subjectId } = req.body;
    const quiz = await Quiz.create({ title, subject: subjectId, teacher: req.user._id, school: req.user.school });
    res.status(201).json({ quiz, message: `Quiz '${title}' created successfully.` });
});

// @desc    Upload a resource file
const uploadResource = asyncHandler(async (req, res) => {
    if (!req.file) { res.status(400); throw new Error('Please upload a file'); }
    const { subStrandId } = req.body;
    const resource = await Resource.create({
        teacher: req.user._id, school: req.user.school, subStrand: subStrandId,
        fileName: req.file.originalname, filePath: req.file.path, fileType: req.file.mimetype,
    });
    res.status(201).json(resource);
});

// @desc    Get teacher analytics dashboard
const getTeacherAnalytics = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;
  const schoolId = req.user.school;
  const quizzes = await Quiz.find({ teacher: teacherId, school: schoolId }).select('_id');
  const quizIds = quizzes.map(q => q._id);
  const [totalNoteViews, totalQuizAttempts, averageScoreAggregation] = await Promise.all([
    NoteView.countDocuments({ teacher: teacherId, school: schoolId }),
    QuizAttempt.countDocuments({ quiz: { $in: quizIds }, school: schoolId }),
    quizIds.length > 0 ? QuizAttempt.aggregate([
      { $match: { quiz: { $in: quizIds }, school: schoolId, totalQuestions: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: { $divide: ["$score", "$totalQuestions"] } } } }
    ]) : Promise.resolve([])
  ]);
  let averageScore = 0;
  if (averageScoreAggregation.length > 0 && averageScoreAggregation[0].avgScore) {
    averageScore = averageScoreAggregation[0].avgScore * 100;
  }
  res.json({ totalNoteViews, totalQuizAttempts, averageScore: averageScore.toFixed(2) });
});

module.exports = {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
  generateLearnerNote,
  createQuiz,
  uploadResource,
  getTeacherAnalytics,
};