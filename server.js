const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const express = require('express');
const bcrypt = require('bcryptjs');

const app = express();
const port = Number(process.env.PORT) || 3000;
const database = new DatabaseSync(path.join(__dirname, 'arbor-house.sqlite'));
database.exec('PRAGMA journal_mode = WAL');
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    room TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    audience TEXT NOT NULL DEFAULT 'All residents',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const noticeCount = database.prepare('SELECT COUNT(*) AS count FROM notices').get().count;
if (noticeCount === 0) {
  const seedNotice = database.prepare('INSERT INTO notices (title, message, audience) VALUES (?, ?, ?)');
  seedNotice.run('Water supply maintenance', 'Water supply will be paused today from 2:00 PM to 4:00 PM.', 'All residents');
  seedNotice.run('Independence Day holiday', 'The mess will follow the holiday schedule on 15 August.', 'All residents');
}

const seedUser = database.prepare('INSERT OR IGNORE INTO users (name, email, password_hash, role, room) VALUES (?, ?, ?, ?, ?)');
if (process.env.SEED_PASSWORD) {
  seedUser.run('Riya Kapoor', 'riya@student.arborhouse.in', bcrypt.hashSync(process.env.SEED_PASSWORD, 12), 'student', 'A-204');
  seedUser.run('Arbor Admin', 'admin@arborhouse.in', bcrypt.hashSync(process.env.SEED_PASSWORD, 12), 'admin', null);
}

app.use(express.json());
app.use((request, response, next) => {
  const origin = request.headers.origin;
  if (origin === 'null' || origin?.startsWith('http://localhost:')) {
    response.setHeader('Access-Control-Allow-Origin', origin || 'http://localhost:3000');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (request.method === 'OPTIONS') return response.sendStatus(204);
  return next();
});
app.get('/', (_request, response) => response.sendFile(path.join(__dirname, 'home.html')));
app.use(express.static(__dirname));

function cleanExpiredSessions() {
  database.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
}

function currentUser(request) {
  cleanExpiredSessions();
  const token = request.headers.cookie?.match(/(?:^|; )arbor_session=([^;]+)/)?.[1];
  if (!token) return null;
  return database.prepare('SELECT users.id, users.name, users.email, users.role, users.room FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ? AND sessions.expires_at > ?').get(token, Date.now()) || null;
}

app.post('/api/auth/login', (request, response) => {
  const { identifier, password, role } = request.body || {};
  if (!identifier || !password || !['student', 'admin'].includes(role)) {
    return response.status(400).json({ error: 'Enter your login details and choose a valid account type.' });
  }
  const user = database.prepare('SELECT * FROM users WHERE (lower(email) = lower(?) OR lower(name) = lower(?)) AND role = ?').get(identifier.trim(), identifier.trim(), role);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return response.status(401).json({ error: 'The email, name, or password is incorrect.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  database.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, Date.now() + 1000 * 60 * 60 * 24 * 7);
  response.setHeader('Set-Cookie', `arbor_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`);
  return response.json({ user: { name: user.name, role: user.role, room: user.room }, redirect: user.role === 'admin' ? '/admin.html' : '/index.html' });
});

app.post('/api/auth/register', (request, response) => {
  const { name, email, password } = request.body || {};
  if (!name?.trim() || !email?.trim() || !password) {
    return response.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 8) {
    return response.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return response.status(400).json({ error: 'Enter a valid email address.' });
  }
  const existingUser = database.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(normalizedEmail);
  if (existingUser) {
    return response.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  }
  try {
    database.prepare('INSERT INTO users (name, email, password_hash, role, room) VALUES (?, ?, ?, ?, ?)').run(name.trim(), normalizedEmail, bcrypt.hashSync(password, 12), 'student', null);
    return response.status(201).json({ message: 'Account created. Please sign in.' });
  } catch (error) {
    if (error.code?.startsWith('SQLITE_CONSTRAINT')) return response.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    console.error('Registration failed:', error);
    return response.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.get('/api/auth/me', (request, response) => {
  const user = currentUser(request);
  return response.json({ authenticated: Boolean(user), user: user ? { name: user.name, email: user.email, role: user.role, room: user.room } : null });
});

app.get('/api/admin/dashboard', (request, response) => {
  const user = currentUser(request);
  if (!user || user.role !== 'admin') return response.status(403).json({ error: 'Admin access required.' });
  const students = database.prepare("SELECT id, name, email, room, 'Not assigned' AS bed, 'Active' AS status FROM users WHERE role = 'student' ORDER BY name").all();
  return response.json({
    students,
    rooms: [
      { room: 'A-204', type: 'Double', beds: '2 / 2', vacancy: 'Full', students: 'Ananya Mehta, Riya Kapoor' },
      { room: 'A-116', type: 'Single', beds: '1 / 1', vacancy: 'Full', students: 'Karan Malhotra' },
      { room: 'B-108', type: 'Single', beds: '0 / 1', vacancy: '1 bed vacant', students: 'Vacant' },
      { room: 'B-206', type: 'Single', beds: '0 / 1', vacancy: 'Maintenance', students: 'Water leakage repair' },
      { room: 'C-302', type: 'Double', beds: '1 / 2', vacancy: '1 bed vacant', students: 'Niharika Singh' }
    ],
    payments: [
      { student: 'Karan Malhotra', amount: '₹12,500', date: '22 Aug, 09:18', status: 'Received' },
      { student: 'Rohan Sethi', amount: '₹11,800', date: 'Due 24 Aug', status: 'Pending' },
      { student: 'Priya Nair', amount: '₹13,500', date: 'Due 20 Aug', status: 'Overdue' }
    ],
    notices: database.prepare("SELECT title, message, audience, created_at AS date FROM notices ORDER BY id DESC LIMIT 10").all()
  });
});

app.patch('/api/admin/account', (request, response) => {
  const user = currentUser(request);
  if (!user || user.role !== 'admin') return response.status(403).json({ error: 'Admin access required.' });
  const { name, email, password } = request.body || {};
  if (!name?.trim() || !email?.trim()) return response.status(400).json({ error: 'Name and email are required.' });
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return response.status(400).json({ error: 'Enter a valid email address.' });
  if (password && (password.length < 8 || !/[A-Z]/.test(password) || !/[^A-Za-z0-9]/.test(password))) {
    return response.status(400).json({ error: 'Password must be 8+ characters with one uppercase letter and one special symbol.' });
  }
  const otherUser = database.prepare('SELECT id FROM users WHERE lower(email) = lower(?) AND id != ?').get(normalizedEmail, user.id);
  if (otherUser) return response.status(409).json({ error: 'That email is already in use.' });
  database.prepare('UPDATE users SET name = ?, email = ?, password_hash = COALESCE(?, password_hash) WHERE id = ?').run(name.trim(), normalizedEmail, password ? bcrypt.hashSync(password, 12) : null, user.id);
  return response.json({ message: 'Admin account updated. Please sign in again.' });
});

app.post('/api/admin/notices', (request, response) => {
  const user = currentUser(request);
  if (!user || user.role !== 'admin') return response.status(403).json({ error: 'Admin access required.' });
  const { title, message, audience = 'All residents' } = request.body || {};
  if (!title?.trim() || !message?.trim()) return response.status(400).json({ error: 'Notice title and message are required.' });
  const result = database.prepare('INSERT INTO notices (title, message, audience) VALUES (?, ?, ?)').run(title.trim(), message.trim(), audience);
  return response.status(201).json({ notice: { id: Number(result.lastInsertRowid), title: title.trim(), message: message.trim(), audience, sentAt: new Date().toISOString() } });
});

app.post('/api/auth/logout', (request, response) => {
  const token = request.headers.cookie?.match(/(?:^|; )arbor_session=([^;]+)/)?.[1];
  if (token) database.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  response.setHeader('Set-Cookie', 'arbor_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  return response.json({ ok: true });
});

app.listen(port, () => console.log(`Arbor House is running at http://localhost:${port}`));
