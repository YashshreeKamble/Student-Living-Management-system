const mongoose = require('mongoose');

const messAttendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      index: true // e.g. "2026-08-22"
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    room: {
      type: String,
      default: 'Unassigned',
      trim: true
    },
    breakfast: {
      type: Boolean,
      default: true
    },
    lunch: {
      type: Boolean,
      default: true
    },
    dinner: {
      type: Boolean,
      default: true
    },
    specialDiet: {
      type: String,
      default: 'Regular Veg / Non-veg'
    },
    markedBy: {
      type: String,
      default: 'Mess Supervisor'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate attendance record per student per day
messAttendanceSchema.index({ date: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('MessAttendance', messAttendanceSchema);
