const Record = require('../models/Record');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get dashboard summary data
 * @route   GET /api/dashboard/summary
 * @access  Private (All authenticated users)
 */
const getSummary = asyncHandler(async (req, res, next) => {
  const [summary] = await Record.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
        totalRecords: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: { $round: ['$totalIncome', 2] },
        totalExpense: { $round: ['$totalExpense', 2] },
        netBalance: {
          $round: [{ $subtract: ['$totalIncome', '$totalExpense'] }, 2],
        },
        totalRecords: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: summary || {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      totalRecords: 0,
    },
  });
});

/**
 * @desc    Get category-wise totals
 * @route   GET /api/dashboard/category-summary
 * @access  Private (All authenticated users)
 */
const getCategorySummary = asyncHandler(async (req, res, next) => {
  const categoryData = await Record.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: { $round: ['$total', 2] },
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({
    success: true,
    count: categoryData.length,
    data: categoryData,
  });
});

/**
 * @desc    Get monthly trends (last 12 months)
 * @route   GET /api/dashboard/monthly-trends
 * @access  Private (All authenticated users)
 */
const getMonthlyTrends = asyncHandler(async (req, res, next) => {
  const months = parseInt(req.query.months, 10) || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const trends = await Record.aggregate([
    {
      $match: {
        isDeleted: { $ne: true },
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: { $round: ['$total', 2] },
      },
    },
    {
      $sort: { year: 1, month: 1 },
    },
  ]);

  // Format into structured monthly data
  const formattedTrends = {};
  trends.forEach((item) => {
    const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    if (!formattedTrends[key]) {
      formattedTrends[key] = {
        month: key,
        income: 0,
        expense: 0,
      };
    }
    formattedTrends[key][item.type] = item.total;
  });

  // Convert to array and add net balance
  const result = Object.values(formattedTrends).map((item) => ({
    ...item,
    net: Math.round((item.income - item.expense) * 100) / 100,
  }));

  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
  });
});

/**
 * @desc    Get recent transactions
 * @route   GET /api/dashboard/recent
 * @access  Private (All authenticated users)
 */
const getRecentTransactions = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const records = await Record.find({ isDeleted: { $ne: true } })
    .populate('createdBy', 'name email')
    .sort({ date: -1, createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

module.exports = {
  getSummary,
  getCategorySummary,
  getMonthlyTrends,
  getRecentTransactions,
};
