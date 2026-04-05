const Record = require('../models/Record');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all records (with pagination, filtering, search)
 * @route   GET /api/records
 * @access  Private (Admin, Analyst)
 */
const getRecords = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};

  // Filter by type (income/expense)
  if (req.query.type) {
    filter.type = req.query.type;
  }

  // Filter by category
  if (req.query.category) {
    filter.category = { $regex: req.query.category, $options: 'i' };
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    filter.date = {};
    if (req.query.startDate) {
      filter.date.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.date.$lte = new Date(req.query.endDate);
    }
  }

  // Search in notes
  if (req.query.search) {
    filter.$or = [
      { note: { $regex: req.query.search, $options: 'i' } },
      { category: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Sort
  const sortField = req.query.sortBy || 'date';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;

  const total = await Record.countDocuments(filter);
  const records = await Record.find(filter)
    .populate('createdBy', 'name email')
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: { records },
  });
});

/**
 * @desc    Get a single record
 * @route   GET /api/records/:id
 * @access  Private (Admin, Analyst)
 */
const getRecord = asyncHandler(async (req, res, next) => {
  const record = await Record.findById(req.params.id).populate(
    'createdBy',
    'name email'
  );

  if (!record) {
    return next(new AppError('Record not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: { record },
  });
});

/**
 * @desc    Create a new financial record
 * @route   POST /api/records
 * @access  Private (Admin)
 */
const createRecord = asyncHandler(async (req, res, next) => {
  // Set the creator
  req.body.createdBy = req.user.id;

  const record = await Record.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Record created successfully',
    data: { record },
  });
});

/**
 * @desc    Update a financial record
 * @route   PUT /api/records/:id
 * @access  Private (Admin)
 */
const updateRecord = asyncHandler(async (req, res, next) => {
  let record = await Record.findById(req.params.id);

  if (!record) {
    return next(new AppError('Record not found.', 404));
  }

  record = await Record.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Record updated successfully',
    data: { record },
  });
});

/**
 * @desc    Delete a financial record (soft delete)
 * @route   DELETE /api/records/:id
 * @access  Private (Admin)
 */
const deleteRecord = asyncHandler(async (req, res, next) => {
  const record = await Record.findById(req.params.id);

  if (!record) {
    return next(new AppError('Record not found.', 404));
  }

  // Soft delete
  record.isDeleted = true;
  await record.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Record deleted successfully',
    data: {},
  });
});

/**
 * @desc    Export records as CSV
 * @route   GET /api/records/export/csv
 * @access  Private (Admin, Analyst)
 */
const exportCSV = asyncHandler(async (req, res, next) => {
  const filter = {};

  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) {
    filter.category = { $regex: req.query.category, $options: 'i' };
  }
  if (req.query.startDate || req.query.endDate) {
    filter.date = {};
    if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
  }

  const records = await Record.find(filter)
    .populate('createdBy', 'name email')
    .sort({ date: -1 });

  // Build CSV
  const headers = 'Date,Type,Category,Amount,Note,Created By\n';
  const rows = records
    .map(
      (r) =>
        `${new Date(r.date).toISOString().split('T')[0]},${r.type},${r.category},${r.amount},"${r.note || ''}",${r.createdBy?.name || 'N/A'}`
    )
    .join('\n');

  const csv = headers + rows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=financial_records_${Date.now()}.csv`
  );
  res.status(200).send(csv);
});

module.exports = {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  exportCSV,
};
