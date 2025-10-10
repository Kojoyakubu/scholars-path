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
const mongoose = require('mongoose');

// @desc    Get all lesson notes for the logged-in teacher
const getMyLessonNotes = async (req, res) => {
  try {
    const notes = await LessonNote.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("Get Lesson Notes Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Generate a lesson note with AI
const generateLessonNote = async (req, res) => {
  const { subStrandId, objectives, aids, duration } = req.body;
  try {
    const subStrand = await SubStrand.findById(subStrandId).populate({
      path: 'strand',
      populate: {
        path: 'subject',
        populate: {
          path: 'class',
          populate: 'level'
        }
      }
    });

    if (!subStrand) {
      return res.status(404).json({ message: 'Curriculum sub-strand not found.' });
    }

    const prompt = `
      Act as an expert curriculum developer in Ghana. Generate a detailed lesson note based on the NaCCA curriculum format.

      **Template to Follow:**
      # **LESSON NOTE**

      
      - **School:** 
      - **Teacher’s Name:** ${req.user.fullName}
      - **Subject:** ${subStrand.strand.subject.name}
      - **Class:** ${subStrand.strand.subject.class.name}
      - **Date:** ${new Date().toLocaleDateString('en-GB')}
      - **Duration:** ${duration}
      - **Strand:** ${subStrand.strand.name}
      - **Sub-Strand:** ${subStrand.name}
      - **Content Standard:** [Generate a relevant content standard for this sub-strand]
      - **Indicator(s):** [Generate 1-2 specific indicators for this lesson]
      - **Core Competencies:** Communication and Collaboration, Critical Thinking, Creativity
      - **Subject Values:** Respect, Teamwork

      ---

      ### **2. Lesson Objectives**
      By the end of the lesson, the pupil will be able to:
      ${objectives}

      ---

      ### **3. Teaching and Learning Resources (TLR)**
      - ${aids}
      - Textbook
      - Whiteboard and Markers

      ---

      ### **4. Core Activities**
      #### **(a) Starter / Introduction (5-10 mins)**
      - Generate a brief, engaging starter activity. Revise a potential previous lesson.

      #### **(b) Main Activities (25-30 mins)**
      - Generate a step-by-step procedure for the main lesson activities. Detail both teacher and learner roles. Suggest a group activity.

      #### **(c) Conclusion (5-10 mins)**
      - Generate a summary of key points, a reflection question for learners, and a relevant homework assignment.

      ---

      ### **5. Evaluation / Assessment**
      - Generate 2-3 short, relevant questions to check for understanding.

      ---

      ### **6. Plenary**
      - Generate a brief concluding statement for the teacher.
    `;

    const aiGeneratedContent = await aiService.generateContent(prompt);

    const lessonNote = await LessonNote.create({
      teacher: req.user._id,
      subStrand: subStrandId,
      content: aiGeneratedContent.trim(),
      learningObjectives: objectives,
      teachingAids: aids,
      duration: duration,
      school: req.user.school,
    });

    res.status(201).json(lessonNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate AI lesson note.' });
  }
};

// @desc    Generate a learner note with AI
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

// @desc    Create a new quiz
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
    if (averageScoreAggregation.length > 0 && averageScoreAggregation[0].avgScore) {
      averageScore = averageScoreAggregation[0].avgScore * 100;
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
  getMyLessonNotes,
  generateLessonNote,
  generateLearnerNote,
  createQuiz,
  generateAiQuestion,
  uploadResource,
  generateAiQuizSection,
  getTeacherAnalytics,
};