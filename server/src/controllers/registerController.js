const User = require('../models/User');
const PaymentLedger = require('../models/PaymentLedger');
const Visitor = require('../models/Visitor');
const Outpass = require('../models/Outpass');
const MessAttendance = require('../models/MessAttendance');
const MessMenu = require('../models/MessMenu');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. ADMISSION REGISTER CONTROLLER
// ==========================================
async function getAdmissions(req, res, next) {
  try {
    const { search, status, documentStatus, room } = req.query;
    const filter = { role: 'student' };

    // Role-based access control: Students can only view their own admission record
    if (req.user?.role === 'student') {
      filter._id = req.user._id;
    } else {
      if (status) filter.status = status;
      if (documentStatus) filter.documentStatus = documentStatus;
      if (room) filter.room = room;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { room: regex },
        { college: regex },
        { admissionNumber: regex }
      ];
    }

    const students = await User.find(filter)
      .select('-passwordHash')
      .sort({ admissionDate: -1, createdAt: -1 });

    return res.json({
      total: students.length,
      admissions: students
    });
  } catch (err) {
    next(err);
  }
}

async function updateAdmission(req, res, next) {
  try {
    const allowedFields = [
      'room',
      'bed',
      'status',
      'phone',
      'guardianName',
      'guardianPhone',
      'guardianRelation',
      'emergencyContact',
      'college',
      'course',
      'yearOfStudy',
      'permanentAddress',
      'idProofType',
      'idProofNumber',
      'documentStatus',
      'admissionDate',
      'leavingDate'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    return res.json({
      message: 'Admission register updated successfully.',
      student
    });
  } catch (err) {
    next(err);
  }
}

async function admitResidentDirectly(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      password,
      room,
      bed,
      guardianName,
      guardianPhone,
      guardianRelation,
      emergencyContact,
      college,
      course,
      yearOfStudy,
      permanentAddress,
      idProofType,
      idProofNumber,
      documentStatus
    } = req.body || {};

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Name and Email are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'A resident with this email is already registered.' });
    }

    const count = await User.countDocuments({ role: 'student' });
    const admissionNumber = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const passwordHash = bcrypt.hashSync(password || 'hostel123', 12);

    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      passwordHash,
      role: 'student',
      room: room?.trim() || null,
      bed: bed?.trim() || null,
      status: room ? 'approved' : 'pending',
      admissionNumber,
      guardianName: guardianName?.trim() || '',
      guardianPhone: guardianPhone?.trim() || '',
      guardianRelation: guardianRelation?.trim() || 'Parent',
      emergencyContact: emergencyContact?.trim() || '',
      college: college?.trim() || '',
      course: course?.trim() || '',
      yearOfStudy: yearOfStudy?.trim() || '1st Year',
      permanentAddress: permanentAddress?.trim() || '',
      idProofType: idProofType || 'Not Provided',
      idProofNumber: idProofNumber?.trim() || '',
      documentStatus: documentStatus || 'Pending',
      admissionDate: new Date()
    });

    return res.status(201).json({
      message: 'Resident admitted successfully into admission register.',
      student
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. RENT & PAYMENT LEDGER CONTROLLER
// ==========================================
async function getLedger(req, res, next) {
  try {
    const { studentId, month, status, paymentMode, search } = req.query;
    const filter = {};

    // Role-based access control: Students can only view their own ledger transactions
    if (req.user?.role === 'student') {
      filter.studentId = req.user._id;
    } else if (studentId) {
      filter.studentId = studentId;
    }

    if (month) filter.forMonth = month;
    if (status) filter.paymentStatus = status;
    if (paymentMode) filter.paymentMode = paymentMode;

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { studentName: regex },
        { receiptNumber: regex },
        { room: regex },
        { transactionRef: regex }
      ];
    }

    const entries = await PaymentLedger.find(filter).sort({ paymentDate: -1, createdAt: -1 });

    // Financial summaries
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalCash = 0;
    let totalBank = 0;

    for (const entry of entries) {
      totalCollected += entry.amountPaid || 0;
      totalOutstanding += entry.balance || 0;
      if (entry.isCash) totalCash += entry.amountPaid || 0;
      else totalBank += entry.amountPaid || 0;
    }

    return res.json({
      summary: {
        totalRecords: entries.length,
        totalCollected,
        totalOutstanding,
        totalCash,
        totalBank
      },
      entries
    });
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const {
      studentId,
      paymentType,
      forMonth,
      amountDue,
      amountPaid,
      paymentMode,
      transactionRef,
      notes
    } = req.body || {};

    if (!studentId) {
      return res.status(400).json({ error: 'Please select a student resident.' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student resident not found.' });
    }

    const numPaid = Number(amountPaid) || 0;
    const numDue = Number(amountDue) || numPaid;
    const balance = Math.max(0, numDue - numPaid);

    let paymentStatus = 'Paid';
    if (balance > 0 && numPaid > 0) paymentStatus = 'Partially Paid';
    else if (numPaid === 0) paymentStatus = 'Outstanding';

    const count = await PaymentLedger.countDocuments();
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const isCash = paymentMode === 'Cash';
    const isVerified = !isCash; // Cash is an internal desk receipt, not automatically bank verified

    const ledgerEntry = await PaymentLedger.create({
      studentId: student._id,
      studentName: student.name,
      room: student.room || 'Unassigned',
      receiptNumber,
      paymentType: paymentType || 'Monthly Rent',
      forMonth: forMonth || new Date().toISOString().slice(0, 7),
      amountDue: numDue,
      amountPaid: numPaid,
      balance,
      dueDate: new Date(Date.now() + 86400000 * 5),
      paymentDate: new Date(),
      paymentMode,
      transactionRef: transactionRef ? transactionRef.trim() : '',
      isCash,
      isVerified,
      paymentStatus,
      recordedBy: req.user?.name || 'Accountant',
      notes: notes?.trim() || '',
      auditTrail: [
        {
          action: 'Initial Record',
          performedBy: req.user?.name || 'Accountant',
          details: `Recorded ₹${numPaid} via ${paymentMode}${isCash ? ' (Cash at desk)' : ` (Ref: ${transactionRef})`}`
        }
      ]
    });

    return res.status(201).json({
      message: 'Ledger entry and receipt generated successfully.',
      ledgerEntry
    });
  } catch (err) {
    next(err);
  }
}

async function getReceipt(req, res, next) {
  try {
    const entry = await PaymentLedger.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Payment receipt not found.' });
    }

    // Role-based protection: Student can only view their own payment receipt
    if (req.user?.role === 'student' && entry.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to view this payment receipt.' });
    }

    const student = await User.findById(entry.studentId).select('-passwordHash');

    return res.json({
      hostel: {
        name: 'Arbor House PG',
        address: '12, College Road, Student Zone, University Enclave',
        phone: '+91 98765 43210',
        email: 'hello@arborhouse.in'
      },
      receipt: entry,
      student
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. VISITOR & OUTPASS REGISTER CONTROLLER
// ==========================================
async function getVisitors(req, res, next) {
  try {
    const { status, search } = req.query;
    const filter = {};

    // Role-based protection: Students only see visitor records logged for them
    if (req.user?.role === 'student') {
      filter.$or = [
        { studentName: req.user.name },
        ...(req.user.room ? [{ studentRoom: req.user.room }] : [])
      ];
    }

    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      const searchConditions = [{ visitorName: regex }, { visitorPhone: regex }, { studentName: regex }, { studentRoom: regex }];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const visitors = await Visitor.find(filter).sort({ entryTime: -1 });
    return res.json({ visitors });
  } catch (err) {
    next(err);
  }
}

async function logVisitor(req, res, next) {
  try {
    const { visitorName, visitorPhone, studentName, studentRoom, purpose, relation, idProof } = req.body || {};

    if (!visitorName?.trim() || !visitorPhone?.trim() || !studentName?.trim() || !studentRoom?.trim()) {
      return res.status(400).json({ error: 'Visitor name, phone, student name, and room are required.' });
    }

    const visitor = await Visitor.create({
      visitorName: visitorName.trim(),
      visitorPhone: visitorPhone.trim(),
      studentName: studentName.trim(),
      studentRoom: studentRoom.trim(),
      purpose: purpose?.trim() || 'Personal Visit',
      relation: relation?.trim() || 'Guest',
      idProof: idProof?.trim() || 'ID verified at gate',
      entryTime: new Date(),
      status: 'In Premises',
      recordedBy: req.user?.name || 'Gate Security'
    });

    return res.status(201).json({ message: 'Visitor entry recorded.', visitor });
  } catch (err) {
    next(err);
  }
}

async function markVisitorExit(req, res, next) {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { exitTime: new Date(), status: 'Departed' },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ error: 'Visitor record not found.' });
    return res.json({ message: 'Visitor exit logged.', visitor });
  } catch (err) {
    next(err);
  }
}

async function getOutpasses(req, res, next) {
  try {
    const { studentId, status } = req.query;
    const filter = {};

    // Role-based protection: Students only view their own outpasses
    if (req.user?.role === 'student') {
      filter.studentId = req.user._id;
    } else if (studentId) {
      filter.studentId = studentId;
    }

    if (status) filter.status = status;

    const outpasses = await Outpass.find(filter).sort({ departureTime: -1 });

    // Update overdue checks
    for (const op of outpasses) {
      if (op.status === 'Approved' && !op.actualReturnTime && new Date() > op.expectedReturnTime) {
        op.status = 'Overdue';
        await op.save();
      }
    }

    return res.json({ outpasses });
  } catch (err) {
    next(err);
  }
}

async function createOutpass(req, res, next) {
  try {
    const { destination, reason, departureTime, expectedReturnTime, studentId } = req.body || {};
    // Students can only create outpasses for themselves
    const targetStudentId = req.user?.role === 'student' ? req.user._id : (studentId || req.user?._id);

    if (!targetStudentId) {
      return res.status(400).json({ error: 'Student identifier required.' });
    }

    const student = await User.findById(targetStudentId);
    if (!student) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    if (!destination?.trim() || !reason?.trim() || !expectedReturnTime) {
      return res.status(400).json({ error: 'Destination, reason, and expected return time are required.' });
    }

    const count = await Outpass.countDocuments();
    const outpassNumber = `OUT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const outpass = await Outpass.create({
      outpassNumber,
      studentId: student._id,
      studentName: student.name,
      room: student.room || 'Unassigned',
      destination: destination.trim(),
      reason: reason.trim(),
      departureTime: departureTime ? new Date(departureTime) : new Date(),
      expectedReturnTime: new Date(expectedReturnTime),
      status: 'Pending',
      approvedBy: 'Pending Review',
      parentInformed: true
    });

    return res.status(201).json({ message: 'Outpass request submitted to warden.', outpass });
  } catch (err) {
    next(err);
  }
}

async function updateOutpassStatus(req, res, next) {
  try {
    const { action, remarks } = req.body; // action: 'approve' | 'reject' | 'return'
    const outpass = await Outpass.findById(req.params.id);
    if (!outpass) return res.status(404).json({ error: 'Outpass record not found.' });

    if (action === 'approve') {
      outpass.status = 'Approved';
      outpass.approvedBy = req.user?.name || 'Hostel Warden';
    } else if (action === 'reject') {
      outpass.status = 'Rejected';
      outpass.approvedBy = req.user?.name || 'Hostel Warden';
      outpass.rejectionReason = remarks || 'Permission not granted by warden.';
    } else if (action === 'return') {
      outpass.actualReturnTime = new Date();
      outpass.status = 'Returned';
      outpass.remarks = remarks || 'Returned safe';
    }

    await outpass.save();
    return res.json({ message: `Outpass marked as ${outpass.status}.`, outpass });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. MESS & MEAL REGISTER CONTROLLER
// ==========================================
async function getMessMenu(_req, res, next) {
  try {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menus = await MessMenu.find();
    menus.sort((a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek));
    return res.json({ menus });
  } catch (err) {
    next(err);
  }
}

async function updateMessMenu(req, res, next) {
  try {
    const { dayOfWeek } = req.params;
    const { breakfast, lunch, snacks, dinner, specialItem } = req.body;

    const menu = await MessMenu.findOneAndUpdate(
      { dayOfWeek },
      { breakfast, lunch, snacks, dinner, specialItem },
      { new: true, upsert: true }
    );

    return res.json({ message: `${dayOfWeek} menu updated.`, menu });
  } catch (err) {
    next(err);
  }
}

async function getMessAttendance(req, res, next) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const records = await MessAttendance.find({ date });
    const students = await User.find({ role: 'student', status: 'approved' }).select('name room');

    // Aggregate counts
    let breakfastCount = 0;
    let lunchCount = 0;
    let dinnerCount = 0;

    const mapped = students.map((st) => {
      const rec = records.find((r) => r.studentId.toString() === st._id.toString());
      if (rec?.breakfast) breakfastCount++;
      if (rec?.lunch) lunchCount++;
      if (rec?.dinner) dinnerCount++;

      return {
        studentId: st._id,
        studentName: st.name,
        room: st.room || 'Unassigned',
        date,
        breakfast: rec ? rec.breakfast : true,
        lunch: rec ? rec.lunch : true,
        dinner: rec ? rec.dinner : true,
        specialDiet: rec?.specialDiet || 'Regular'
      };
    });

    return res.json({
      date,
      counts: {
        totalStudents: students.length,
        breakfastCount,
        lunchCount,
        dinnerCount
      },
      attendance: mapped
    });
  } catch (err) {
    next(err);
  }
}

async function markMessAttendance(req, res, next) {
  try {
    const { studentId, date, meal, present } = req.body;
    if (!studentId || !date || !meal) {
      return res.status(400).json({ error: 'studentId, date, and meal are required.' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const update = {
      studentName: student.name,
      room: student.room || 'Unassigned',
      [meal]: Boolean(present)
    };

    const record = await MessAttendance.findOneAndUpdate(
      { date, studentId },
      { $set: update },
      { new: true, upsert: true }
    );

    return res.json({ message: 'Attendance updated.', record });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 5. COMPLAINT & MAINTENANCE CONTROLLER
// ==========================================
async function getComplaints(req, res, next) {
  try {
    const { category, priority, status, search, studentId } = req.query;
    const filter = {};

    // Role-based protection: Students only view their own complaints
    if (req.user?.role === 'student') {
      filter.studentId = req.user._id;
    } else if (studentId) {
      filter.studentId = studentId;
    }

    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ complaintNumber: regex }, { title: regex }, { studentName: regex }, { room: regex }];
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    return res.json({ complaints });
  } catch (err) {
    next(err);
  }
}

async function createComplaint(req, res, next) {
  try {
    const { category, title, description, priority, studentId, room } = req.body || {};
    // Students submit under their own ID and room
    const targetStudentId = req.user?.role === 'student' ? req.user._id : (studentId || req.user?._id);

    if (!targetStudentId) {
      return res.status(400).json({ error: 'Student required.' });
    }

    const student = await User.findById(targetStudentId);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const count = await Complaint.countDocuments();
    const complaintNumber = `CMP-${String(count + 1001)}`;

    const complaint = await Complaint.create({
      complaintNumber,
      studentId: student._id,
      studentName: student.name,
      room: room || student.room || 'General',
      category: category || 'Water',
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'Medium',
      status: 'Open',
      assignedStaff: 'Unassigned'
    });

    return res.status(201).json({ message: 'Complaint registered successfully.', complaint });
  } catch (err) {
    next(err);
  }
}

async function updateComplaint(req, res, next) {
  try {
    const { status, assignedStaff, resolutionDetails } = req.body || {};
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

    if (status) complaint.status = status;
    if (assignedStaff) complaint.assignedStaff = assignedStaff;
    if (resolutionDetails) complaint.resolutionDetails = resolutionDetails;
    if (status === 'Resolved' || status === 'Closed') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();
    return res.json({ message: 'Complaint register updated.', complaint });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 6. DIGITAL NOTICE BOARD CONTROLLER
// ==========================================
async function getNotices(req, res, next) {
  try {
    const { category, showArchived } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (showArchived !== 'true') filter.isArchived = false;

    const notices = await Notice.find(filter).sort({ isImportant: -1, publishDate: -1, createdAt: -1 });
    return res.json({ notices });
  } catch (err) {
    next(err);
  }
}

async function createNotice(req, res, next) {
  try {
    const { title, message, category, audience, isImportant, expiryDate } = req.body || {};
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Notice title and message are required.' });
    }

    const notice = await Notice.create({
      title: title.trim(),
      message: message.trim(),
      category: category || 'General',
      audience: audience?.trim() || 'All residents',
      isImportant: Boolean(isImportant),
      isArchived: false,
      publishDate: new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null
    });

    return res.status(201).json({ message: 'Circular published to notice board.', notice });
  } catch (err) {
    next(err);
  }
}

async function toggleArchiveNotice(req, res, next) {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ error: 'Notice not found.' });

    notice.isArchived = !notice.isArchived;
    await notice.save();

    return res.json({
      message: notice.isArchived ? 'Notice archived (retained in historical record).' : 'Notice restored.',
      notice
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Admissions
  getAdmissions,
  updateAdmission,
  admitResidentDirectly,

  // Ledger
  getLedger,
  recordPayment,
  getReceipt,

  // Visitors & Outpass
  getVisitors,
  logVisitor,
  markVisitorExit,
  getOutpasses,
  createOutpass,
  updateOutpassStatus,

  // Mess
  getMessMenu,
  updateMessMenu,
  getMessAttendance,
  markMessAttendance,

  // Complaints
  getComplaints,
  createComplaint,
  updateComplaint,

  // Notices
  getNotices,
  createNotice,
  toggleArchiveNotice
};
