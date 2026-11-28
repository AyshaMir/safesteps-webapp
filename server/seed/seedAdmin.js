// Creates the first admin from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in .env.
// If that email already has an account, it is promoted to admin instead.
require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function run() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) in server/.env');
  }
  await connectDB();
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`${email} is now an admin`);
  } else {
    await User.create({
      name: ADMIN_NAME || 'Admin',
      email,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin',
    });
    console.log(`Admin ${email} created`);
  }
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
