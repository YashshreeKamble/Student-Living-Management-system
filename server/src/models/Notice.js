const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notice message is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['General', 'Mess', 'Maintenance', 'Emergency', 'Holiday', 'Rules & Regulation', 'Water', 'Electricity', 'Academic', 'Hostel'],
      default: 'General'
    },
    audience: {
      type: String,
      default: 'All residents',
      trim: true
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    publishDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
