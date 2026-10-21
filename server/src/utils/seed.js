const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Room = require('../models/Room');
const Payment = require('../models/Payment');

async function seedDatabase() {
  const seedPassword = process.env.SEED_PASSWORD || 'admin123';
  const adminEmail = 'demo@admin.in';

  // Seed or update Admin user
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync(seedPassword, 12);
    await User.create({
      name: 'Arbor Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      room: null,
      bed: null,
      status: 'approved'
    });
    console.log(`Seeded admin user: ${adminEmail} (password: ${seedPassword})`);
  }

  // Seed default rooms if empty
  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    await Room.insertMany([
      { room: 'A-204', students: '2 students', beds: '2 / 2 beds', vacancy: 'Full' },
      { room: 'B-108', students: '1 student', beds: '1 / 1 bed', vacancy: 'Full' },
      { room: 'C-302', students: '1 student', beds: '1 / 2 beds', vacancy: '1 vacant' },
      { room: 'B-206', students: '0 students', beds: '0 / 1 bed', vacancy: 'Maintenance' }
    ]);
  }

  // Seed default payments if empty
  const paymentCount = await Payment.countDocuments();
  if (paymentCount === 0) {
    await Payment.insertMany([
      { student: 'Karan Malhotra', amount: '₹12,500', date: '22 Aug, 09:18', status: 'Received' },
      { student: 'Devika Shah', amount: '₹14,000', date: '21 Aug, 16:42', status: 'Received' },
      { student: 'Rohan Sethi', amount: '₹11,800', date: 'Due 24 Aug', status: 'Pending' },
      { student: 'Priya Nair', amount: '₹13,500', date: 'Due 20 Aug', status: 'Overdue' }
    ]);
  }

  // Seed default notices if empty
  const noticeCount = await Notice.countDocuments();
  if (noticeCount === 0) {
    await Notice.insertMany([
      {
        title: 'Water supply maintenance',
        message: 'Water supply will be temporarily turned off for routine pipeline maintenance.',
        audience: 'All residents'
      },
      {
        title: 'Independence Day holiday',
        message: 'Mess will follow holiday timings. Lunch will feature special celebratory menu.',
        audience: 'All residents'
      }
    ]);
  }
}

module.exports = { seedDatabase };
