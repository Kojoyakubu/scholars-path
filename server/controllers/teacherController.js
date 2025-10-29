// /server/controllers/teacherController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const axios = require('axios'); // ✅ BUG FIX: needed by searchImage

const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const NoteView = require('../models/noteViewModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');

const aiService = require('../services/aiService');

/**
 * @desc    Generate a lesson note with AI
 * @route   POST /api/teacher/generate-note
 * @access  Private (Teacher)
 */
const generateLessonNote = asyncHandler(async (req, res) => {
  const { subStrandId, ...noteDetails } = req.body;

  if (!subStrandId || !mongoose.Types.ObjectId.isValid(subStrandId)) {
    res.status(400);
    throw new Error('A valid Sub-strand ID is required.');
  }

  // Populate the full curriculum hierarchy to get all necessary names
  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    populate: {
      path: 'subject',
      populate: { path: 'class' },
    },
  });

  if (!subStrand) {
    res.status(404);
    throw new Error('Sub-strand not found');
  }

  // Assemble safe AI details (with fallbacks)
  const aiDetails = {
    ...noteDetails,
    subStrandName: subStrand?.name ?? 'N/A',
    strandName: subStrand?.strand?.name ?? 'N/A',
    subjectName: subStrand?.strand?.subject?.name ?? 'N/A',
    className: noteDetails.class || subStrand?.strand?.subject?.class?.name || 'N/A',
  };

  // 🔗 New aiService returns { text, provider, model, ... }
  const { text: aiText, provider, model, timestamp } =
    await aiService.generateGhanaianLessonNote(aiDetails);

  const lessonNote = await LessonNote.create({
    teacher: req.user.id,
    school: req.user.school,
    subStrand: subStrandId,
    content: aiText,
    // Optionally store metadata if your schema supports it:
    // aiProvider: provider,
    // aiModel: model,
    // aiGeneratedAt: new Date(timestamp),
  });

  res.status(201).json(lessonNote);
});

/**
 * @desc    Get all lesson notes for the logged-in teacher
 * @route   GET /api/teacher/lesson-notes
 * @access  Private (Teacher)
 */
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user.id })
    .populate('subStrand', 'name')
    .sort({ createdAt: -1 });
  res.json(notes);
});

/**
 * @desc    Get a single lesson note by ID
 * @route   GET /api/teacher/lesson-notes/:id
 * @access  Private (Teacher)
 */
const getLessonNoteById = asyncHandler(async (req, res) => {
  const note = await LessonNote.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Lesson note not found');
  }

  // Authorization: Ensure the note belongs to the teacher or the user is an admin.
  if (note.teacher.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this note');
  }

  res.json(note);
});

/**
 * @desc    Delete a lesson note
 * @route   DELETE /api/teacher/lesson-notes/:id
 * @access  Private (Teacher)
 */
const deleteLessonNote = asyncHandler(async (req, res) => {
  const note = await LessonNote.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error('Lesson note not found');
  }

  // Only the author can delete
  if (note.teacher.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this note');
  }

  await note.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Lesson note deleted' });
});

/**
 * @desc    Generate a learner's version of a lesson note
 * @route   POST /api/teacher/generate-learner-note
 * @access  Private (Teacher)
 */
const generateLearnerNote = asyncHandler(async (req, res) => {
  const { lessonNoteId, preferredProvider, preferredModel } = req.body;
  const lessonNote = await LessonNote.findById(lessonNoteId);

  if (!lessonNote || lessonNote.teacher.toString() !== req.user.id.toString()) {
    res.status(404);
    throw new Error('Lesson note not found or you are not the author.');
  }

  // 🔗 New aiService returns { text, provider, model, ... }
  const { text: learnerText, provider, model, timestamp } =
    await aiService.generateLearnerFriendlyNote(lessonNote.content, {
      preferredProvider,
      preferredModel,
    });

  const learnerNote = await LearnerNote.create({
    author: req.user.id,
    school: req.user.school,
    subStrand: lessonNote.subStrand,
    content: learnerText,
    // Optionally store metadata if schema supports:
    // aiProvider: provider,
    // aiModel: model,
    // aiGeneratedAt: new Date(timestamp),
  });

  res.status(201).json(learnerNote);
});

/**
 * @desc    Create a new quiz (manual create; AI generation lives in quizController)
 * @route   POST /api/teacher/create-quiz
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
  res.status(201).json({ message: `Quiz '${title}' created successfully.`, quiz });
});

/**
 * @desc    Upload a resource file
 * @route   POST /api/teacher/upload-resource
 * @access  Private (Teacher)
 */
const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded. Please include a file in your request.');
  }
  const { subStrandId } = req.body;
  const resource = await Resource.create({
    teacher: req.user.id,
    school: req.user.school,
    subStrand: subStrandId,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType: req.file.mimetype,
  });
  res.status(201).json(resource);
});

/**
 * @desc    Get teacher analytics dashboard
 * @route   GET /api/teacher/analytics
 * @access  Private (Teacher)
 */
const getTeacherAnalytics = asyncHandler(async (req, res) => {
  const teacherId = req.user.id;
  const quizzes = await Quiz.find({ teacher: teacherId }).select('_id');
  const quizIds = quizzes.map((q) => q._id);

  const [totalNoteViews, totalQuizAttempts, averageScoreResult] = await Promise.all([
    NoteView.countDocuments({ teacher: teacherId }),
    QuizAttempt.countDocuments({ quiz: { $in: quizIds } }),
    quizIds.length === 0
      ? null
      : QuizAttempt.aggregate([
          { $match: { quiz: { $in: quizIds } } },
          {
            $group: {
              _id: null,
              averagePercentage: {
                $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] },
              },
            },
          },
        ]),
  ]);

  const averageScore =
    averageScoreResult && averageScoreResult[0] ? averageScoreResult[0].averagePercentage : 0;

  res.json({
    totalNoteViews,
    totalQuizAttempts,
    averageScore: Number(averageScore.toFixed(2)),
  });
});

/**
 * @desc    Get all draft learner notes for the logged-in teacher
 * @route   GET /api/teacher/learner-notes/drafts
 * @access  Private (Teacher)
 */
const getDraftLearnerNotes = asyncHandler(async (req, res) => {
  const draftNotes = await LearnerNote.find({ author: req.user.id, status: 'draft' })
    .populate('subStrand', 'name')
    .sort({ createdAt: -1 });
  res.json(draftNotes);
});

/**
 * @desc    Publish a draft learner note
 * @route   PUT /api/teacher/learner-notes/:id/publish
 * @access  Private (Teacher)
 */
const publishLearnerNote = asyncHandler(async (req, res) => {
  const note = await LearnerNote.findOne({ _id: req.params.id, author: req.user.id });
  if (!note) {
    res.status(404);
    throw new Error('Draft note not found.');
  }
  note.status = 'published';
  await note.save();
  res.json({ message: 'Note published successfully!', id: note._id });
});

/**
 * @desc    Delete a draft learner note
 * @route   DELETE /api/teacher/learner-notes/:id
 * @access  Private (Teacher)
 */
const deleteLearnerNote = asyncHandler(async (req, res) => {
  const note = await LearnerNote.findOne({ _id: req.params.id, author: req.user.id });
  if (!note) {
    res.status(404);
    throw new Error('Draft note not found.');
  }
  await note.deleteOne();
  res.json({ message: 'Draft note deleted successfully!', id: note._id });
});

/**
 * @desc    Search for an image using the Pexels API
 * @route   GET /api/teacher/search-image
 * @access  Private
 */
const searchImage = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    res.status(400);
    throw new Error('Search query is required.');
  }

  const response = await axios.get(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
    {
      headers: { Authorization: process.env.PEXELS_API_KEY },
      timeout: 8000,
    }
  );

  const imageUrl = response.data?.photos?.[0]?.src?.medium || null;
  res.json({ imageUrl });
});

module.exports = {
  generateLessonNote,
  getMyLessonNotes,
  getLessonNoteById,
  deleteLessonNote,
  generateLearnerNote,
  createQuiz,
  uploadResource,
  getTeacherAnalytics,
  getDraftLearnerNotes,
  publishLearnerNote,
  deleteLearnerNote,
  searchImage,
};
