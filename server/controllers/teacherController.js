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
    week,
    contentStandardCode,
    indicatorCode,
    classSize,
  } = req.body;

  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    populate: { path: 'subject', populate: { path: 'class' } },
  });

  if (!subStrand) {
    res.status(404);
    throw new Error('Sub-strand not found');
  }

  // ✅ Universal Ghanaian teacher prompt (any subject & class)
  const prompt = `
You are a Ghanaian master teacher and curriculum designer.  
Your task is to create a **well-formatted Markdown lesson note** suitable for any subject and class level in the Ghanaian Basic School Curriculum.

⚠️ IMPORTANT FORMATTING RULES
- Use **pure Markdown** (no HTML tags).
- Keep the **Lesson Phases** strictly inside a **3-column table**.
- Use **<br>** for line breaks *inside table cells only* (valid for Markdown tables).
- Never move "Evaluation" or "Assignment" outside the table.
- Each phase must be a single cell separated by vertical bars \`|\`.

---

### TEACHER INFORMATION

**School:** ${school}  
**Class:** ${className || subStrand.strand.subject.class.name}  
**Subject:** ${subStrand.strand.subject.name}  
**Strand:** ${subStrand.strand.name}  
**Sub-Strand:** ${subStrand.name}  
**Week:** ${week || '[AI to determine week number]'}  
**Week Ending:** [AI to determine Friday date]  
**Day/Date:** ${dayDate}  
**Term:** ${term}  
**Class Size:** ${classSize || '45'}  
**Time/Duration:** ${duration}  
**Content Standard (Code):** ${contentStandardCode || '[AI to generate]'}  
**Indicator (Code):** ${indicatorCode || '[AI to generate]'}  
**Performance Indicator:** ${performanceIndicator}  
**Core Competencies:** [AI to generate, e.g., Communication, Collaboration, Critical Thinking]  
**Teaching & Learning Materials:** [AI to generate, e.g., relevant subject materials]  
**Reference:** [AI to generate, e.g., NaCCA Curriculum or approved Ghana Education Service materials]

---

### **Lesson Phases**

| **PHASE 1: Starter (Preparing the Brain for Learning)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|----------------------------------------------------------|--------------------------------------------------|----------------------------------|
| The facilitator begins the lesson with a quick recap of previous knowledge.<br><br>Learners identify familiar examples related to the topic through brainstorming or pictures.<br><br>The teacher introduces today’s lesson using simple demonstrations or real-life analogies. | **Activity 1:** Introduce the new concept through discussion and demonstration.<br><br>**Activity 2:** Learners perform short tasks or group work to explore the concept.<br><br>**Activity 3:** The class discusses key differences and examples, writing short notes in groups.<br><br>**Evaluation:**<br>1. [Short question 1]<br>2. [Short question 2]<br>3. [Short question 3]<br><br>**Assignment:**<br>Write two sentences explaining how [the topic] applies in your daily life. | The facilitator leads a recap of the key points discussed.<br><br>Learners share what they have learned and answer reflective questions.<br><br>The teacher reinforces key ideas and gives motivational feedback. |

---

**Facilitator:**  
**Vetted By:** ....................................................  
**Signature:** ....................................................  
**Date:** ....................................................  

---

### AI Output Rules
1. Use only Markdown syntax and \`<br>\` for line breaks in table cells.  
2. Ensure all content stays inside the 3-column table.  
3. Keep the Ghanaian classroom tone — clear, engaging, and participatory.  
`;

  const aiContent = await aiService.generateContent(prompt);

  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    content: aiContent,
    metadata: {
      week,
      contentStandardCode,
      indicatorCode,
      classSize,
      term,
      duration,
      performanceIndicator,
      dayDate,
      className,
    },
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
  const prompt = `Based on the following teacher's lesson note, create a simplified and engaging Markdown version suitable for Ghanaian Basic School learners. Keep it clear and friendly:

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
