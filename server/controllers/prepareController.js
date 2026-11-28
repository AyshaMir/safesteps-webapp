const mongoose = require('mongoose');
const UserPrep = require('../models/UserPrep');
const ChecklistItem = require('../models/ChecklistItem');

// Get or create preparedness data for the authenticated user
async function getOrCreatePrep(userId) {
  return UserPrep.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}

// GET /api/prepare
async function getPrepare(req, res) {
  const prep = await getOrCreatePrep(req.user.id);

  const items = await ChecklistItem.find({
    published: true,
  }).select('_id');

  const publishedIds = new Set(
    items.map(item => item._id.toString())
  );

  const checkedItems = [
    ...new Set(prep.checkedItems.map(id => id.toString())),
  ].filter(id => publishedIds.has(id));

  const score = items.length
    ? Math.round((checkedItems.length / items.length) * 100)
    : 0;

  res.json({
    plan: prep.plan,
    checkedItems,
    contacts: prep.contacts,
    score,
  });
}

// PUT /api/prepare/plan
async function updatePlan(req, res) {
  const { meetingPoints, notes } = req.body ?? {};

  if (
    !Array.isArray(meetingPoints) ||
    meetingPoints.some(point => typeof point !== 'string') ||
    typeof notes !== 'string'
  ) {
    return res.status(400).json({
      error: 'Invalid emergency plan',
    });
  }

  const prep = await getOrCreatePrep(req.user.id);

  prep.plan.meetingPoints = meetingPoints
    .map(point => point.trim())
    .filter(Boolean);

  prep.plan.notes = notes.trim();

  await prep.save();

  res.json({ plan: prep.plan });
}

// PUT /api/prepare/checklist
async function updateChecklist(req, res) {
  const { checkedItems } = req.body ?? {};

  if (
    !Array.isArray(checkedItems) ||
    checkedItems.some(
      id => typeof id !== 'string' ||
        !mongoose.isObjectIdOrHexString(id)
    )
  ) {
    return res.status(400).json({
      error: 'Invalid checklist items',
    });
  }

  const items = await ChecklistItem.find({
    _id: { $in: checkedItems },
    published: true,
  }).select('_id');

  const prep = await getOrCreatePrep(req.user.id);

  prep.checkedItems = items.map(item => item._id);

  await prep.save();

  res.json({
    checkedItems: prep.checkedItems,
  });
}

// Validate emergency contact information
function validateContact(body) {
  const { name, phone, relation = '', first = false } =
    body ?? {};

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof phone !== 'string' ||
    typeof relation !== 'string' ||
    typeof first !== 'boolean'
  ) {
    return null;
  }

  const cleanPhone = phone.trim().replace(/[\s()-]/g, '');

  if (!/^\+?\d{7,15}$/.test(cleanPhone)) {
    return null;
  }

  return {
    name: name.trim(),
    phone: cleanPhone,
    relation: relation.trim(),
    first,
  };
}

// POST /api/prepare/contacts
async function addContact(req, res) {
  const contact = validateContact(req.body);

  if (!contact) {
    return res.status(400).json({
      error: 'Invalid contact details',
    });
  }

  const prep = await getOrCreatePrep(req.user.id);

  if (contact.first) {
    prep.contacts.forEach(item => {
      item.first = false;
    });
  }

  prep.contacts.push(contact);

  await prep.save();

  res.status(201).json({
    contacts: prep.contacts,
  });
}

// PUT /api/prepare/contacts/:id
async function updateContact(req, res) {
  const { id } = req.params;

  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({
      error: 'Invalid contact ID',
    });
  }

  const updated = validateContact(req.body);

  if (!updated) {
    return res.status(400).json({
      error: 'Invalid contact details',
    });
  }

  const prep = await getOrCreatePrep(req.user.id);
  const contact = prep.contacts.id(id);

  if (!contact) {
    return res.status(404).json({
      error: 'Contact not found',
    });
  }

  if (updated.first) {
    prep.contacts.forEach(item => {
      item.first = false;
    });
  }

  contact.set(updated);

  await prep.save();

  res.json({
    contacts: prep.contacts,
  });
}

// DELETE /api/prepare/contacts/:id
async function deleteContact(req, res) {
  const { id } = req.params;

  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({
      error: 'Invalid contact ID',
    });
  }

  const prep = await getOrCreatePrep(req.user.id);
  const contact = prep.contacts.id(id);

  if (!contact) {
    return res.status(404).json({
      error: 'Contact not found',
    });
  }

  contact.deleteOne();

  await prep.save();

  res.json({
    contacts: prep.contacts,
  });
}

module.exports = {
  getPrepare,
  updatePlan,
  updateChecklist,
  addContact,
  updateContact,
  deleteContact,
};