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
  // Destructure the simplified inputs provided by the teacher
  const {
    subStrandId,
    school, // Compulsory
    term, // Compulsory
    duration, // Compulsory
    performanceIndicator, // Compulsory
    dayDate, // Compulsory
    class: className, // Optional
  } = req.body;

  const subStrand = await SubStrand.findById(subStrandId).populate({
      path: 'strand',
      populate: { path: 'subject', populate: { path: 'class' } }
  });

  if (!subStrand) {
      res.status(404);
      throw new Error('Sub-strand not found');
  }

  // This intelligent prompt instructs the AI to act as a curriculum expert,
  // filling in the blanks logically based on the teacher's input.
  const prompt = `
    You are an expert curriculum developer for the Ghanaian Basic School system.
    Your task is to generate a complete lesson plan based on the provided information.
    You must STRICTLY follow the structure and formatting below. Do not add any extra text or explanations.

    **Teacher-Provided Information:**
    - Topic (Sub-Strand): "${subStrand.name}"
    - School: "${school}"
    - Class: "${className || subStrand.strand.subject.class.name}"
    - Term: "${term}"
    - Duration: "${duration}"
    - Performance Indicator: "${performanceIndicator}"
    - Day/Date: "${dayDate}"

    **Your Task:**
    1. Based on the Topic and Performance Indicator, logically infer and generate the missing curriculum details: **Subject, Strand, Content Standard (Code), Indicator (Code), Core Competencies, Teaching & Learning Materials, and Reference**.
    2. Infer a relevant **Week** and **Week Ending** date based on the provided Day/Date.
    3. Assume a **Class Size** of 45.
    4. Create engaging and pedagogically sound content for the three **Lesson Phases** (Starter, Main, and Plenary). The "Main" phase must include distinct activities, an evaluation section, and an assignment.
    5. Assemble everything into the final Markdown format below. Leave 'Vetted By', 'Signature', and 'Date' blank.

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

    **Core Competencies:** [AI to generate, e.g., Critical Thinking, Communication]

    **Teaching & Learning Materials:** [AI to generate, e.g., Whiteboard, markers, projector]

    **Reference:** [AI to generate, e.g., NaCCA Computing Curriculum for JHS]

    ### **Lesson Phases**

    | Phase 1: Starter (Preparing the brain for learning) | Phase 2: Main (New learning including assessment) | Phase 3: Plenary / Reflection |
    | :--- | :--- | :--- |
    | [AI to generate brief starter content.] | **Activity 1: [Title]**<br>[AI to generate content.]<br><br>**Activity 2: [Title]**<br>[AI to generate content.]<br><br>**Evaluation**<br>1. [Question 1]<br>2. [Question 2]<br><br>**Assignment**<br>[AI to generate assignment.] | [AI to generate plenary and reflection content.] |

    **Facilitator:** **Vetted By:** ....................................................

    **Signature:** ....................................................

    **Date:** ....................................................
    **--- END OF REQUIRED OUTPUT FORMAT ---**
  `;

  const aiContent = await aiService.generateContent(prompt);

  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    school: req.user.school, // Note: req.user.school might be different from the one provided in the form
    subStrand: subStrandId,
    content: aiContent,
  });
  res.status(201).json(lessonNote);
});


/**
 * @desc    Get all lesson notes for the logged-in teacher
 * @route   GET /api/teacher/lessonnotes
 * @access  Private (Teacher)
 */
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
});

/**
 * @desc    Get a single lesson note by ID
 * @route   GET /api/teacher/notes/:id
 * @access  Private (Teacher)
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
 * @route   DELETE /api/teacher/notes/:id
 * @access  Private (Teacher)
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
 * @route   POST /api/teacher/generate-learner-note
 * @access  Private (Teacher)
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
 * @route   POST /api/teacher/create-quiz
 * @access  Private (Teacher)
 */
const createQuiz = asyncHandler(async (req, res) => {
    const { title, subjectId } = req.body;
    const quiz = await Quiz.create({ title, subject: subjectId, teacher: req.user._id, school: req.user.school });
    res.status(201).json({ quiz, message: `Quiz '${title}' created successfully.` });
});

/**
 * @desc    Upload a resource file
 * @route   POST /api/teacher/upload-resource
 * @access  Private (Teacher)
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
 * @route   GET /api/teacher/analytics
 * @access  Private (Teacher)
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