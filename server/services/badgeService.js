// /server/services/badgeService.js

/**
 * Scholars Path - Badge Service
 * ---------------------------------
 * Awards and manages learner badges.
 * Now supports AI-based badge suggestions and a dynamic rule system.
 */

const Badge = require('../models/badgeModel');
const StudentBadge = require('../models/studentBadgeModel');
const QuizAttempt = require('../models/quizAttemptModel');
const aiService = require('./aiService');

/**
 * @desc    Core badge awarding logic
 * @param   {ObjectId} studentId
 * @param   {Object} attempt  - QuizAttempt object
 */
async function checkAndAwardQuizBadges(studentId, attempt) {
  if (!attempt || !attempt.quiz || !attempt.score) return;

  // Fetch all existing badges for student to prevent duplicates
  const existingBadges = await StudentBadge.find({ student: studentId });
  const earnedBadgeIds = new Set(existingBadges.map((b) => b.badge.toString()));

  // Dynamic badge rules
  const badgeRules = [
    {
      name: 'Quiz Starter',
      description: 'Completed your first quiz.',
      condition: () => attempt.score >= 0,
    },
    {
      name: 'High Flyer',
      description: 'Scored 90% or above on a quiz.',
      condition: () => (attempt.score / attempt.totalQuestions) * 100 >= 90,
    },
    {
      name: 'Consistency Champ',
      description: 'Attempted 5 or more quizzes.',
      condition: async () => {
        const attempts = await QuizAttempt.countDocuments({ student: studentId });
        return attempts >= 5;
      },
    },
    {
      name: 'Quiz Master',
      description: 'Attempted 10 or more quizzes.',
      condition: async () => {
        const attempts = await QuizAttempt.countDocuments({ student: studentId });
        return attempts >= 10;
      },
    },
  ];

  // Evaluate each rule
  for (const rule of badgeRules) {
    const existingBadge = await Badge.findOne({ name: rule.name });
    if (!existingBadge) continue;

    const conditionPassed = await rule.condition();
    if (conditionPassed && !earnedBadgeIds.has(existingBadge._id.toString())) {
      await StudentBadge.create({
        student: studentId,
        badge: existingBadge._id,
        dateAwarded: new Date(),
      });
      earnedBadgeIds.add(existingBadge._id.toString());
    }
  }
}

/**
 * @desc    Generate AI-based badge ideas
 * @param   {String} learningArea - e.g. "Science", "Mathematics"
 * @param   {String} context - e.g. "quiz performance" or "lesson engagement"
 * @returns {Array} Array of suggested badge ideas
 */
async function generateAIBadgeSuggestions(learningArea = 'General', context = 'quiz performance') {
  const prompt = `
You are a creative educational designer for the Scholars Path app.
Suggest 4 unique badge ideas related to **${learningArea}** learning and **${context}**.

For each badge, include:
- name
- short description (max 15 words)
- one-line earning criteria

Return ONLY valid JSON array like:
[
  {
    "name": "Curiosity Spark",
    "description": "Started exploring Science topics actively.",
    "criteria": "Viewed at least 3 Science lessons."
  }
]
`;

  try {
    const { text } = await aiService.generateTextCore({
      prompt,
      task: 'badgeIdeas',
      jsonNeeded: true,
      temperature: 0.7,
    });

    const ideas = JSON.parse(text);
    return Array.isArray(ideas) ? ideas : [];
  } catch (err) {
    console.error('AI badge suggestion failed:', err.message);
    return [];
  }
}

/**
 * @desc    Add badges dynamically from AI suggestions or admin input
 * @param   {Array} badgeList - [{ name, description, criteria }]
 */
async function addBadges(badgeList = []) {
  const added = [];

  for (const b of badgeList) {
    const exists = await Badge.findOne({ name: b.name });
    if (!exists) {
      const badge = await Badge.create({
        name: b.name,
        description: b.description || '',
        criteria: b.criteria || '',
      });
      added.push(badge);
    }
  }

  return added;
}

/**
 * @desc    Helper for Admin: Generate + add AI badges in one step
 * @route   POST /api/admin/ai-badges
 */
async function generateAndAddAIBadges(area, context) {
  const ideas = await generateAIBadgeSuggestions(area, context);
  const added = await addBadges(ideas);
  return { ideas, addedCount: added.length };
}

module.exports = {
  checkAndAwardQuizBadges,
  generateAIBadgeSuggestions,
  addBadges,
  generateAndAddAIBadges,
};
