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
    audience: {
      type: String,
      default: 'All residents',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
