const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const {
  registerValidation,
  userUpdateValidation,
} = require('../middleware/validators');
const validate = require('../middleware/validate');

// All routes below are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers)
  .post(registerValidation, validate, createUser);

router
  .route('/:id')
  .get(getUser)
  .put(userUpdateValidation, validate, updateUser)
  .delete(deleteUser);

module.exports = router;
