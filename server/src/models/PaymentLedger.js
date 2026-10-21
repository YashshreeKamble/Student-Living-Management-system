const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String, default: '' }
  },
  { _id: false }
);

const paymentLedgerSchema = new mongoose.Schema(
  {
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
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    paymentType: {
      type: String,
      enum: ['Monthly Rent', 'Security Deposit', 'Mess Fee', 'Maintenance Fee', 'Late Fee', 'Other'],
      default: 'Monthly Rent'
    },
    forMonth: {
      type: String,
      default: () => new Date().toISOString().slice(0, 7) // e.g. "2026-08"
    },
    amountDue: {
      type: Number,
      default: 0
    },
    amountPaid: {
      type: Number,
      required: true,
      min: [0, 'Amount paid cannot be negative']
    },
    balance: {
      type: Number,
      default: 0
    },
    dueDate: {
      type: Date,
      default: null
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'Bank Transfer / NEFT', 'UPI / Online', 'Cheque'],
      required: true
    },
    transactionRef: {
      type: String,
      default: '',
      trim: true
    },
    isCash: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false // Cash is unverified by bank, bank transfer has reference
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Outstanding'],
      default: 'Paid'
    },
    recordedBy: {
      type: String,
      default: 'Accountant'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    auditTrail: [auditLogSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PaymentLedger', paymentLedgerSchema);
