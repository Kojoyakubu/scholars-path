// server/middleware/subscriptionMiddleware.js

/**
 * Middleware to check for an active user subscription.
 * This should be placed in the route chain AFTER the `protect` middleware.
 * It reads the `isSubscribed` flag from the JWT payload attached to `req.user`.
 *
 * - Always allows users with the 'admin' role to pass.
 * - For other users, it checks if `req.user.isSubscribed` is true.
 *
 * @example
 * router.post('/generate-note', protect, checkSubscription, generateLessonNote);
 */
const checkSubscription = (req, res, next) => {
  // The `protect` middleware must run first to attach `req.user`.
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, user data not found.');
  }

  // A top-level admin should bypass subscription checks.
  if (req.user.role === 'admin') {
    return next();
  }

  // Check the boolean flag from the JWT payload.
  if (req.user.isSubscribed) {
    next(); // User has an active subscription, proceed.
  } else {
    res.status(403).json({ message: 'Access denied. This feature requires an active subscription.' });
  }
};

module.exports = { checkSubscription };