const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results from express-validator.
 * Returns 400 with detailed error messages if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Validation failed',
      errors: extractedErrors,
    });
  }

  next();
};

module.exports = validate;
