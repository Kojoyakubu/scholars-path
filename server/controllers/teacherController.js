const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');
const Resource = require('../models/resourceModel');
const NoteView = require('../models/noteViewModel');
const QuizAttempt = require('../models/quizAttemptModel');
const mongoose = require('mongoose');

// @desc    Generate a lesson note with AI
const generateLessonNote = async (req, res) => {
  const { subStrandId, objectives, aids, duration } = req.body;
  const simulatedAIResponse = `## AI Generated Lesson Note\nThis is a sample lesson note.`;
  
  const lessonNote = await LessonNote.create({
    teacher: req.user._id,
    subStrand: subStrandId,
    content: simulatedAIResponse,
    learningObjectives: objectives,
    teachingAids: aids,
    duration: duration,
    school: req.user.school, // Links the note to the teacher's school
  });
  res.status(201).json(lessonNote);
};

// @desc    Generate a learner note with AI
const generateLearnerNote = async (req, res) => {
  const { subStrandId, topic } = req.body;
  const simulatedAIResponse = `## AI Generated Learner Note on ${topic}\nThis is a sample note for students.`;

  const learnerNote = await LearnerNote.create({
    author: req.user._id,
    subStrand: subStrandId,
    content: simulatedAIResponse,
    school: req.user.school, // Links the note to the teacher's school
  });
  res.status(201).json(learnerNote);
};

// @desc    Create a new quiz
const createQuiz = async (req, res) => {
  const { title, subjectId, questions } = req.body;
  try {
    const quiz = await Quiz.create({ 
      title, 
      subject: subjectId, 
      teacher: req.user._id,
      school: req.user.school, // Links the quiz to the teacher's school
    });
    for (const q of questions) {
      const question = await Question.create({ quiz: quiz._id, section: q.section, text: q.text, questionType: q.questionType });
      if (q.questionType === 'MCQ' && q.options) {
        for (const opt of q.options) {
          await Option.create({ question: question._id, text: opt.text, isCorrect: opt.isCorrect });
        }
      }
    }
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating quiz' });
  }
};

// @desc    Generate a single question with AI
const generateAiQuestion = async (req, res) => {
  const { topic, questionType } = req.body;
  let simulatedAiJsonResponse;
  if (questionType === 'MCQ') {
    simulatedAiJsonResponse = {
      text: `AI MCQ for '${topic}'?`,
      options: [ { text: "Correct", isCorrect: true }, { text: "Incorrect", isCorrect: false } ]
    };
  } else {
    simulatedAiJsonResponse = { text: `AI Essay question for '${topic}'?` };
  }
  res.status(200).json(simulatedAiJsonResponse);
};

// @desc    Upload a resource file
const uploadResource = async (req, res) => {
  const { subStrandId } = req.body;
  if (req.file) {
    const resource = await Resource.create({
      teacher: req.user._id,
      subStrand: subStrandId,
      school: req.user.school, // Links the resource to the teacher's school
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
    });
    res.status(201).json(resource);
  } else {
    res.status(400).json({ message: 'Please upload a file' });
  }
};

// @desc    Generate a batch of AI questions for a quiz section
const generateAiQuizSection = async (req, res) => {
    const { topics, questionType, count } = req.body;
    let simulatedAiJsonResponse = [];
    for (let i = 0; i < count; i++) {
        simulatedAiJsonResponse.push({
            text: `Simulated ${questionType} ${i + 1} for topics: ${topics.join(', ')}?`,
            options: questionType === 'MCQ' ? [ { text: "Correct", isCorrect: true }, { text: "Incorrect", isCorrect: false } ] : []
        });
    }
    res.status(200).json(simulatedAiJsonResponse);
};

// @desc    Get analytics for the logged-in teacher
const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const schoolId = req.user.school; // The teacher's school

    // 1. Get total views on notes created by this teacher FROM THEIR SCHOOL
    const totalNoteViews = await NoteView.countDocuments({ 
      teacher: teacherId,
      // We can't filter by school here directly, as the NoteView model doesn't have it.
      // A future enhancement would be to add schoolId to NoteView.
    });

    // 2. Get total attempts on quizzes created by this teacher FROM THEIR SCHOOL
    const quizzes = await Quiz.find({ teacher: teacherId, school: schoolId }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    let totalQuizAttempts = 0;
    let averageScore = 0;

    if (quizIds.length > 0) {
      // Find attempts only from students in the same school
      totalQuizAttempts = await QuizAttempt.countDocuments({ 
        quiz: { $in: quizIds },
        school: schoolId,
      });

      const averageScoreAggregation = await QuizAttempt.aggregate([
        // Match attempts for this teacher's quizzes AND from their school
        { $match: { 
          quiz: { $in: quizIds.map(id => new mongoose.Types.ObjectId(id)) },
          school: new mongoose.Types.ObjectId(schoolId),
          totalQuestions: { $gt: 0 } 
        }},
        { $group: {
            _id: null,
            avgScore: { $avg: { $divide: ["$score", "$totalQuestions"] } }
        }}
      ]);

      if (averageScoreAggregation.length > 0) {
        averageScore = averageScoreAggregation[0].avgScore * 100;
      }
    }

    res.json({
      totalNoteViews,
      totalQuizAttempts,
      averageScore: averageScore.toFixed(2),
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  generateLessonNote,
  generateLearnerNote,
  createQuiz,
  generateAiQuestion,
  uploadResource,
  generateAiQuizSection,
  getTeacherAnalytics,
};