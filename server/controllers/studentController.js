const LearnerNote = require('../models/learnerNoteModel');
const Quiz = require('../models/quizModel');
const Resource = require('../models/resourceModel');
const Question = require('../models/questionModel');
const Option = require('../models/optionModel');
const QuizAttempt = require('../models/quizAttemptModel');
const SubStrand = require('../models/subStrandModel');
const StudentBadge = require('../models/studentBadgeModel');
const NoteView = require('../models/noteViewModel');
const { checkAndAwardQuizBadges } = require('../services/badgeService');

const getSubjectIdFromSubStrand = async (subStrandId) => {
  const subStrand = await SubStrand.findById(subStrandId).populate({
    path: 'strand',
    select: 'subject'
  });
  return subStrand?.strand?.subject;
};

const getLearnerNotes = async (req, res) => {
  try {
    const notes = await LearnerNote.find({ subStrand: req.params.subStrandId, school: req.user.school });
    res.json(notes);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getQuizzes = async (req, res) => {
  try {
    const subjectId = await getSubjectIdFromSubStrand(req.params.subStrandId);
    if (!subjectId) return res.json([]);
    const quizzes = await Quiz.find({ subject: subjectId, school: req.user.school });
    res.json(quizzes);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ subStrand: req.params.subStrandId, school: req.user.school });
    res.json(resources);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, school: req.user.school });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const questions = await Question.find({ quiz: quiz._id });
    const fullQuestionsData = [];
    for (const question of questions) {
      const options = await Option.find({ question: question._id }).select('-isCorrect');
      fullQuestionsData.push({
        _id: question._id, text: question.text, questionType: question.questionType,
        section: question.section, options: options,
      });
    }
    res.json({ quiz, questions: fullQuestionsData });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const submitQuiz = async (req, res) => {
  const { answers } = req.body;
  if (!answers || answers.length === 0) return res.status(400).json({ message: 'No answers submitted' });
  try {
    let score = 0;
    const questionIds = answers.map(a => a.questionId);
    const correctOptions = await Option.find({ question: { $in: questionIds }, isCorrect: true });
    answers.forEach(studentAnswer => {
      if (correctOptions.some(co => co.question.toString() === studentAnswer.questionId && co._id.toString() === studentAnswer.selectedOptionId)) {
        score++;
      }
    });
    const attempt = await QuizAttempt.create({ quiz: req.params.id, student: req.user._id, school: req.user.school, score, totalQuestions: questionIds.length, answers });
    await checkAndAwardQuizBadges(req.user._id, attempt);
    res.status(200).json({ message: 'Quiz submitted successfully', score: attempt.score, totalQuestions: attempt.totalQuestions });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getMyBadges = async (req, res) => {
  try {
    const myBadges = await StudentBadge.find({ student: req.user._id }).populate('badge');
    res.json(myBadges);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const logNoteView = async (req, res) => {
  try {
    const note = await LearnerNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    const existingView = await NoteView.findOne({ note: note._id, student: req.user._id }).sort({ createdAt: -1 });
    if (!existingView || (new Date() - existingView.createdAt > 60000)) {
        await NoteView.create({ note: note._id, student: req.user._id, teacher: note.author });
    }
    res.status(200).json({ message: 'View logged' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

module.exports = {
  getLearnerNotes, getQuizzes, getResources,
  getQuizDetails, submitQuiz, getMyBadges, logNoteView,
};