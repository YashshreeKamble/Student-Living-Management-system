const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    students: {
      type: String,
      default: '0 students'
    },
    beds: {
      type: String,
      default: '1 bed'
    },
    vacancy: {
      type: String,
      default: '1 vacant'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Room', roomSchema);
