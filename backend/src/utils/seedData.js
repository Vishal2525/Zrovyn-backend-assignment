/**
 * Seed script — creates demo users and financial records for testing.
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Record = require('../models/Record');

const categories = [
  'Salary',
  'Freelance',
  'Investment',
  'Rent',
  'Utilities',
  'Food',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Insurance',
  'Savings',
  'Gifts',
  'Other',
];

const notes = [
  'Monthly salary deposit',
  'Client project payment',
  'Quarterly dividend',
  'Office rent payment',
  'Electricity bill',
  'Grocery shopping',
  'Uber rides',
  'Netflix subscription',
  'Doctor appointment',
  'Online course',
  'New laptop',
  'Health insurance premium',
  'Emergency fund',
  'Birthday gift',
  'Miscellaneous expense',
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Record.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const salt = await bcrypt.genSalt(12);

    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@finance.com',
        password: 'Admin@123',
        role: 'admin',
        status: 'active',
      },
      {
        name: 'Analyst User',
        email: 'analyst@finance.com',
        password: 'Analyst@123',
        role: 'analyst',
        status: 'active',
      },
      {
        name: 'Viewer User',
        email: 'viewer@finance.com',
        password: 'Viewer@123',
        role: 'viewer',
        status: 'active',
      },
    ]);

    console.log('👥 Created demo users:');
    console.log('   Admin:   admin@finance.com   / Admin@123');
    console.log('   Analyst: analyst@finance.com  / Analyst@123');
    console.log('   Viewer:  viewer@finance.com   / Viewer@123');

    // Create financial records — 60 records over 12 months
    const records = [];
    const now = new Date();

    for (let i = 0; i < 60; i++) {
      const monthOffset = Math.floor(Math.random() * 12);
      const dayOffset = Math.floor(Math.random() * 28) + 1;
      const recordDate = new Date(
        now.getFullYear(),
        now.getMonth() - monthOffset,
        dayOffset
      );

      const isIncome = Math.random() > 0.45; // ~55% income, ~45% expense
      const categoryIndex = isIncome
        ? Math.floor(Math.random() * 4) // First 4 are income categories
        : Math.floor(Math.random() * 11) + 4; // Rest are expense categories

      records.push({
        amount: parseFloat(
          (Math.random() * (isIncome ? 10000 : 5000) + 100).toFixed(2)
        ),
        type: isIncome ? 'income' : 'expense',
        category: categories[categoryIndex],
        date: recordDate,
        note: notes[categoryIndex],
        createdBy: users[0]._id, // Admin created all seed records
      });
    }

    await Record.insertMany(records);
    console.log(`📊 Created ${records.length} financial records`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seedDB();
