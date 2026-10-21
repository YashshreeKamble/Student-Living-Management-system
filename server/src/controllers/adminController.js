const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Room = require('../models/Room');
const Payment = require('../models/Payment');

async function getDashboard(req, res, next) {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email room bed status createdAt')
      .sort({ name: 1 });

    const rooms = await Room.find().sort({ room: 1 });
    const payments = await Payment.find().sort({ createdAt: -1 });
    const notices = await Notice.find().sort({ createdAt: -1 }).limit(10);

    return res.json({
      students: students.map((s) => ({
        id: s._id,
        name: s.name,
        email: s.email,
        room: s.room,
        bed: s.bed,
        status: s.status
      })),
      rooms: rooms.map((r) => ({
        room: r.room,
        students: r.students,
        beds: r.beds,
        vacancy: r.vacancy
      })),
      payments: payments.map((p) => ({
        student: p.student,
        amount: p.amount,
        date: p.date,
        status: p.status
      })),
      notices: notices.map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        audience: n.audience,
        date: n.createdAt.toISOString().slice(0, 10)
      }))
    });
  } catch (err) {
    next(err);
  }
}

async function approveStudent(req, res, next) {
  try {
    const { room, bed } = req.body || {};
    if (!room?.trim() || !bed?.trim()) {
      return res.status(400).json({ error: 'Room number and bed number are required.' });
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      {
        status: 'approved',
        room: room.trim(),
        bed: bed.trim()
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student request not found.' });
    }

    return res.json({ message: 'Student approved and bed allocated.', student });
  } catch (err) {
    next(err);
  }
}

async function updateAccount(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    if (password) {
      if (
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        return res.status(400).json({
          error: 'Password must be 8+ characters with one uppercase letter and one special symbol.'
        });
      }
    }

    const otherUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id }
    });
    if (otherUser) {
      return res.status(409).json({ error: 'That email is already in use.' });
    }

    const updateData = {
      name: name.trim(),
      email: normalizedEmail
    };

    if (password) {
      updateData.passwordHash = bcrypt.hashSync(password, 12);
    }

    await User.findByIdAndUpdate(req.user._id, updateData);

    return res.json({ message: 'Admin account updated. Please sign in again.' });
  } catch (err) {
    next(err);
  }
}

async function createNotice(req, res, next) {
  try {
    const { title, message, audience = 'All residents' } = req.body || {};
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Notice title and message are required.' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      message: message.trim(),
      audience: audience.trim()
    });

    return res.status(201).json({
      notice: {
        id: notice._id,
        title: notice.title,
        message: notice.message,
        audience: notice.audience,
        sentAt: notice.createdAt.toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  approveStudent,
  updateAccount,
  createNotice
};
