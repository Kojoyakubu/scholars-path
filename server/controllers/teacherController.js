// server/controllers/teacherController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const NoteView = require('../models/noteViewModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const aiService = require('../services/aiService'); // Assumes aiService is enhanced

/**
 * @desc    Generate a lesson note with AI
 * @route   POST /api/teacher/generate-note
 * @access  Private (Teacher)
 */
const generateLessonNote = asyncHandler(async (req, res) => {
  const { subStrandId, ...noteDetails } = req.body; // Use rest parameters

  if (!subStrandId || !mongoose.Types.ObjectId.isValid(subStrandId)) {
    res.status(400);
    throw new Error('A valid Sub-strand ID is required.'); 
  }

  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    populate: { path: 'subject', populate: { path: 'class' } },
  });

  if (!subStrand) {
    res.status(404);
    throw new Error('Sub-strand not found');
  }

  // The complex prompt is now built inside the aiService.
  // This keeps the controller clean.
  const aiContent = await aiService.generateGhanaianLessonNote({
      ...noteDetails,
      subStrandName: subStrand.name,
      strandName: subStrand.strand.name,
      subjectName: subStrand.strand.subject.name,
      className: subStrand.strand.subject.class.name,
  });

  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    content: aiContent,
  });

  res.status(201).json(lessonNote);
});

/**
 * @desc    Get all lesson notes for the logged-in teacher
 * @route   GET /api/teacher/lesson-notes
 * @access  Private (Teacher)
 */
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id })
    .populate('subStrand', 'name') // Populate for context on the frontend
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
  if (note.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

  // Stricter Authorization: Only the teacher who created it can delete it.
  if (note.teacher.toString() !== req.user._id.toString()) {
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
  const { lessonNoteId } = req.body;
  const lessonNote = await LessonNote.findById(lessonNoteId);

  if (!lessonNote || lessonNote.teacher.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Lesson note not found or you are not the author.');
  }

  // Logic is delegated to the service
  const learnerContent = await aiService.generateLearnerFriendlyNote(lessonNote.content);

  const learnerNote = await LearnerNote.create({
    author: req.user._id,
    school: req.user.school,
    subStrand: lessonNote.subStrand,
    content: learnerContent,
  });

  res.status(201).json(learnerNote);
});


// ... (Other controllers like createQuiz, uploadResource remain similar but should include validation)
/**
 * @desc    Create a new quiz
 * @route   POST /api/teacher/create-quiz
 * @access  Private (Teacher)
 */
const createQuiz = asyncHandler(async (req, res) => {
  const { title, subjectId } = req.body;

  // --- Input Validation ---
  if (!title || !subjectId) {
    res.status(400);
    throw new Error('Quiz title and subject ID are required.');
  }
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    res.status(400);
    throw new Error('Invalid Subject ID format.');
  }

  const quiz = await Quiz.create({
    title,
    subject: subjectId,
    teacher: req.user._id,
    school: req.user.school,
  });

  res
    .status(201)
    .json({ message: `Quiz '${title}' created successfully.`, quiz });
});

/**
 * @desc    Upload a resource file
 * @route   POST /api/teacher/upload-resource
 * @access  Private (Teacher)
 * @note    This controller relies on a file upload middleware (e.g., multer)
 * to parse the form-data and attach the file to `req.file`.
 */
const uploadResource = asyncHandler(async (req, res) => {
  const { subStrandId } = req.body;

  // --- Input Validation ---
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded. Please include a file in your request.');
  }
  if (!subStrandId || !mongoose.Types.ObjectId.isValid(subStrandId)) {
    res.status(400);
    throw new Error('A valid Sub-strand ID is required.');
  }

  const resource = await Resource.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    fileName: req.file.originalname,
    filePath: req.file.path, // Path provided by multer/cloudinary storage engine
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
  const teacherId = req.user._id;

  // Fetch quizzes created by the teacher to get their IDs
  const quizzes = await Quiz.find({ teacher: teacherId }).select('_id');
  const quizIds = quizzes.map((q) => q._id);

  const [totalNoteViews, totalQuizAttempts, averageScoreResult] = await Promise.all([
    NoteView.countDocuments({ teacher: teacherId }),
    QuizAttempt.countDocuments({ quiz: { $in: quizIds } }),
    quizIds.length === 0 ? null : QuizAttempt.aggregate([
        { $match: { quiz: { $in: quizIds } } },
        { $group: {
            _id: null,
            // Calculate percentage score for each attempt, then average the percentages
            averagePercentage: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
          }
        }
      ]),
  ]);

  const averageScore = (averageScoreResult && averageScoreResult[0]) ? averageScoreResult[0].averagePercentage : 0;

  res.json({
    totalNoteViews,
    totalQuizAttempts,
    averageScore: averageScore.toFixed(2), // Send as a number, formatted on frontend
  });
});

// NOTE: Remember to export all functions
module.exports = {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
  deleteLessonNote,
  generateLearnerNote,
  createQuiz,
  uploadResource,
  getTeacherAnalytics,
};