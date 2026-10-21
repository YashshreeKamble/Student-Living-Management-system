const mongoose = require('mongoose');

const outpassSchema = new mongoose.Schema(
  {
    outpassNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
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
    destination: {
      type: String,
      required: [true, 'Destination address/place is required'],
      trim: true
    },
    reason: {
      type: String,
      required: [true, 'Reason for outing is required'],
      trim: true
    },
    departureTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    expectedReturnTime: {
      type: Date,
      required: true
    },
    actualReturnTime: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Returned', 'Overdue'],
      default: 'Pending'
    },
    approvedBy: {
      type: String,
      default: 'Pending Warden Review'
    },
    parentInformed: {
      type: Boolean,
      default: true
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Method to check overdue status dynamically
outpassSchema.methods.checkOverdue = function () {
  if (this.status === 'Approved' && !this.actualReturnTime && new Date() > this.expectedReturnTime) {
    this.status = 'Overdue';
  }
  return this.status;
};

module.exports = mongoose.model('Outpass', outpassSchema);
