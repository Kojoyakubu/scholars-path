const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');

// GET /api/ai/landing/insights
router.get('/landing/insights', protect, async (req, res, next) => {
  try {
    const role = req.user?.role || req.query.role;
    const name = req.user?.fullName || req.query.name || 'User';
    const text = await aiService.getLandingInsights({ role, name });
    res.json({ insight: text, provider: 'AI' });
  } catch (err) { next(err); }
});

// GET /api/ai/pricing/insights
router.get('/pricing/insights', protect, async (req, res, next) => {
  try {
    const role = req.user?.role || req.query.role;
    const name = req.user?.fullName || req.query.name || 'User';
    const text = await aiService.getPricingInsights({ role, name });
    res.json({ insight: text, provider: 'AI' });
  } catch (err) { next(err); }
});

module.exports = router;
