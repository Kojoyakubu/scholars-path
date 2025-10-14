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

/**
 * @desc    Generate a lesson note with AI
 * @route   POST /api/teacher/generate-note
 * @access  Private (Teacher)
 */
const generateLessonNote = asyncHandler(async (req, res) => {
  const {
    subStrandId,
    school,
    term,
    duration,
    indicatorCodes,
    dayDate,
    class: className,
    classSize,
    week,
    contentStandardCode,
    reference,
  } = req.body;

  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    populate: { path: 'subject', populate: { path: 'class' } },
  });

  if (!subStrand) {
    res.status(404);
    throw new Error('Sub-strand not found');
  }

  // 🧩 Normalize indicator codes
  const codes = Array.isArray(indicatorCodes)
    ? indicatorCodes.join(', ')
    : indicatorCodes;

  // 🧠 Refined AI prompt based on your preferences
  const prompt = `
You are a Ghanaian master teacher and curriculum expert.
Generate a **well-structured Markdown lesson note** following the exact layout below.

Guidelines:
- Use the provided details faithfully.
- Generate a clear **Performance Indicator** based on the indicator code(s).
- Determine **Week Ending (Friday date)** based on the given "Day/Date".
- Keep the tone Ghanaian and classroom-appropriate.

---

### TEACHER INFORMATION

**School:** ${school}  
**Class:** ${className || subStrand.strand.subject.class.name}  
**Subject:** ${subStrand.strand.subject.name}  
**Strand:** ${subStrand.strand.name}  
**Sub-Strand:** ${subStrand.name}  
**Week:** ${week}  
**Week Ending:** [AI to calculate Friday date based on ${dayDate}]  
**Day/Date:** ${dayDate}  
**Term:** ${term}  
**Class Size:** ${classSize || 45}  
**Time/Duration:** ${duration}  
**Content Standard (Code):** ${contentStandardCode}  
**Indicator Code(s):** ${codes}  
**Performance Indicator:** [AI to generate based on the indicator code(s)]  
**Core Competencies:** Select relevant ones (e.g., Communication, Collaboration, Critical Thinking, Digital Literacy).  
**Teaching & Learning Materials:** Suggest realistic materials relevant to the subject.  
**Reference:** ${reference}

---

### LESSON PHASES (Maintain this 3-column format)

| **PHASE 1: Starter (Preparing the Brain for Learning)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|----------------------------------------------------------|--------------------------------------------------|----------------------------------|
| Begin with recap or warm-up linked to prior knowledge.<br><br>Engage learners through questions or short tasks.<br><br>Introduce today’s lesson clearly. | **Activity 1:** Introduce the concept via discussion/demonstration.<br><br>**Activity 2:** Learners explore and practice through guided/group tasks.<br><br>**Activity 3:** Discuss findings and summarize key learning points.<br><br>**Evaluation:**<br>1. [Short question 1]<br>2. [Short question 2]<br>3. [Short question 3]<br><br>**Assignment:** Give a short reflective task linked to real-life application. | Recap the key ideas.<br><br>Allow learners to share what they learned.<br><br>Encourage application and further practice. |

---

**Facilitator:**  
**Vetted By:** ....................................................  
**Signature:** ....................................................  
**Date:** ....................................................  

---

**Rules for Output:**
- Format only in Markdown (no code blocks).
- Do not omit or rename any heading.
- Replace all [AI to ...] placeholders with actual content.
`;

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
 * @desc    Get all lesson notes for the logged-in teacher
 * @route   GET /api/teacher/lesson-notes
 * @access  Private
 */
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(notes);
});

/**
 * @desc    Get a single lesson note by ID
 * @route   GET /api/teacher/lesson-notes/:id
 * @access  Private
 */
const getLessonNoteById = asyncHandler(async (req, res) => {
  const note = await LessonNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('Lesson note not found');
  }
  if (
    note.teacher.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('User not authorized to view this note');
  }
  res.json(note);
});

/**
 * @desc    Delete a lesson note
 * @route   DELETE /api/teacher/lesson-notes/:id
 * @access  Private
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
  res
    .status(200)
    .json({ id: req.params.id, message: 'Lesson note deleted successfully' });
});

/**
 * @desc    Generate a learner's version of a lesson note
 * @route   POST /api/teacher/generate-learner-note
 * @access  Private
 */
const generateLearnerNote = asyncHandler(async (req, res) => {
  const { lessonNoteId } = req.body;
  const lessonNote = await LessonNote.findById(lessonNoteId);
  if (!lessonNote) {
    res.status(404);
    throw new Error('Lesson note not found');
  }

  const prompt = `
Based on the following teacher's lesson note, create a simplified and engaging Markdown version suitable for learners in Ghanaian Basic Schools.  
Keep the tone friendly, clear, and encouraging.

${lessonNote.content}
`;

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
 * @route   POST /api/teacher/create-quiz
 * @access  Private
 */
const createQuiz = asyncHandler(async (req, res) => {
  const { title, subjectId } = req.body;
  const quiz = await Quiz.create({
    title,
    subject: subjectId,
    teacher: req.user._id,
    school: req.user.school,
  });
  res
    .status(201)
    .json({ quiz, message: `Quiz '${title}' created successfully.` });
});

/**
 * @desc    Upload a resource file
 * @route   POST /api/teacher/upload-resource
 * @access  Private
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
 * @desc    Get teacher analytics dashboard
 * @route   GET /api/teacher/analytics
 * @access  Private
 */
const getTeacherAnalytics = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;
  const schoolId = req.user.school;

  const quizzes = await Quiz.find({
    teacher: teacherId,
    school: schoolId,
  }).select('_id');

  const quizIds = quizzes.map((q) => q._id);

  const [totalNoteViews, totalQuizAttempts, averageScoreAggregation] =
    await Promise.all([
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
  if (
    averageScoreAggregation.length > 0 &&
    averageScoreAggregation[0].avgScore
  ) {
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
