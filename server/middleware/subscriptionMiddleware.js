
const checkSubscription = (req, res, next) => {
  // Always allow top-level admins
  if (req.user.role === 'admin') {
    return next();
  }

  // We will add `isSubscribed` to the JWT during login
  if (req.user.isSubscribed) {
    next(); // Subscription is valid, proceed
  } else {
    res.status(403).json({ message: 'Access denied. An active subscription is required.' });
  }
};

module.exports = { checkSubscription };