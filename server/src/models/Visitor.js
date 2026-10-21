const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true
    },
    visitorPhone: {
      type: String,
      required: [true, 'Visitor phone number is required'],
      trim: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    studentName: {
      type: String,
      required: [true, 'Resident name being visited is required'],
      trim: true
    },
    studentRoom: {
      type: String,
      required: [true, 'Resident room number is required'],
      trim: true
    },
    purpose: {
      type: String,
      default: 'Personal Visit',
      trim: true
    },
    relation: {
      type: String,
      default: 'Family / Friend',
      trim: true
    },
    idProof: {
      type: String,
      default: 'ID verified at security gate',
      trim: true
    },
    entryTime: {
      type: Date,
      default: Date.now
    },
    exitTime: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['In Premises', 'Departed'],
      default: 'In Premises'
    },
    recordedBy: {
      type: String,
      default: 'Security / Warden'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Visitor', visitorSchema);
