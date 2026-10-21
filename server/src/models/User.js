const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'warden', 'accountant'],
      default: 'student',
      required: true
    },
    room: {
      type: String,
      default: null,
      trim: true
    },
    bed: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending'
    },
    // Traditional Admission Register Details
    admissionNumber: {
      type: String,
      default: '',
      trim: true
    },
    guardianName: {
      type: String,
      default: '',
      trim: true
    },
    guardianPhone: {
      type: String,
      default: '',
      trim: true
    },
    guardianRelation: {
      type: String,
      default: 'Parent',
      trim: true
    },
    emergencyContact: {
      type: String,
      default: '',
      trim: true
    },
    college: {
      type: String,
      default: '',
      trim: true
    },
    course: {
      type: String,
      default: '',
      trim: true
    },
    yearOfStudy: {
      type: String,
      default: '',
      trim: true
    },
    permanentAddress: {
      type: String,
      default: '',
      trim: true
    },
    idProofType: {
      type: String,
      enum: ['Aadhaar Card', 'College ID', 'Passport', 'Driving License', 'Voter ID', 'Not Provided'],
      default: 'Not Provided'
    },
    idProofNumber: {
      type: String,
      default: '',
      trim: true
    },
    documentStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    leavingDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
