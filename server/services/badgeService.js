// server/services/badgeService.js

const Badge = require('../models/badgeModel');
const StudentBadge = require('../models/studentBadgeModel');
const QuizAttempt = require('../models/quizAttemptModel');

/**
 * A list of rules that define the criteria for awarding quiz-related badges.
 * This data-driven approach makes it easy to add new badges.
 *
 * @property {string} name - The unique name of the badge in the database.
 * @property {function(object): boolean} condition - A function that returns true if the badge should be awarded.
 */
const badgeRules = [
  {
    name: 'First Step',
    condition: ({ attemptCount }) => attemptCount === 1,
  },
  {
    name: 'Quiz Master',
    condition: ({ attemptCount }) => attemptCount >= 5,
  },
  {
    name: 'High Achiever',
    condition: ({ latestAttempt }) =>
      latestAttempt.score === latestAttempt.totalQuestions && latestAttempt.totalQuestions > 0,
  },
  // Add new badge rules here in the future!
  // {
  //   name: 'Speed Runner',
  //   condition: ({ latestAttempt }) => latestAttempt.timeTakenInSeconds < 60,
  // },
];

/**
 * Checks a student's latest quiz attempt and overall progress to award badges.
 * This function is optimized to minimize database calls.
 * @param {string} studentId - The ID of the student who completed the quiz.
 * @param {object} latestAttempt - The mongoose document of the latest quiz attempt.
 */
const checkAndAwardQuizBadges = async (studentId, latestAttempt) => {
  try {
    // 1. Fetch all necessary data in parallel for performance.
    const [attemptCount, allBadges, studentBadgeDocs] = await Promise.all([
      QuizAttempt.countDocuments({ student: studentId }),
      Badge.find({}).lean(), // .lean() for a fast, plain JS object read-only query
      StudentBadge.find({ student: studentId }).select('badge').lean(),
    ]);

    // 2. Create efficient lookups for in-memory processing.
    const badgeMap = new Map(allBadges.map(b => [b.name, b._id]));
    const ownedBadgeIds = new Set(studentBadgeDocs.map(sb => sb.badge.toString()));

    // 3. Determine which new badges to award.
    const badgesToAward = [];
    const context = { attemptCount, latestAttempt };

    for (const rule of badgeRules) {
      const badgeId = badgeMap.get(rule.name);
      // Check if:
      // - The badge exists in the database
      // - The student meets the condition
      // - The student does not already own the badge
      if (badgeId && rule.condition(context) && !ownedBadgeIds.has(badgeId.toString())) {
        badgesToAward.push({
          student: studentId,
          badge: badgeId,
        });
        console.log(`Queueing badge '${rule.name}' for student ${studentId}`);
      }
    }

    // 4. If there are new badges to award, insert them all in a single database operation.
    if (badgesToAward.length > 0) {
      await StudentBadge.insertMany(badgesToAward);
      console.log(`Successfully awarded ${badgesToAward.length} new badge(s) to student ${studentId}`);
    }
  } catch (error) {
    // The service should not crash the main request (e.g., quiz submission).
    // It logs the error for later debugging.
    console.error(`An error occurred in the badge awarding service for student ${studentId}:`, error);
  }
};

module.exports = { checkAndAwardQuizBadges };