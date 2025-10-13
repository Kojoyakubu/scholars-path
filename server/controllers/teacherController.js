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

  // Final prompt engineered to produce a linear, top-to-bottom document.
  const prompt = `
    You are an award-winning master teacher for the Ghanaian JHS system.
    Your task is to generate a complete, high-quality lesson plan. The output must STRICTLY follow the linear Markdown format below, using headings and bold text. DO NOT use a table for the lesson phases.

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
    2.  Create high-quality, descriptive content for each lesson phase, detailing the actions of the "facilitator" and "learners" in a professional tone.
    3.  Assemble everything into the final format below.

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
    **Content Standard (Code):** [AI to generate]
    **Indicator (Code):** [AI to generate]
    **Performance Indicator:** ${performanceIndicator}
    **Core Competencies:** [AI to generate]
    **Teaching & Learning Materials:** [AI to generate]
    **Reference:** [AI to generate]

    ---
    ### **Lesson Phases**

    #### **Phase 1: Starter (Preparing the brain for learning)**
    [AI to generate content describing a recap and introductory activity. Example: "The facilitator begins the lesson with a quick recap... Learners identify familiar examples..."]

    ---

    #### **Phase 2: Main (New learning including assessment)**

    **Activity 1: [Descriptive Title]**
    [AI to generate content for the first teacher-led activity.]

    **Activity 2: [Descriptive Title]**
    [AI to generate content for a student-centered group activity.]

    **Activity 3: [Descriptive Title]**
    [AI to generate content for another activity to deepen understanding.]

    ---

    **Evaluation**
    1. [Generate a relevant evaluation question.]
    2. [Generate a second relevant evaluation question.]
    3. [Generate a third relevant evaluation question.]

    ---

    **Assignment**
    [Generate a concise, relevant take-home assignment.]

    ---

    #### **Phase 3: Plenary / Reflection**
    [AI to generate a summary of the key learning points and a final reflective question.]

    ---

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


// --- (The rest of the controller functions remain the same) ---

const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
});

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

const generateLearnerNote = asyncHandler(async (req, res) => {
  const { lessonNoteId } = req.body;
  const lessonNote = await LessonNote.findById(lessonNoteId);
  if (!lessonNote) {
    res.status(404);
    throw new Error('Lesson note not found');
  }
  const prompt = `Based on the following teacher's lesson note, create a simplified, engaging, and easy-to-understand version for students:\n\n${lessonNote.content}`;
  const learnerContent = await aiService.generateContent(prompt);
  const learnerNote = await LearnerNote.create({
    author: req.user._id,
    school: req.user.school,
    subStrand: lessonNote.subStrand,
    content: learnerContent,
  });
  res.status(201).json(learnerNote);
});

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