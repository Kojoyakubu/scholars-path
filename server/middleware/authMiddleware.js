// server/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');

/**
 * Middleware to protect routes by verifying a JWT.
 * It checks for a token in the 'Authorization' header, verifies it,
 * and attaches the decoded payload to `req.user`.
 * This optimized version does NOT query the database on every request,
 * relying on the signed token data for performance.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded payload (containing user id, role, school, etc.) to the request object.
      // Downstream controllers can now access `req.user.id`, `req.user.role`, etc.
      req.user = decoded;

      next(); // Proceed to the next middleware or controller
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401);
      throw new Error('Not authorized, token is invalid or expired.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided.');
  }
});

/**
 * Middleware factory to authorize routes based on user roles.
 * Must be used AFTER the `protect` middleware.
 * @param {...string} roles - A list of roles that are allowed to access the route (e.g., 'admin', 'teacher').
 * @returns {Function} An Express middleware function.
 * @example
 * // Allows only users with the 'admin' role
 * router.get('/users', protect, authorize('admin'), getUsers);
 * // Allows users with 'admin' OR 'teacher' roles
 * router.post('/courses', protect, authorize('admin', 'teacher'), createCourse);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is attached by the `protect` middleware
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403); // 403 Forbidden
      throw new Error(`Access denied. You must have one of the following roles: ${roles.join(', ')}.`);
    }
    next();
  };
};

module.exports = { protect, authorize };