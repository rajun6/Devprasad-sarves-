const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(400).json({ success: false, errors: errors.array() });
  };
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('mobile').trim().matches(/^[0-9]{10}$/).withMessage('Valid 10-digit mobile required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = { validate, registerValidation, loginValidation };
