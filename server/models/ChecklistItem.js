const mongoose = require('mongoose');

// Admin-managed master list of kit checklist items. No delete: unpublish instead.
const checklistItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChecklistItem', checklistItemSchema);
