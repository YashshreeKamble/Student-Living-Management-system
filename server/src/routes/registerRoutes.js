const express = require('express');
const {
  getAdmissions,
  updateAdmission,
  admitResidentDirectly,
  getLedger,
  recordPayment,
  getReceipt,
  getVisitors,
  logVisitor,
  markVisitorExit,
  getOutpasses,
  createOutpass,
  updateOutpassStatus,
  getMessMenu,
  updateMessMenu,
  getMessAttendance,
  markMessAttendance,
  getComplaints,
  createComplaint,
  updateComplaint,
  getNotices,
  createNotice,
  toggleArchiveNotice
} = require('../controllers/registerController');
const { authenticate, requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// All register routes require an authenticated user
router.use(authenticate, requireAuth);

// 1. Admission Register
router.get('/admissions', getAdmissions);
router.post('/admissions', requireAdmin, admitResidentDirectly);
router.patch('/admissions/:id', requireAdmin, updateAdmission);

// 2. Rent & Payment Ledger
router.get('/ledger', getLedger);
router.post('/ledger', requireAdmin, recordPayment);
router.get('/ledger/:id/receipt', getReceipt);

// 3. Visitor & Outpass Register
router.get('/visitors', getVisitors);
router.post('/visitors', logVisitor);
router.patch('/visitors/:id/exit', markVisitorExit);
router.get('/outpasses', getOutpasses);
router.post('/outpasses', createOutpass);
router.patch('/outpasses/:id/status', requireAdmin, updateOutpassStatus);

// 4. Mess & Meal Register
router.get('/mess/menu', getMessMenu);
router.put('/mess/menu/:dayOfWeek', requireAdmin, updateMessMenu);
router.get('/mess/attendance', getMessAttendance);
router.post('/mess/attendance', requireAdmin, markMessAttendance);

// 5. Complaint Register
router.get('/complaints', getComplaints);
router.post('/complaints', createComplaint);
router.patch('/complaints/:id', requireAdmin, updateComplaint);

// 6. Notice Board
router.get('/notices', getNotices);
router.post('/notices', requireAdmin, createNotice);
router.patch('/notices/:id/archive', requireAdmin, toggleArchiveNotice);

module.exports = router;
