const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');
const Resource = require('../models/resourceModel');
const NoteView = require('../models/noteViewModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const aiService = require('../services/aiService');

// @desc    Get all lesson notes for the logged-in teacher
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
});

// @desc    Generate a lesson note with AI
const generateLessonNote = asyncHandler(async (req, res) => {
  // Destructure all the new fields from the request body
  const {
    subStrandId, objectives, aids, duration,
    contentStandard, performanceIndicator, coreCompetencies
  } = req.body;

  const subStrand = await SubStrand.findById(subStrandId).populate({
      path: 'strand',
      populate: { path: 'subject', populate: { path: 'class', populate: 'level' } }
  });

  if (!subStrand) {
      res.status(404);
      throw new Error('Sub-strand not found');
  }

  // ✅ NEW, HIGHLY STRUCTURED PROMPT
  const prompt = `
    You are an expert curriculum developer for the Ghanaian Basic School system.
    Your task is to generate a complete lesson note that STRICTLY follows the Markdown table format below.
    The current date is October 12, 2025. Generate a relevant week and date for the lesson.
    Do not add any text or explanation before or after the Markdown table.

    **SCHOOL:** ${req.user.school?.name || 'APERADI PRESBY BASIC SCHOOL'}, **CLASS:** ${subStrand.strand.subject.class.name}, **STRAND:** ${subStrand.strand.name}
    --- | --- | ---
    **WEEK ENDING:** [Generate a relevant Friday date], **CLASS SIZE:** 45, **SUBSTRAND:** ${subStrand.name}
    **LESSON:** 1 OUT OF 1, **TERM:** ONE, **CONTENT STANDARD (CODE):** ${contentStandard}
    **SUBJECT:** ${subStrand.strand.subject.name}, **WEEK:** [Generate a relevant week number, e.g., 7], **CORE COMPETENCIES:** ${coreCompetencies}
    **TEACHING LEARNING MATERIALS:** ${aids}, **INDICATOR (CODE):** ${contentStandard}, **PERFORMANCE INDICATOR:** ${performanceIndicator}
    **REFERENCE:** Computing Curriculum for Basic 7, **DAY/DATE:** [Generate a relevant Monday date], **TIME/DURATION/PERIOD:** ${duration}
    **NAME OF THE FACILITATOR:** ${req.user.fullName}
    **VETTED BY:** ............................................................................................................................
    **SIGNATURE:** ............................................................................................................................
    **DATE:** .....................................................................................................................................

    **PHASE 1: Starter (preparing the brain for learning)** | **PHASE 2: Main (new learning including assessment)** | **PHASE 3: Plenary/Reflections**
    --- | --- | ---
    [Generate a 2-3 sentence engaging starter activity to recap prior knowledge and introduce the topic of "${subStrand.name}".] | **Activity 1: [Give a descriptive title]**<br>[Generate a teacher-led activity to introduce the core concepts based on the learning objectives: "${objectives}".]<br><br>**Activity 2: [Give a descriptive title]**<br>[Generate a hands-on or group activity for learners to practice or explore the concept.]<br><br>**Activity 3: [Give a descriptive title]**<br>[Generate another activity to deepen understanding, perhaps involving real-world applications.]<br><br>**Evaluation**<br>1. [Generate a relevant question based on the objectives.]<br>2. [Generate a second relevant question.]<br>3. [Generate a third relevant question.]<br><br>**Assignment**<br>[Generate a concise, relevant take-home assignment.] | [Generate a 1-2 sentence summary of the key learning points.]<br><br>[Generate a reflective question for learners, like "How can you use this knowledge in your daily life?"]
  `;

  const aiContent = await aiService.generateContent(prompt);

  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    school: req.user.school,
    subStrand: subStrandId,
    content: aiContent,
    learningObjectives: objectives,
    teachingAids: aids,
    duration,
  });
  res.status(201).json(lessonNote);
});

// @desc    Get a single lesson note by ID
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

// @desc    Delete a lesson note
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

// @desc    Generate a learner's version of a lesson note
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

// @desc    Create a new quiz
const createQuiz = asyncHandler(async (req, res) => {
    const { title, subjectId } = req.body;
    const quiz = await Quiz.create({ title, subject: subjectId, teacher: req.user._id, school: req.user.school });
    res.status(201).json({ quiz, message: `Quiz '${title}' created successfully.` });
});

// @desc    Upload a resource file
const uploadResource = asyncHandler(async (req, res) => {
    if (!req.file) { res.status(400); throw new Error('Please upload a file'); }
    const { subStrandId } = req.body;
    const resource = await Resource.create({
        teacher: req.user._id, school: req.user.school, subStrand: subStrandId,
        fileName: req.file.originalname, filePath: req.file.path, fileType: req.file.mimetype,
    });
    res.status(201).json(resource);
});

// @desc    Get teacher analytics dashboard
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