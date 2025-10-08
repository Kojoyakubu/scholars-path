const Badge = require('../models/badgeModel');
const StudentBadge = require('../models/studentBadgeModel');
const QuizAttempt = require('../models/quizAttemptModel');

const awardBadge = async (studentId, badgeName) => {
  try {
    const badge = await Badge.findOne({ name: badgeName });
    if (!badge) return;
    const existingAward = await StudentBadge.findOne({ student: studentId, badge: badge._id });
    if (existingAward) return;
    await StudentBadge.create({ student: studentId, badge: badge._id });
    console.log(`Awarded '${badgeName}' badge to student ${studentId}`);
  } catch (error) {
    console.error(`Error awarding ${badgeName}:`, error);
  }
};

const checkAndAwardQuizBadges = async (studentId, attempt) => {
  const attemptCount = await QuizAttempt.countDocuments({ student: studentId });

  if (attemptCount === 1) await awardBadge(studentId, 'First Step');
  if (attemptCount >= 5) await awardBadge(studentId, 'Quiz Master');
  if (attempt.score === attempt.totalQuestions && attempt.totalQuestions > 0) {
    await awardBadge(studentId, 'High Achiever');
  }
};

module.exports = { checkAndAwardQuizBadges };