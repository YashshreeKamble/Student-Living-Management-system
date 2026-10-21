const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
      unique: true
    },
    breakfast: {
      type: String,
      required: true
    },
    breakfastTime: {
      type: String,
      default: '7:30 AM - 9:30 AM'
    },
    lunch: {
      type: String,
      required: true
    },
    lunchTime: {
      type: String,
      default: '12:30 PM - 2:30 PM'
    },
    snacks: {
      type: String,
      default: 'Tea, Coffee & Fresh Snack'
    },
    snacksTime: {
      type: String,
      default: '5:00 PM - 6:00 PM'
    },
    dinner: {
      type: String,
      required: true
    },
    dinnerTime: {
      type: String,
      default: '7:30 PM - 9:30 PM'
    },
    specialItem: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MessMenu', messMenuSchema);
