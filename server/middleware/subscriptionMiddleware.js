const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

const checkSubscription = async (req, res, next) => {
  // Always allow admins
  if (req.user.role === 'admin') {
    return next();
  }

  try {
    let subscriptionOwnerId = req.user._id;

    // If the user belongs to a school, the subscription is on the school's admin
    if (req.user.school) {
      const schoolAdmin = await User.findOne({ school: req.user.school, role: 'admin' });
      if (schoolAdmin) {
        subscriptionOwnerId = schoolAdmin._id;
      }
    }

    const subscription = await Subscription.findOne({ user: subscriptionOwnerId });

    if (subscription && subscription.status === 'active' && subscription.expiresAt > new Date()) {
      next(); // Subscription is valid, proceed
    } else {
      res.status(403).json({ message: 'Access denied. An active subscription is required.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error while checking subscription.' });
  }
};

module.exports = { checkSubscription };