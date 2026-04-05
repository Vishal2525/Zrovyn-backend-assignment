const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCategorySummary,
  getMonthlyTrends,
  getRecentTransactions,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All dashboard routes are protected — accessible by all authenticated users
router.use(protect);

router.get('/summary', getSummary);
router.get('/category-summary', getCategorySummary);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/recent', getRecentTransactions);

module.exports = router;
