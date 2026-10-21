const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');

const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;

async function login(req, res, next) {
  try {
    const { identifier, password, role } = req.body || {};

    if (!identifier || !password || !['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Enter your login details and choose a valid account type.' });
    }

    const trimmedIdentifier = identifier.trim();
    const user = await User.findOne({
      $and: [
        {
          $or: [
            { email: { $regex: new RegExp(`^${trimmedIdentifier}$`, 'i') } },
            { name: { $regex: new RegExp(`^${trimmedIdentifier}$`, 'i') } }
          ]
        },
        { role }
      ]
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'The email, name, or password is incorrect.' });
    }

    if (user.role === 'student' && user.status !== 'approved') {
      return res.status(403).json({
        error: 'Your registration is pending admin approval and bed allocation.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);

    await Session.create({
      token,
      userId: user._id,
      expiresAt
    });

    res.cookie('arbor_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS_MS
    });

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        room: user.room,
        bed: user.bed
      },
      redirect: user.role === 'admin' ? '/admin' : '/student'
    });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'student',
      room: null,
      bed: null,
      status: 'pending'
    });

    return res.status(201).json({
      message: 'Registration submitted. An admin must approve your account and allocate a bed before you can sign in.'
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      room: req.user.room,
      bed: req.user.bed,
      status: req.user.status
    }
  });
}

async function logout(req, res, next) {
  try {
    const token =
      req.cookies?.arbor_session ||
      req.sessionToken ||
      req.headers.cookie?.match(/(?:^|; )arbor_session=([^;]+)/)?.[1];

    if (token) {
      await Session.deleteOne({ token });
    }

    res.clearCookie('arbor_session', { path: '/' });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, getMe, logout };
