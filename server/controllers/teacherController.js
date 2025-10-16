// backend/controllers/teacherController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const LessonNote = require('../models/lessonNoteModel');
const SubStrand = require('../models/subStrandModel');
const aiService = require('../services/aiService');
// ✨ IMPROVEMENT: Import utilities
const documentGenerator = require('../utils/documentGenerator');
const { createLessonNotePrompt } = require('../utils/promptTemplates');

/**
 * @desc    Calculates the date of the upcoming Friday based on a given start date.
 * @param   {string | Date} startDate - The initial date.
 * @returns {string} The formatted Friday date string.
 */
const getWeekEndingDate = (startDate) => {
  try {
    const date = new Date(startDate);
    const dayOfWeek = date.getDay(); // Sunday=0, Monday=1...
    // Calculate days to add to get to Friday (day 5)
    const daysToAdd = (5 - dayOfWeek + 7) % 7;
    date.setDate(date.getDate() + daysToAdd);
    // Use a consistent, clear format
    return date.toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch (error) {
    console.error("Could not parse date:", startDate);
    return "N/A"; // Fallback for invalid date input
  }
};

/**
 * @desc    Generate a lesson note with AI
 * @route   POST /api/teacher/generate-note
 * @access  Private (Teacher)
 */
const generateLessonNote = asyncHandler(async (req, res) => {
  const { subStrandId /*, other fields... */ } = req.body;

  if (!subStrandId || !mongoose.Types.ObjectId.isValid(subStrandId)) {
    res.status(400);
    throw new Error('Invalid or missing Sub-strand ID in request.');
  }

  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    populate: { path: 'subject', populate: { path: 'class' } },
  });

  if (!subStrand) {
    res.status(404);
    throw new Error('Sub-strand not found');
  }

  // ✨ IMPROVEMENT: Use the reliable date function instead of asking the AI
  const weekEnding = getWeekEndingDate(req.body.dayDate);

  // Prepare data for the prompt template
  const promptData = {
    ...req.body,
    className: req.body.class || subStrand.strand.subject.class.name,
    subjectName: subStrand.strand.subject.name,
    strandName: subStrand.strand.name,
    subStrandName: subStrand.name,
    weekEnding: weekEnding,
  };

  // ✨ IMPROVEMENT: Prompt is now cleanly managed in a separate file
  const prompt = createLessonNotePrompt(promptData);

  // 💡 SCALABILITY NOTE: For a production app, don't `await` the AI service here.
  // This blocks the server. Instead, use a background job queue (e.g., BullMQ with Redis).
  //
  // Example Flow:
  // 1. const job = await lessonNoteQueue.add('generateNote', { prompt, userId: req.user._id, subStrandId });
  // 2. return res.status(202).json({ message: 'Lesson note generation has started.', jobId: job.id });
  // 3. A separate worker process handles the job, calls the AI, and saves the note.
  // 4. The frontend polls or uses WebSockets to know when the note is ready.

  const aiContent = await aiService.generateContent(prompt);

  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    content: aiContent,
  });

  res.status(201).json(lessonNote);
});

/**
 * @desc    Download a lesson note as PDF or DOCX
 * @route   GET /api/teacher/notes/:id/download/:format
 * @access  Private
 */
const downloadLessonNote = asyncHandler(async (req, res) => {
  const { id, format } = req.params;

  if (!['pdf', 'docx'].includes(format)) {
    res.status(400);
    throw new Error('Invalid download format specified. Use "pdf" or "docx".');
  }

  const note = await LessonNote.findById(id);

  // Critical security check: Ensure the user owns this note
  if (!note || (note.teacher.toString() !== req.user._id.toString())) {
    res.status(404);
    throw new Error('Lesson note not found or you do not have permission.');
  }

  const noteTitle = note.content.substring(0, 100).split('\n').find(line => line.includes('Sub-Strand:'))?.replace('**Sub-Strand:**', '').trim() || 'lesson-note';
  const safeFilename = noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  if (format === 'pdf') {
    const pdfBuffer = await documentGenerator.generatePdf(note.content);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${safeFilename}.pdf`);
    return res.send(pdfBuffer);
  }

  // Placeholder for future DOCX generation
  if (format === 'docx') {
    res.status(501);
    throw new Error('DOCX generation is not yet implemented.');
  }
});

// Other controller functions (getMyLessonNotes, getLessonNoteById, deleteLessonNote, etc.)
// remain the same. Just ensure you export the new function.

const getMyLessonNotes = asyncHandler(async (req, res) => { /* ... (no changes) ... */ });
const getLessonNoteById = asyncHandler(async (req, res) => { /* ... (no changes) ... */ });
const deleteLessonNote = asyncHandler(async (req, res) => { /* ... (no changes) ... */ });


module.exports = {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
  deleteLessonNote,
  downloadLessonNote, // ✨ EXPORT THE NEW CONTROLLER
  createQuiz,
  uploadResource,
  getTeacherAnalytics
};