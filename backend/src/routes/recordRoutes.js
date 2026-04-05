const express = require('express');
const router = express.Router();
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  exportCSV,
} = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');
const {
  recordValidation,
  recordUpdateValidation,
} = require('../middleware/validators');
const validate = require('../middleware/validate');

// All routes are protected
router.use(protect);

// CSV export (must be before /:id to avoid route conflict)
router.get('/export/csv', authorize('admin', 'analyst'), exportCSV);

// Routes accessible by admin and analyst
router.get('/', authorize('admin', 'analyst'), getRecords);
router.get('/:id', authorize('admin', 'analyst'), getRecord);

// Routes accessible only by admin
router.post('/', authorize('admin'), recordValidation, validate, createRecord);
router.put('/:id', authorize('admin'), recordUpdateValidation, validate, updateRecord);
router.delete('/:id', authorize('admin'), deleteRecord);

module.exports = router;
