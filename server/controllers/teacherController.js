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

  // ✅ IMPROVED PROMPT — Markdown-only structured output for front-end rendering
  const prompt = `
You are an award-winning Ghanaian master teacher and curriculum designer. 
Your task is to generate a **professionally structured lesson note** for the JHS curriculum in **clean Markdown format (no HTML tags)**.

**Teacher-Provided Information:**
- Topic (Sub-Strand): "${subStrand.name}"
- School: "${school}"
- Class: "${className || subStrand.strand.subject.class.name}"
- Term: "${term}"
- Duration: "${duration}"
- Performance Indicator: "${performanceIndicator}"
- Day/Date: "${dayDate}"

---

### 📘 REQUIRED OUTPUT STRUCTURE (Markdown Only — No HTML Tags)

All fields must be **clearly labeled** and separated by blank lines.

**School:** ${school}  
**Class:** ${className || subStrand.strand.subject.class.name}  
**Subject:** ${subStrand.strand.subject.name}  
**Strand:** ${subStrand.strand.name}  
**Sub-Strand:** ${subStrand.name}  
**Week:** [AI to generate week number]  
**Week Ending:** [AI to generate Friday date]  
**Day/Date:** ${dayDate}  
**Term:** ${term}  
**Class Size:** 45  
**Time/Duration:** ${duration}  
**Content Standard (Code):** [AI to generate, e.g., B7.X.X.X]  
**Indicator (Code):** [AI to generate, e.g., B7.X.X.X.X]  
**Performance Indicator:** ${performanceIndicator}  
**Core Competencies:** [AI to generate, e.g., Critical Thinking, Communication, Collaboration]  
**Teaching & Learning Materials:** [AI to generate, e.g., Computer, projector, flash cards, textbook]  
**Reference:** [AI to generate, e.g., NaCCA Computing Curriculum for JHS 1]

---

### **Lesson Phases Table**

| **PHASE 1: Starter (Preparing the Brain for Learning)** | **PHASE 2: Main (New Learning and Assessment)** | **PHASE 3: Plenary/Reflection** |
|----------------------------------------------------------|--------------------------------------------------|----------------------------------|
| Recap previous lesson briefly. Introduce the new topic with real-life examples or visuals. Ask simple questions to engage learners. | **Activity 1:** Explain the new concept clearly using real examples.  
**Activity 2:** Guide learners to practice or explore the topic hands-on.  
**Activity 3:** Group discussion or activity.  
**Evaluation:** Include 3 short questions to test understanding.  
**Assignment:** Give one short take-home task related to the topic. | Summarize the key ideas discussed. Ask learners reflective questions. Allow brief sharing of what they learned. |

---

**Facilitator:**  
**Vetted By:** ....................................................  
**Signature:** ....................................................  
**Date:** ....................................................  

---

### ⚙️ OUTPUT RULES
1. Output **pure Markdown** (no raw HTML tags like <br> or <p>).  
2. Keep the table structure consistent with the 3-column layout shown above.  
3. Add a blank line between every section for readability.  
4. Use Ghanaian classroom tone, clarity, and concise wording.  
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
 */
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id }).sort({ createdAt: -1 });
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
  res
    .status(200)
    .json({ id: req.params.id, message: 'Lesson note deleted successfully' });
});

/**
 * @desc    Generate a learner's version of a lesson note
 */
const generateLearnerNote = asyncHandler(async (req, res) => {
  const { lessonNoteId } = req.body;
  const lessonNote = await LessonNote.findById(lessonNoteId);
  if (!lessonNote) {
    res.status(404);
    throw new Error('Lesson note not found');
  }
  const prompt = `Based on the following teacher's lesson note, create a simplified and engaging Markdown version suitable for JHS learners. Keep it clear and friendly:

${lessonNote.content}`;
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
  res
    .status(201)
    .json({ quiz, message: `Quiz '${title}' created successfully.` });
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
 * @desc    Get teacher analytics dashboard
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
                avgScore: {
                  $avg: { $divide: ['$score', '$totalQuestions'] },
                },
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
