// Loads seed/checklist.json into the ChecklistItem collection (published).
// Skips items whose name already exists, so it is safe to run again.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ChecklistItem = require('../models/ChecklistItem');
const items = require('./checklist.json');

async function run() {
  await connectDB();
  const orderByCategory = {};
  let added = 0;
  for (const { name, category } of items) {
    const order = (orderByCategory[category] = (orderByCategory[category] ?? -1) + 1);
    if (await ChecklistItem.exists({ name })) continue;
    await ChecklistItem.create({ name, category, order, published: true });
    added += 1;
  }
  console.log(`Checklist: ${added} added, ${items.length - added} already there`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
