const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
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
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Water', 'Electricity', 'Cleaning', 'Furniture', 'Internet', 'Other'],
      default: 'Water'
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open'
    },
    assignedStaff: {
      type: String,
      default: 'Unassigned',
      trim: true
    },
    resolutionDetails: {
      type: String,
      default: '',
      trim: true
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
