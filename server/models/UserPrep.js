const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  relation: {
    type: String,
    trim: true,
    default: '',
  },
  first: {
    type: Boolean,
    default: false,
  },
});

const userPrepSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    plan: {
      meetingPoints: {
        type: [String],
        default: [],
      },
      notes: {
        type: String,
        default: '',
      },
    },

    checkedItems: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ChecklistItem',
        },
      ],
      default: [],
    },

    contacts: {
      type: [contactSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserPrep', userPrepSchema);