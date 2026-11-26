const express = require('express');
const mongoose = require('mongoose');
const ChecklistItem = require('../models/ChecklistItem');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public: published items for the Kit checklist (Person 1 reads this).
const publicRouter = express.Router();
publicRouter.get('/', async (req, res) => {
  const items = await ChecklistItem.find({ published: true }).sort({ category: 1, order: 1, name: 1 });
  res.json({ items });
});

// Admin: manage the master list. No delete: unpublish instead.
const adminRouter = express.Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/', async (req, res) => {
  const items = await ChecklistItem.find().sort({ category: 1, order: 1, name: 1 });
  res.json({ items });
});

function itemFieldErrors({ name, category }, partial) {
  const fields = {};
  if (!partial || name !== undefined) {
    if (!String(name ?? '').trim()) fields.name = 'Enter a name';
  }
  if (!partial || category !== undefined) {
    if (!String(category ?? '').trim()) fields.category = 'Choose a category';
  }
  return Object.keys(fields).length ? fields : null;
}

adminRouter.post('/', async (req, res) => {
  const { name, category, published } = req.body ?? {};
  const fields = itemFieldErrors({ name, category }, false);
  if (fields) return res.status(400).json({ error: 'Please check the highlighted fields', fields });

  const last = await ChecklistItem.findOne({ category: category.trim().toLowerCase() }).sort({ order: -1 });
  const item = await ChecklistItem.create({
    name,
    category,
    order: last ? last.order + 1 : 0,
    published: Boolean(published),
  });
  res.status(201).json({ item });
});

adminRouter.put('/:id', async (req, res) => {
  const { name, category, order, published } = req.body ?? {};
  const fields = itemFieldErrors({ name, category }, true);
  if (fields) return res.status(400).json({ error: 'Please check the highlighted fields', fields });

  const update = {};
  if (name !== undefined) update.name = name;
  if (category !== undefined) update.category = category;
  if (order !== undefined) update.order = Number(order);
  if (published !== undefined) update.published = Boolean(published);

  const item = mongoose.isValidObjectId(req.params.id)
    ? await ChecklistItem.findByIdAndUpdate(req.params.id, update, {
        returnDocument: 'after',
        runValidators: true,
      })
    : null;
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ item });
});

module.exports = { publicRouter, adminRouter };
