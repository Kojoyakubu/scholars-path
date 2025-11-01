const asyncHandler = require('express-async-handler');
const aiService = require('../services/aiService');

/**
 * @desc    Get personalized AI insights for a user during onboarding or on the landing page.
 * @route   GET /api/ai/onboarding/insights
 * @access  Private (requires user to be logged in)
 */
const getOnboardingInsights = asyncHandler(async (req, res) => {
  // The 'protect' middleware has already added the 'user' object to the request.
  const user = req.user;

  // We can pass user details to the AI service for a more personalized message.
  const details = {
    role: user?.role || 'user',
    name: user?.fullName || 'Friend',
  };

  // The function you created in the service layer is now named getLandingInsights,
  // let's rename it to getPersonalizedInsight for clarity. Or, we can just call it.
  // For now, let's assume the function in aiService is getLandingInsights.
  const insightText = await aiService.getLandingInsights(details);

  if (!insightText) {
    res.status(404);
    throw new Error('Could not generate AI insight.');
  }

  res.status(200).json({
    insight: insightText,
    provider: 'AI', // You can enhance this if your service returns the provider info
  });
});

module.exports = {
  getOnboardingInsights,
};