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
    subStrandId, school, term, duration,
    performanceIndicator, dayDate, class: className,
  } = req.body;

  const subStrand = await SubStrand.findById(subStrandId).populate({
      path: 'strand',
      populate: { path: 'subject', populate: { path: 'class' } }
  });

  if (!subStrand) {
      res.status(404);
      throw new Error('Sub-strand not found');
  }

  // Final prompt engineered to match the user's high-quality example in both structure and tone.
  const prompt = `
    You are an award-winning master teacher and curriculum designer for the Ghanaian JHS system.
    Your task is to generate a complete, high-quality lesson plan. The output must STRICTLY follow the structure and, most importantly, the pedagogical tone and content style of a master teacher.

    **Teacher-Provided Information:**
    - Topic (Sub-Strand): "${subStrand.name}"
    - School: "${school}"
    - Class: "${className || subStrand.strand.subject.class.name}"
    - Term: "${term}"
    - Duration: "${duration}"
    - Performance Indicator: "${performanceIndicator}"
    - Day/Date: "${dayDate}"

    **Your Task:**
    1.  Logically infer and generate all missing curriculum details.
    2.  Create content for the three lesson phases within a three-column Markdown table.
    3.  **TONE & CONTENT INSTRUCTIONS (CRITICAL):** The content must be practical and descriptive. It should detail the actions of the teacher (facilitator) and the learners. Use active, pedagogical language like "The lesson begins with a quick recap...", "Learners identify familiar devices...", "The facilitator demonstrates...", "Groups explore the strengths and limitations...".
    4.  In the "Phase 2" cell, generate 3-4 distinct activities, each with a title. Also include separate, clearly labeled "Evaluation" and "Assignment" sections at the bottom of this same cell.
    5.  Assemble everything into the final format below.

    **--- START OF REQUIRED OUTPUT FORMAT ---**

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
    **Core Competencies:** [AI to generate, e.g., Critical Thinking, Communication and Collaboration]
    **Teaching & Learning Materials:** [AI to generate, e.g., Actual keyboard, mouse, projector (if available), charts/pictures of devices]
    **Reference:** [AI to generate, e.g., NaCCA Computing Curriculum for JHS 1]

    ### **Lesson Phases**

    | PHASE 1: Starter (preparing the brain for learning) | PHASE 2: Main (new learning including assessment) | PHASE 3: Plenary/Reflections |
    | :--- | :--- | :--- |
    | The lesson begins with a quick recap of [relevant prior topic].<br><br>Learners identify familiar examples related to the new topic, such as [example 1] and [example 2].<br><br>A short visual (e.g., video or slideshow) is shown to set the stage for deeper exploration. | **Activity 1: [Descriptive Title]**<br>The facilitator demonstrates [concept 1]. Learners observe and handle [materials or examples]. They describe how each item works.<br><br>**Activity 2: [Descriptive Title]**<br>The class discusses the difference between [concept A] and [concept B]. A simple two-column chart is created to compare the two categories.<br><br>**Activity 3: [Descriptive Title]**<br>Groups explore the strengths and limitations of [the topic]. Findings are shared with the whole class.<br><br>**Activity 4: [Descriptive Title]**<br>Learners brainstorm where [the topic] is commonly used, such as [real-world example 1] and [real-world example 2].<br><br>**Evaluation**<br>1. [Question 1]<br>2. [Question 2]<br>3. [Question 3]<br><br>**Assignment**<br>[A concise, relevant take-home assignment.] | The session is rounded off with a recap of the key learning points.<br><br>Learners reflect on the question: “[A deep, reflective question related to the topic.]” |

    **Facilitator:**
    **Vetted By:** ....................................................
    **Signature:** ....................................................
    **Date:** ....................................................
    **--- END OF REQUIRED OUTPUT FORMAT ---**
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
  if (!note) { res.status(404); throw new Error('Lesson note not found'); }
  if (note.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('User not authorized to view this note');
  }
  res.json(note);
});

/**
 * @desc    Delete a lesson note
 */
const deleteLessonNote = asyncHandler(async (req, res) => {
  const note = await LessonNote.findById(req.params.id);
  if (!note) { res.status(404); throw new Error('Lesson note not found'); }
  if (note.teacher.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('User not authorized to delete this note');
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
    if (!lessonNote) { res.status(404); throw new Error('Lesson note not found'); }
    const prompt = `Based on the following teacher's lesson note, create a simplified, engaging, and easy-to-understand version for students:\n\n${lessonNote.content}`;
    const learnerContent = await aiService.generateContent(prompt);
    const learnerNote = await LearnerNote.create({
        author: req.user._id, school: req.user.school, subStrand: lessonNote.subStrand, content: learnerContent,
    });
    res.status(201).json(learnerNote);
});

/**
 * @desc    Create a new quiz
 */
const createQuiz = asyncHandler(async (req, res) => {
    const { title, subjectId } = req.body;
    const quiz = await Quiz.create({ title, subject: subjectId, teacher: req.user._id, school: req.user.school });
    res.status(201).json({ quiz, message: `Quiz '${title}' created successfully.` });
});

/**
 * @desc    Upload a resource file
 */
const uploadResource = asyncHandler(async (req, res) => {
    if (!req.file) { res.status(400); throw new Error('Please upload a file'); }
    const { subStrandId } = req.body;
    const resource = await Resource.create({
        teacher: req.user._id, school: req.user.school, subStrand: subStrandId,
        fileName: req.file.originalname, filePath: req.file.path, fileType: req.file.mimetype,
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
  deleteLessonNote,
  generateLearnerNote,
  createQuiz,
  uploadResource,
  getTeacherAnalytics,
};