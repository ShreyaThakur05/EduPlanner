const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getUpcomingDeadlines,
  getAssignmentStats
} = require('../controllers/assignmentController');

const router = express.Router();

// All assignment routes require authentication
router.use(authenticateToken);

router.post('/', createAssignment);
router.get('/', getAssignments);
router.get('/stats', getAssignmentStats);
router.get('/upcoming', getUpcomingDeadlines);
router.get('/:id', getAssignment);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

module.exports = router;