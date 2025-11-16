// /server/controllers/studentController.js - ENHANCED WITH DEBUGGING

const asyncHandler = require('express-async-handler');
const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const StudentBadge = require('../models/studentBadgeModel');
const NoteView = require('../models/noteViewModel');
const { checkAndAwardQuizBadges } = require('../services/badgeService');
const aiService = require('../services/aiService');

// --- Helper Function: Score Calculation ---
const calculateQuizScore = (quiz, answers) => {
  const answerMap = new Map(
    answers.map(a => [a.questionId.toString(), a.selectedOptionId.toString()])
  );
  let score = 0;

  for (const question of quiz.questions) {
    const correctOption = question.options.find(o => o.isCorrect);
    const userAnswerId = answerMap.get(question._id.toString());
    if (correctOption && userAnswerId === correctOption._id.toString()) {
      score++;
    }
  }
  return score;
};

// ============================================================================
// 🎓 Student Controllers
// ============================================================================

// @desc  Get learner notes for a specific sub-strand (ENHANCED WITH DEBUGGING)
// @route GET /api/student/notes/:subStrandId
// @access Private/Student
const getLearnerNotes = asyncHandler(async (req, res) => {
  const { subStrandId } = req.params;
  
  console.log('📚 Fetching learner notes:', {
    subStrandId,
    school: req.user.school?._id || req.user.school,
    schoolName: req.user.school?.name,
    student: req.user._id,
    studentName: req.user.fullName
  });

  try {
    // Get school ID (handle both populated and non-populated)
    const schoolId = req.user.school?._id || req.user.school;
    
    if (!schoolId) {
      console.log('❌ No school ID found for user');
      return res.json([]);
    }

    // Find published notes
    const notes = await LearnerNote.find({
      subStrand: subStrandId,
      school: schoolId,
      status: 'published',
    })
    .populate('author', 'fullName email')
    .populate('subStrand', 'name')
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${notes.length} published notes`);
    
    // If no notes found, check why
    if (notes.length === 0) {
      console.log('🔍 Debugging why no notes found...');
      
      // Check if ANY notes exist for this substrand (any status)
      const allSubstrandNotes = await LearnerNote.find({ subStrand: subStrandId });
      console.log(`   - Total notes for substrand (any status): ${allSubstrandNotes.length}`);
      
      if (allSubstrandNotes.length > 0) {
        console.log(`   - Statuses:`, allSubstrandNotes.map(n => n.status));
      }
      
      // Check if ANY notes exist for this school
      const schoolNotes = await LearnerNote.find({ school: schoolId });
      console.log(`   - Total notes for school: ${schoolNotes.length}`);
      
      // Check published notes for this school
      const publishedSchoolNotes = await LearnerNote.find({ 
        school: schoolId, 
        status: 'published' 
      });
      console.log(`   - Published notes for school: ${publishedSchoolNotes.length}`);
      
      if (publishedSchoolNotes.length > 0) {
        console.log(`   - SubStrands with published notes:`, 
          publishedSchoolNotes.map(n => n.subStrand?.toString()).filter(Boolean)
        );
      }
    }
    
    res.json(notes);
    
  } catch (error) {
    console.error('❌ Error fetching learner notes:', error);
    res.status(500).json({ 
      message: 'Error fetching notes', 
      error: error.message 
    });
  }
});

// @desc  Get quizzes for a specific sub-strand (FIXED)
// @route GET /api/student/quizzes/:subStrandId
// @access Private/Student
const getQuizzes = asyncHandler(async (req, res) => {
  const { subStrandId } = req.params;
  
  console.log('🧩 Fetching quizzes:', {
    subStrandId,
    school: req.user.school,
  });

  // First get the sub-strand to find the subject
  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    select: 'subject',
  });

  if (!subStrand || !subStrand.strand || !subStrand.strand.subject) {
    console.log('⚠️ Sub-strand not found or missing subject');
    return res.json([]);
  }

  // Find quizzes for this subject at the same school
  const quizzes = await Quiz.find({
    subject: subStrand.strand.subject,
    school: req.user.school,
  })
  .populate('teacher', 'fullName')
  .sort({ createdAt: -1 });

  console.log(`✅ Found ${quizzes.length} quizzes for subject ${subStrand.strand.subject}`);
  
  res.json(quizzes);
});

// @desc  Get resources for a specific sub-strand (FIXED)
// @route GET /api/student/resources/:subStrandId
// @access Private/Student
const getResources = asyncHandler(async (req, res) => {
  const { subStrandId } = req.params;
  
  console.log('📘 Fetching resources:', {
    subStrandId,
    school: req.user.school,
  });

  // Find resources for this sub-strand at the same school
  const resources = await Resource.find({
    school: req.user.school,
  })
  .populate('teacher', 'fullName')
  .sort({ createdAt: -1 });

  console.log(`✅ Found ${resources.length} resources`);
  
  res.json(resources);
});

// @desc  Get details of a single quiz (hide correct answers)
// @route GET /api/student/quiz/:id
// @access Private/Student
const getQuizDetails = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ 
    _id: req.params.id, 
    school: req.user.school 
  }).populate({
    path: 'questions',
    options: { sort: { createdAt: 1 } },
    populate: { 
      path: 'options', 
      model: 'Option', 
      select: '-isCorrect',
      options: { sort: { createdAt: 1 } }
    },
  });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found or unavailable for your school.');
  }

  // Convert to JSON to include virtuals
  const quizJSON = quiz.toJSON();
  
  console.log('Quiz found:', quizJSON._id);
  console.log('Questions count:', quizJSON.questions?.length);
  console.log('First question has options:', quizJSON.questions?.[0]?.options?.length);

  res.json(quizJSON);
});

// @desc  Submit a quiz and get AI-powered feedback
// @route POST /api/student/quiz/:id/submit
// @access Private/Student
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    res.status(400);
    throw new Error('Answers must be an array.');
  }

  const quiz = await Quiz.findById(req.params.id).populate({
    path: 'questions',
    populate: { path: 'options', model: 'Option' },
  });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found.');
  }

  const score = calculateQuizScore(quiz, answers);

  const attempt = await QuizAttempt.create({
    quiz: quiz._id,
    student: req.user._id,
    school: req.user.school,
    score,
    totalQuestions: quiz.questions.length,
    answers,
  });

  // Asynchronously award badges
  checkAndAwardQuizBadges(req.user._id, attempt);

  // 🧠 Generate personalized AI feedback
  let feedback = '';
  try {
    const prompt = `
You are a Ghanaian educational coach.
Provide short motivational feedback for a student after a quiz.

Subject: ${quiz.subject || 'N/A'}
Quiz Title: ${quiz.title || 'Untitled'}
Total Questions: ${quiz.questions.length}
Score: ${score}
Performance: ${((score / quiz.questions.length) * 100).toFixed(1)}%

Keep it under 6 sentences, positive and constructive.`;

    const result = await aiService.generateTextCore({
      prompt,
      task: 'quizFeedback',
      temperature: 0.6,
      preferredProvider: 'claude',
    });

    feedback = result.text;
  } catch (err) {
    console.error('AI feedback failed:', err.message);
    feedback = 'Good effort! Keep practicing to improve.';
  }

  res.status(200).json({
    message: 'Quiz submitted successfully!',
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: ((score / quiz.questions.length) * 100).toFixed(1),
    feedback,
  });
});

// @desc  Submit auto-graded section (MCQs and True/False only)
// @route POST /api/student/quiz/:id/submit-auto-graded
// @access Private/Student
const submitAutoGradedQuiz = asyncHandler(async (req, res) => {
  console.log('\n=== RECEIVED QUIZ SUBMISSION ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Quiz ID from params:', req.params.id);
  console.log('User:', req.user?._id);
  
  const { answers, score: clientScore } = req.body;

  console.log('Extracted answers:', answers);
  console.log('Type of answers:', typeof answers);
  console.log('Is answers an object?', answers && typeof answers === 'object');
  console.log('Is answers null?', answers === null);
  console.log('Is answers array?', Array.isArray(answers));
  console.log('Number of answers provided:', answers ? Object.keys(answers).length : 0);

  // Modified validation to accept empty objects (student might have skipped all questions)
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    console.log('❌ VALIDATION FAILED: Answers must be a non-array object');
    res.status(400);
    throw new Error('Answers must be an object (not an array).');
  }

  // Allow empty answers object (student gets 0%)
  if (Object.keys(answers).length === 0) {
    console.log('⚠️ WARNING: No answers provided, student will score 0%');
  }

  console.log('✅ Validation passed, fetching quiz...');

  const quiz = await Quiz.findById(req.params.id).populate({
    path: 'questions',
    populate: { path: 'options', model: 'Option' },
  });

  if (!quiz) {
    console.log('❌ Quiz not found with ID:', req.params.id);
    res.status(404);
    throw new Error('Quiz not found.');
  }

  console.log('✅ Quiz found:', quiz._id);
  console.log('Quiz has', quiz.questions?.length, 'questions');

  // All questions in the quiz are considered auto-gradable
  // since we separated objective (MCQ/True-False) from subjective (Short Answer/Essay)
  const autoGradedQuestions = quiz.questions;

  console.log('\n=== BACKEND SCORING DEBUG ===');
  console.log(`Total questions to grade: ${autoGradedQuestions.length}`);

  // Calculate score by checking if the selected option has isCorrect: true
  let correct = 0;
  autoGradedQuestions.forEach((question) => {
    const userAnswerOptionId = answers[question._id.toString()];
    
    console.log(`\nQuestion: ${question.text.substring(0, 50)}...`);
    console.log(`User selected option ID: ${userAnswerOptionId}`);
    console.log(`Question has ${question.options?.length || 0} options`);
    
    if (!userAnswerOptionId) {
      console.log('⚠️ No answer provided for this question');
      return;
    }

    // Find the selected option and check if it's correct
    const selectedOption = question.options.find(
      opt => opt._id.toString() === userAnswerOptionId
    );

    if (selectedOption) {
      console.log(`Selected option text: "${selectedOption.text}"`);
      console.log(`Is correct: ${selectedOption.isCorrect}`);
      
      if (selectedOption.isCorrect === true) {
        correct++;
        console.log('✅ Answer is CORRECT');
      } else {
        console.log('❌ Answer is INCORRECT');
      }
    } else {
      console.log('⚠️ Selected option not found in question options');
    }
  });

  const totalAutoGraded = autoGradedQuestions.length;
  console.log(`\n=== FINAL BACKEND SCORE ===`);
  console.log(`Correct: ${correct}`);
  console.log(`Total: ${totalAutoGraded}`);
  console.log(`Percentage: ${totalAutoGraded > 0 ? Math.round((correct / totalAutoGraded) * 100) : 0}%\n`);
  const percentage = totalAutoGraded > 0 ? Math.round((correct / totalAutoGraded) * 100) : 0;

  // Convert answers object to array format for storage
  const answersArray = Object.keys(answers).map(questionId => ({
    questionId,
    selectedOption: answers[questionId]
  }));

  // Create quiz attempt for auto-graded section only
  const attempt = await QuizAttempt.create({
    quiz: quiz._id,
    student: req.user._id,
    school: req.user.school,
    score: correct,
    totalQuestions: totalAutoGraded,
    answers: answersArray,
    questionType: 'auto-graded',
  });

  // Asynchronously award badges
  checkAndAwardQuizBadges(req.user._id, attempt);

  // 🧠 Generate personalized AI feedback for auto-graded section
  let feedback = '';
  try {
    const prompt = `
You are a Ghanaian educational coach.
Provide short motivational feedback for a student after completing the auto-graded section (MCQs and True/False) of a quiz.

Subject: ${quiz.subject || 'N/A'}
Quiz Title: ${quiz.title || 'Untitled'}
Auto-Graded Questions Answered: ${totalAutoGraded}
Score: ${correct}
Performance: ${percentage}%

Keep it under 6 sentences, positive and constructive. Mention that they should also attempt the written questions in their exercise book.`;

    const result = await aiService.generateTextCore({
      prompt,
      task: 'quizFeedback',
      temperature: 0.6,
      preferredProvider: 'claude',
    });

    feedback = result.text;
  } catch (err) {
    console.error('AI feedback failed:', err.message);
    feedback = 'Good effort on the auto-graded questions! Remember to complete the written questions in your exercise book.';
  }

  res.status(200).json({
    message: 'Auto-graded section submitted successfully!',
    score: correct,
    totalQuestions: totalAutoGraded,
    percentage,
    feedback,
  });
});

// @desc  Get badges earned by logged-in student
// @route GET /api/student/badges
// @access Private/Student
const getMyBadges = asyncHandler(async (req, res) => {
  const myBadges = await StudentBadge.find({ student: req.user._id }).populate(
    'badge',
    'name description icon'
  );
  res.json(myBadges);
});

// @desc  Log that a student viewed a note
// @route POST /api/student/notes/:id/view
// @access Private/Student
const logNoteView = asyncHandler(async (req, res) => {
  const note = await LearnerNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  const existingView = await NoteView.findOne({
    note: note._id,
    student: req.user._id,
  }).sort({ createdAt: -1 });

  const VIEW_COOLDOWN_MS = 60 * 1000;
  if (!existingView || new Date() - existingView.createdAt > VIEW_COOLDOWN_MS) {
    await NoteView.create({
      note: note._id,
      student: req.user._id,
      teacher: note.author,
      school: req.user.school,
    });
    res.status(201).json({ message: 'View logged' });
  } else {
    res.status(200).json({ message: 'View already logged recently' });
  }
});

// @desc  Get the most recent quiz assigned to a student
// @route GET /api/student/quiz/current
// @access Private/Student
const getCurrentQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ school: req.user.school })
    .sort({ createdAt: -1 })
    .limit(1);

  if (!quiz) {
    res.status(404);
    throw new Error('No quiz available currently.');
  }

  res.json(quiz);
});

// @desc  Generate AI insights after a quiz submission
// @route POST /api/student/quiz/insights
// @access Private/Student
const getQuizInsights = asyncHandler(async (req, res) => {
  const { score, totalQuestions, subject, title } = req.body;
  const prompt = `
Generate a short motivational insight for a student who just completed a ${subject} quiz titled "${title}".
They scored ${score}/${totalQuestions}.
Focus on encouragement and next steps in learning.`;

  try {
    const result = await aiService.generateTextCore({
      prompt,
      task: 'quizInsight',
      temperature: 0.7,
      preferredProvider: 'claude',
    });
    res.json({ insight: result.text });
  } catch (err) {
    res.json({ insight: 'Keep studying and you will improve with each quiz!' });
  }
});

module.exports = {
  getLearnerNotes,
  getQuizzes,
  getResources,
  getQuizDetails,
  submitQuiz,
  submitAutoGradedQuiz,
  getMyBadges,
  logNoteView,
  getCurrentQuiz,
  getQuizInsights,
};