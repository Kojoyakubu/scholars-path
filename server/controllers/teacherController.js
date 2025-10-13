const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const NoteView = require('../models/noteViewModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const aiService = require('../services/aiService');
const PDFDocument = require('pdfkit');
const MarkdownIt = require('markdown-it');

/**
 * @desc    Generate a lesson note as downloadable PDF + save copy in DB
 * @route   POST /api/teacher/generate-note
 * @access  Private (Teacher)
 */
const generateLessonNote = asyncHandler(async (req, res) => {
  const {
    subStrandId,
    school,
    term,
    duration,
    performanceIndicator,
    dayDate,
    class: className,
  } = req.body;

  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    populate: { path: 'subject', populate: { path: 'class' } },
  });

  if (!subStrand) {
    res.status(404);
    throw new Error('Sub-strand not found');
  }

  // Prompt for AI generation
  const prompt = `
You are a Ghanaian master teacher designing a professional JHS Computing lesson note.
Use Markdown formatting, including a proper 3-column table for Lesson Phases (Starter, Main, Plenary).
Include all sections expected in a Ghanaian JHS lesson note.

Return Markdown only.
`;

  // Generate content
  const aiContent = await aiService.generateContent(prompt);

  // Convert Markdown → plain text for PDF readability
  const md = new MarkdownIt({ html: false, breaks: true });
  const plainText = md.render(aiContent).replace(/<[^>]+>/g, '');

  // Save to database (for dashboard)
  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    content: aiContent,
  });

  // Generate downloadable PDF
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="lesson_note.pdf"'
  );

  doc.pipe(res);

  // --- PDF Header ---
  doc
    .font('Times-Bold')
    .fontSize(14)
    .text('Lesson Note', { align: 'center' })
    .moveDown(0.5);

  doc
    .font('Times-Roman')
    .fontSize(10)
    .text(
      `School: ${school}
Class: ${className || subStrand.strand.subject.class.name}
Subject: ${subStrand.strand.subject.name}
Strand: ${subStrand.strand.name}
Sub-Strand: ${subStrand.name}
Term: ${term}
Duration: ${duration}
Date: ${dayDate}
Performance Indicator: ${performanceIndicator}`,
      { align: 'left' }
    )
    .moveDown(1);

  // --- Main Lesson Note Content ---
  doc
    .font('Times-Roman')
    .fontSize(10)
    .text(plainText, { align: 'left', lineGap: 4 });

  // --- Footer ---
  doc.moveDown(2);
  doc
    .font('Times-Italic')
    .fontSize(9)
    .text(`Facilitator: ${req.user.name || '_________________'}`, {
      align: 'left',
    })
    .moveDown(0.5)
    .text('Vetted By: ___________________', { align: 'left' })
    .moveDown(0.5)
    .text('Signature: ___________________', { align: 'left' })
    .moveDown(0.5)
    .text('Date: ___________________', { align: 'left' })
    .moveDown(1)
    .text('— End of Lesson Note —', { align: 'center' });

  doc.end();
});

/**
 * @desc    Get all lesson notes for the logged-in teacher
 */
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(notes);
});

/**
 * @desc    Get a single lesson note by ID
 */
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

/**
 * @desc    Delete a lesson note
 */
const deleteLessonNote = asyncHandler(async (req, res) => {
  const note = await LessonNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('Lesson note not found');
  }
  if (note.teacher.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to delete this note');
  }
  await note.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Lesson note deleted successfully' });
});

/**
 * @desc    Generate learner's version of a lesson note
 */
const generateLearnerNote = asyncHandler(async (req, res) => {
  const { lessonNoteId } = req.body;
  const lessonNote = await LessonNote.findById(lessonNoteId);
  if (!lessonNote) {
    res.status(404);
    throw new Error('Lesson note not found');
  }
  const prompt = `Simplify the following teacher's lesson note for learners. Use Markdown and make it engaging:\n\n${lessonNote.content}`;
  const learnerContent = await aiService.generateContent(prompt);

  const learnerNote = await LearnerNote.create({
    author: req.user._id,
    school: req.user.school,
    subStrand: lessonNote.subStrand,
    content: learnerContent,
  });
  res.status(201).json(learnerNote);
});

/**
 * @desc    Create a new quiz
 */
const createQuiz = asyncHandler(async (req, res) => {
  const { title, subjectId } = req.body;
  const quiz = await Quiz.create({
    title,
    subject: subjectId,
    teacher: req.user._id,
    school: req.user.school,
  });
  res.status(201).json({ quiz, message: `Quiz '${title}' created successfully.` });
});

/**
 * @desc    Upload a resource file
 */
const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }
  const { subStrandId } = req.body;
  const resource = await Resource.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType: req.file.mimetype,
  });
  res.status(201).json(resource);
});

/**
 * @desc    Get teacher analytics
 */
const getTeacherAnalytics = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;
  const schoolId = req.user.school;

  const quizzes = await Quiz.find({ teacher: teacherId, school: schoolId }).select('_id');
  const quizIds = quizzes.map((q) => q._id);

  const [totalNoteViews, totalQuizAttempts, averageScoreAggregation] = await Promise.all([
    NoteView.countDocuments({ teacher: teacherId, school: schoolId }),
    QuizAttempt.countDocuments({ quiz: { $in: quizIds }, school: schoolId }),
    quizIds.length > 0
      ? QuizAttempt.aggregate([
          {
            $match: {
              quiz: { $in: quizIds },
              school: schoolId,
              totalQuestions: { $gt: 0 },
            },
          },
          {
            $group: {
              _id: null,
              avgScore: { $avg: { $divide: ['$score', '$totalQuestions'] } },
            },
          },
        ])
      : Promise.resolve([]),
  ]);

  let averageScore = 0;
  if (averageScoreAggregation.length > 0 && averageScoreAggregation[0].avgScore) {
    averageScore = averageScoreAggregation[0].avgScore * 100;
  }

  res.json({
    totalNoteViews,
    totalQuizAttempts,
    averageScore: averageScore.toFixed(2),
  });
});

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
