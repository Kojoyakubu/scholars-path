const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController'); // Best practice: use a controller

// ✅ ADD THIS NEW ROUTE
// GET /api/ai/onboarding/insights
router.get('/onboarding/insights', protect, aiController.getOnboardingInsights);

// You can either remove or keep the old routes depending on your needs.
// To avoid confusion, it's often best to consolidate.
// router.get('/landing/insights', protect, aiController.getLandingInsights); 
// router.get('/pricing/insights', protect, aiController.getPricingInsights);

module.exports = router;