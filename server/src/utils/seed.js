const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Notice = require('../models/Notice');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const PaymentLedger = require('../models/PaymentLedger');
const Visitor = require('../models/Visitor');
const Outpass = require('../models/Outpass');
const MessAttendance = require('../models/MessAttendance');
const MessMenu = require('../models/MessMenu');
const Complaint = require('../models/Complaint');

async function seedDatabase() {
  const seedPassword = process.env.SEED_PASSWORD || 'admin123';
  const adminEmail = 'demo@admin.in';

  // 1. Seed or update Admin user
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = bcrypt.hashSync(seedPassword, 12);
    admin = await User.create({
      name: 'Arbor Admin',
      email: adminEmail,
      phone: '+91 98765 00001',
      passwordHash,
      role: 'admin',
      room: null,
      bed: null,
      status: 'approved',
      admissionNumber: 'ADM-ADMIN-01',
      guardianName: 'Hostel Trust Board',
      guardianPhone: '+91 98765 00000',
      documentStatus: 'Verified'
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  }

  // 2. Seed default sample student residents with traditional admission details if none exist
  let student1 = await User.findOne({ email: 'ananya@student.in' });
  if (!student1) {
    const passwordHash = bcrypt.hashSync('student123', 12);
    student1 = await User.create({
      name: 'Ananya Mehta',
      email: 'ananya@student.in',
      phone: '+91 98111 22334',
      passwordHash,
      role: 'student',
      room: 'A-204',
      bed: 'Bed 1',
      status: 'approved',
      admissionNumber: 'ADM-2026-001',
      guardianName: 'Rajesh Mehta',
      guardianPhone: '+91 98111 55667',
      guardianRelation: 'Father',
      emergencyContact: '+91 98111 55667',
      college: 'National Institute of Design',
      course: 'B.Des Industrial Design',
      yearOfStudy: '2nd Year',
      permanentAddress: '14, Civil Lines, Jaipur, Rajasthan',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-4589',
      documentStatus: 'Verified',
      admissionDate: new Date('2026-07-15')
    });
  }

  let student2 = await User.findOne({ email: 'rohan@student.in' });
  if (!student2) {
    const passwordHash = bcrypt.hashSync('student123', 12);
    student2 = await User.create({
      name: 'Rohan Sethi',
      email: 'rohan@student.in',
      phone: '+91 98222 33445',
      passwordHash,
      role: 'student',
      room: 'B-108',
      bed: 'Bed 1',
      status: 'approved',
      admissionNumber: 'ADM-2026-002',
      guardianName: 'Sunita Sethi',
      guardianPhone: '+91 98222 77889',
      guardianRelation: 'Mother',
      emergencyContact: '+91 98222 77889',
      college: 'Symbiosis Law School',
      course: 'B.A. LL.B.',
      yearOfStudy: '1st Year',
      permanentAddress: 'Plot 82, Sector 15, Chandigarh',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-7812',
      documentStatus: 'Verified',
      admissionDate: new Date('2026-08-01')
    });
  }

  // 3. Seed default rooms if empty
  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    await Room.insertMany([
      { room: 'A-204', students: '2 students', beds: '2 / 2 beds', vacancy: 'Full' },
      { room: 'B-108', students: '1 student', beds: '1 / 1 bed', vacancy: 'Full' },
      { room: 'C-302', students: '1 student', beds: '1 / 2 beds', vacancy: '1 vacant' },
      { room: 'B-206', students: '0 students', beds: '0 / 1 bed', vacancy: 'Maintenance' },
      { room: 'A-116', students: '2 students', beds: '2 / 2 beds', vacancy: 'Full' }
    ]);
  }

  // 4. Seed Payment Ledger records
  const ledgerCount = await PaymentLedger.countDocuments();
  if (ledgerCount === 0 && student1 && student2) {
    await PaymentLedger.insertMany([
      {
        studentId: student1._id,
        studentName: student1.name,
        room: student1.room,
        receiptNumber: 'REC-2026-001',
        paymentType: 'Security Deposit',
        forMonth: '2026-07',
        amountDue: 20000,
        amountPaid: 20000,
        balance: 0,
        dueDate: new Date('2026-07-20'),
        paymentDate: new Date('2026-07-16'),
        paymentMode: 'Bank Transfer / NEFT',
        transactionRef: 'NEFT982736152',
        isCash: false,
        isVerified: true,
        paymentStatus: 'Paid',
        recordedBy: 'Accounts Officer',
        notes: 'One-time refundable caution deposit',
        auditTrail: [{ action: 'Created', performedBy: 'Accounts Officer', details: 'Full deposit received via NEFT' }]
      },
      {
        studentId: student1._id,
        studentName: student1.name,
        room: student1.room,
        receiptNumber: 'REC-2026-002',
        paymentType: 'Monthly Rent',
        forMonth: '2026-08',
        amountDue: 14000,
        amountPaid: 14000,
        balance: 0,
        dueDate: new Date('2026-08-05'),
        paymentDate: new Date('2026-08-03'),
        paymentMode: 'UPI / Online',
        transactionRef: 'UPI-HDFC-998811',
        isCash: false,
        isVerified: true,
        paymentStatus: 'Paid',
        recordedBy: 'Accounts Officer',
        notes: 'August 2026 rent paid on time',
        auditTrail: [{ action: 'Created', performedBy: 'Accounts Officer', details: 'UPI reference verified' }]
      },
      {
        studentId: student2._id,
        studentName: student2.name,
        room: student2.room,
        receiptNumber: 'REC-2026-003',
        paymentType: 'Monthly Rent',
        forMonth: '2026-08',
        amountDue: 18000,
        amountPaid: 10000,
        balance: 8000,
        dueDate: new Date('2026-08-05'),
        paymentDate: new Date('2026-08-04'),
        paymentMode: 'Cash',
        transactionRef: '',
        isCash: true,
        isVerified: false,
        paymentStatus: 'Partially Paid',
        recordedBy: 'Warden Desk',
        notes: 'Physical cash received at front desk; balance promised by 25th Aug',
        auditTrail: [{ action: 'Created', performedBy: 'Warden Desk', details: 'Cash receipt issued; awaiting physical verification' }]
      }
    ]);
  }

  // 5. Seed Visitors
  const visitorCount = await Visitor.countDocuments();
  if (visitorCount === 0 && student1) {
    await Visitor.insertMany([
      {
        visitorName: 'Rajesh Mehta',
        visitorPhone: '+91 98111 55667',
        studentId: student1._id,
        studentName: student1.name,
        studentRoom: student1.room,
        purpose: 'Family visit & baggage delivery',
        relation: 'Father',
        idProof: 'Aadhaar verified',
        entryTime: new Date(Date.now() - 3600000 * 3),
        exitTime: new Date(Date.now() - 3600000 * 1),
        status: 'Departed',
        recordedBy: 'Gate Guard'
      },
      {
        visitorName: 'Aditya Roy',
        visitorPhone: '+91 99333 44556',
        studentId: student1._id,
        studentName: student1.name,
        studentRoom: student1.room,
        purpose: 'Group study project',
        relation: 'Classmate',
        idProof: 'College ID verified',
        entryTime: new Date(Date.now() - 1800000),
        exitTime: null,
        status: 'In Premises',
        recordedBy: 'Warden Desk'
      }
    ]);
  }

  // 6. Seed Outpasses
  const outpassCount = await Outpass.countDocuments();
  if (outpassCount === 0 && student1 && student2) {
    await Outpass.insertMany([
      {
        outpassNumber: 'OUT-2026-001',
        studentId: student1._id,
        studentName: student1.name,
        room: student1.room,
        destination: 'Central Library, University Campus',
        reason: 'Book collection & research work',
        departureTime: new Date(Date.now() - 7200000),
        expectedReturnTime: new Date(Date.now() + 3600000 * 2),
        actualReturnTime: null,
        status: 'Approved',
        approvedBy: 'Hostel Warden',
        parentInformed: true,
        remarks: 'Cleared by warden'
      },
      {
        outpassNumber: 'OUT-2026-002',
        studentId: student2._id,
        studentName: student2.name,
        room: student2.room,
        destination: 'Home (Chandigarh)',
        reason: 'Family function over the weekend',
        departureTime: new Date(Date.now() - 86400000 * 2),
        expectedReturnTime: new Date(Date.now() - 3600000),
        actualReturnTime: null,
        status: 'Overdue',
        approvedBy: 'Hostel Warden',
        parentInformed: true,
        remarks: 'Warden called guardian; confirmed return delayed by train'
      }
    ]);
  }

  // 7. Seed Weekly Mess Menu
  const menuCount = await MessMenu.countDocuments();
  if (menuCount === 0) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menus = [
      { dayOfWeek: 'Monday', breakfast: 'Idli, Sambar & Coconut Chutney', lunch: 'Rajma, Jeera Rice, Phulka, Curd', dinner: 'Dal Tadka, Paneer Butter Masala, Roti, Salad' },
      { dayOfWeek: 'Tuesday', breakfast: 'Poha, Boiled Egg/Sprouts, Tea', lunch: 'Kadhi Pakoda, Steam Rice, Bhindi Fry', dinner: 'Aloo Gobi, Dal Makhani, Tawa Roti, Kheer' },
      { dayOfWeek: 'Wednesday', breakfast: 'Aloo Paratha, Curd & Pickle', lunch: 'Chole, Kulcha / Rice, Mixed Salad', dinner: 'Egg Curry / Shahi Paneer, Dal, Steamed Rice, Phulka' },
      { dayOfWeek: 'Thursday', breakfast: 'Upma, Vada, Chutney, Coffee', lunch: 'Dal Fry, Mix Veg, Steamed Rice, Roti', dinner: 'Veg Biryani / Chicken Biryani, Raita, Gulab Jamun' },
      { dayOfWeek: 'Friday', breakfast: 'Masala Dosa, Sambar, Filter Coffee', lunch: 'Paneer Do Pyaza, Dal, Jeera Rice, Chapati', dinner: 'Matar Paneer, Dal Palak, Phulka, Boondi Raita' },
      { dayOfWeek: 'Saturday', breakfast: 'Puri Bhaji & Halwa', lunch: 'Khichdi, Kadhi, Papad, Achar, Chutney', dinner: 'Mix Dal, Seasonal Veg Sabzi, Roti, Ice Cream' },
      { dayOfWeek: 'Sunday', breakfast: 'Chole Bhature & Sweet Lassi', lunch: 'Special Sunday Feast: Paneer Tikka / Chicken Masala, Pulao, Naan', dinner: 'Light Dinner: Khichdi / Dalia, Dal, Papad, Fruit Custard' }
    ];
    await MessMenu.insertMany(menus);
  }

  // 8. Seed Complaints
  const complaintCount = await Complaint.countDocuments();
  if (complaintCount === 0 && student1 && student2) {
    await Complaint.insertMany([
      {
        complaintNumber: 'CMP-1001',
        studentId: student1._id,
        studentName: student1.name,
        room: student1.room,
        category: 'Water',
        title: 'Bathroom tap leaking continuously',
        description: 'The cold water tap in attached washroom is dripping continuously and creating sound.',
        priority: 'High',
        status: 'Assigned',
        assignedStaff: 'Ramesh (Plumber)'
      },
      {
        complaintNumber: 'CMP-1002',
        studentId: student2._id,
        studentName: student2.name,
        room: student2.room,
        category: 'Internet',
        title: 'Wi-Fi disconnects on 1st floor corridor',
        description: 'Repeated signal drop since yesterday evening during online classes.',
        priority: 'Medium',
        status: 'In Progress',
        assignedStaff: 'Alok (Network Technician)'
      },
      {
        complaintNumber: 'CMP-1003',
        studentId: student1._id,
        studentName: student1.name,
        room: student1.room,
        category: 'Cleaning',
        title: 'Deep cleaning required for room window sill',
        description: 'Dust accumulated due to exterior road work nearby.',
        priority: 'Low',
        status: 'Resolved',
        assignedStaff: 'Sunita (Housekeeping)',
        resolutionDetails: 'Window mesh and room deep cleaned on 19 Aug',
        resolvedAt: new Date(Date.now() - 86400000 * 2)
      }
    ]);
  }

  // 9. Seed Enhanced Notices
  const noticeCount = await Notice.countDocuments();
  if (noticeCount <= 2) {
    await Notice.deleteMany({}); // refresh with traditional categorised notices
    await Notice.insertMany([
      {
        title: 'Emergency: Overhead Tank Cleaning & Water Supply',
        message: 'Water supply will be suspended between 2:00 PM and 5:00 PM on Thursday for bi-monthly overhead tank sanitization. Kindly store sufficient water in advance.',
        category: 'Water',
        audience: 'All residents',
        isImportant: true,
        isArchived: false,
        publishDate: new Date(),
        expiryDate: new Date(Date.now() + 86400000 * 3)
      },
      {
        title: 'Hostel Night In-Timing & Gate Register Rules',
        message: 'All residents are strictly reminded that main gate closes at 10:00 PM sharp. Students returning late must have prior approved outpass from the hostel warden. Failure will result in disciplinary note.',
        category: 'Rules & Regulation',
        audience: 'All residents',
        isImportant: true,
        isArchived: false,
        publishDate: new Date(),
        expiryDate: new Date(Date.now() + 86400000 * 30)
      },
      {
        title: 'Special Independence Day Celebratory Feast',
        message: 'Mess committee has scheduled a special cultural lunch menu with Paneer Lababdar, Jeera Rice, Naan, and Gulab Jamun on 15th August.',
        category: 'Mess',
        audience: 'All residents',
        isImportant: false,
        isArchived: false,
        publishDate: new Date('2026-08-10'),
        expiryDate: new Date('2026-08-16')
      }
    ]);
  }
}

module.exports = { seedDatabase };
