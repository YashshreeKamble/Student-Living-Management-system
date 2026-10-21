const express = require('express');
const {
  getDashboard,
  approveStudent,
  updateAccount,
  createNotice
} = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth + requireAdmin to all admin routes
router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.patch('/students/:id/approve', approveStudent);
router.patch('/account', updateAccount);
router.post('/notices', createNotice);

module.exports = router;
