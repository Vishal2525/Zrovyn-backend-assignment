/**
 * Wraps an async route handler to catch errors and forward them to
 * the global error handler, avoiding repetitive try-catch blocks.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
