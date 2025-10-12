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

  // ✅ Dynamic Facilitator name from logged-in user
  const facilitatorName = req.user.name || 'Teacher';

  // ✅ Stronger AI prompt with Ghanaian JHS tone and Markdown format
  const prompt = `
You are a Ghanaian master teacher and curriculum designer.
Your task is to create a **high-quality Markdown lesson note** for the JHS Computing curriculum.

⚠️ IMPORTANT FORMATTING RULES
- Output must be **pure Markdown**, not HTML.
- Keep the **Lesson Phases** strictly in a **3-column Markdown table**.
- Use **<br>** for line breaks *inside* table cells.
- Do **not** let any content appear outside the table.
- All "Evaluation" and "Assignment" sections must stay **inside** the Phase 2 column.
- Each phase (1, 2, 3) should be exactly one cell separated by \`|\`.

---

### TEACHER INFORMATION

**School:** ${school}  
**Class:** ${className || subStrand.strand.subject.class.name}  
**Subject:** ${subStrand.strand.subject.name}  
**Strand:** ${subStrand.strand.name}  
**Sub-Strand:** ${subStrand.name}  
**Week:** [AI to determine week number]  
**Week Ending:** [AI to determine Friday date]  
**Day/Date:** ${dayDate}  
**Term:** ${term}  
**Class Size:** 45  
**Time/Duration:** ${duration}  
**Content Standard (Code):** [AI to generate, e.g., B7.X.X.X]  
**Indicator (Code):** [AI to generate, e.g., B7.X.X.X.X]  
**Performance Indicator:** ${performanceIndicator}  
**Core Competencies:** [AI to generate, e.g., Critical Thinking, Communication, Collaboration]  
**Teaching & Learning Materials:** [AI to generate, e.g., Computer, charts, projector, pictures of devices]  
**Reference:** [AI to generate, e.g., NaCCA Computing Curriculum for JHS 1]

---

### **Lesson Phases**

| **PHASE 1: Starter (Preparing the Brain for Learning)** | **PHASE 2: Main (New Learning & Assessment)** | **PHASE 3: Plenary/Reflection** |
|----------------------------------------------------------|--------------------------------------------------|----------------------------------|
| The facilitator begins the lesson with a quick recap of previous knowledge.<br><br>Learners identify familiar examples related to the topic through brainstorming or pictures.<br><br>The teacher introduces today’s lesson using simple demonstrations or real-life examples. | **Activity 1:** Introduce the new concept through discussion and demonstration.<br><br>**Activity 2:** Learners perform group or pair activities to explore the new idea.<br><br>**Activity 3:** The facilitator guides the class to record key points on the board.<br><br>**Evaluation:**<br>1. [Short question 1]<br>2. [Short question 2]<br>3. [Short question 3]<br><br>**Assignment:**<br>Write a short paragraph describing where [the topic] can be applied in your daily life. | The facilitator leads a recap of the key learning points.<br><br>Learners share what they have learned and answer reflective questions.<br><br>The teacher reinforces understanding and motivates learners to apply knowledge practically. |

---

**Facilitator:** ${facilitatorName}  
**Vetted By:** ....................................................  
**Signature:** ....................................................  
**Date:** ....................................................  

---

### AI Output Rules
1. Use only Markdown syntax and \`<br>\` for line breaks in table cells.  
2. Keep all lesson phases inside the table.  
3. Maintain a Ghanaian JHS teacher’s tone: clear, engaging, and practical.
`;

  // ✅ Generate content using AI
  const aiContent = await aiService.generateContent(prompt);

  // ✅ Fallback: Ensure the Facilitator footer always appears
  const facilitatorFooter = `
\n\n**Facilitator:** ${facilitatorName}\n**Vetted By:** ....................................................\n**Signature:** ....................................................\n**Date:** ....................................................\n
`;

  const finalContent = aiContent.includes('**Facilitator:**')
    ? aiContent
    : aiContent + facilitatorFooter;

  // ✅ Save lesson note
  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    content: finalContent,
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
  res.status(200).json({ id: req.params.id, message: 'Lesson note deleted successfully' });
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

  const prompt = `Based on the following teacher's lesson note, create a simplified and engaging version for learners:\n\n${lessonNote.content}`;
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
 * @desc    Get teacher analytics dashboard
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
