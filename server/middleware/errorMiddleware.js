// server/middleware/errorMiddleware.js

/**
 * Handles requests for routes that do not exist (404 Not Found).
 * This middleware should be placed after all other routes in the main server file.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the global error handler
};

/**
 * Global error handling middleware.
 * Catches all errors passed via `next(error)` and formats them into a consistent JSON response.
 * It also handles specific Mongoose errors to provide cleaner client-side messages.
 */
const errorHandler = (err, req, res, next) => {
  // Determine the status code. If it's 200, an error occurred, so default to 500 (Internal Server Error).
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // --- Specific Mongoose Error Handling ---

  // 1. Bad ObjectId Error (CastError)
  // Occurs when a provided ID (e.g., in req.params) is not a valid MongoDB ObjectId format.
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404; // Treat as "Not Found" as the resource with that malformed ID cannot exist.
    message = 'Resource not found. Invalid ID format.';
  }

  // 2. Validation Error
  // Occurs when creating or updating a document fails schema validation (e.g., a required field is missing).
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    // Join all individual validation error messages into a single, clean string.
    message = Object.values(err.errors).map(val => val.message).join('. ');
  }

  // 3. Duplicate Key Error
  // Occurs when a `unique: true` field in the schema receives a value that already exists in the database.
  if (err.code === 11000) {
    statusCode = 400; // Bad Request
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `The ${field} '${value}' is already taken. Please choose another.`;
  }

  // --- Final JSON Response ---
  res.status(statusCode).json({
    message: message,
    // Only show the stack trace in development mode for debugging purposes.
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = { notFound, errorHandler };