const LessonNote = require('../models/lessonNoteModel');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');
const Resource = require('../models/resourceModel');
const NoteView = require('../models/noteViewModel');
const QuizAttempt = require('../models/quizAttemptModel');
const mongoose = require('mongoose');

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
    school: req.user.school,
  });
  res.status(201).json(lessonNote);
};

const generateLearnerNote = async (req, res) => {
  const { subStrandId, topic } = req.body;
  const simulatedAIResponse = `## AI Generated Learner Note on ${topic}\nThis is a sample note for students.`;

  const learnerNote = await LearnerNote.create({
    author: req.user._id,
    subStrand: subStrandId,
    content: simulatedAIResponse,
    school: req.user.school,
  });
  res.status(201).json(learnerNote);
};

const createQuiz = async (req, res) => {
  const { title, subjectId, questions } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [quiz] = await Quiz.create([{ 
        title, 
        subject: subjectId, 
        teacher: req.user._id, 
        school: req.user.school 
    }], { session });

    if (!questions || questions.length === 0) {
      throw new Error('A quiz must have at least one question.');
    }

    const questionDocs = questions.map(q => ({
        quiz: quiz._id,
        section: q.section,
        text: q.text,
        questionType: q.questionType
    }));
    const createdQuestions = await Question.insertMany(questionDocs, { session });

    const optionsToCreate = [];
    createdQuestions.forEach((createdQ, index) => {
      const originalQuestion = questions[index];
      if (originalQuestion.questionType === 'MCQ' && originalQuestion.options && originalQuestion.options.length > 0) {
        originalQuestion.options.forEach(opt => {
          optionsToCreate.push({
            question: createdQ._id,
            text: opt.text,
            isCorrect: opt.isCorrect
          });
        });
      }
    });
    
    if (optionsToCreate.length > 0) {
      await Option.insertMany(optionsToCreate, { session });
    }

    await session.commitTransaction();
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

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

const uploadResource = async (req, res) => {
  const { subStrandId } = req.body;
  if (req.file) {
    const resource = await Resource.create({
      teacher: req.user._id,
      subStrand: subStrandId,
      school: req.user.school,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
    });
    res.status(201).json(resource);
  } else {
    res.status(400).json({ message: 'Please upload a file' });
  }
};

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

const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const schoolId = req.user.school;

    const quizzes = await Quiz.find({ teacher: teacherId, school: schoolId }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    const [totalNoteViews, totalQuizAttempts, averageScoreAggregation] = await Promise.all([
      NoteView.countDocuments({ teacher: teacherId, school: schoolId }),
      QuizAttempt.countDocuments({ quiz: { $in: quizIds }, school: schoolId }),
      quizIds.length > 0 ? QuizAttempt.aggregate([
        { $match: { 
          quiz: { $in: quizIds },
          school: schoolId,
          totalQuestions: { $gt: 0 } 
        }},
        { $group: {
            _id: null,
            avgScore: { $avg: { $divide: ["$score", "$totalQuestions"] } }
        }}
      ]) : Promise.resolve([])
    ]);

    let averageScore = 0;
    if (averageScoreAggregation.length > 0) {
      averageScore = (averageScoreAggregation[0].avgScore || 0) * 100;
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