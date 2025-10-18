// server/middleware/validatorMiddleware.js
const { validationResult } = require('express-validator');

/**
 * Middleware that checks for and handles validation errors from express-validator.
 * If validation errors exist, it sends a 400 Bad Request response.
 * Otherwise, it passes control to the next middleware.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return a structured error response
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = { handleValidationErrors };