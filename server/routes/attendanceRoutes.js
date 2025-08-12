const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAttendanceStats,
  markAttendance,
  getAttendanceHistory,
  deleteAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

// All attendance routes require authentication
router.use(authenticateToken);

router.get('/stats', getAttendanceStats);
router.post('/mark', markAttendance);
router.get('/history', getAttendanceHistory);
router.delete('/:id', deleteAttendance);

module.exports = router;