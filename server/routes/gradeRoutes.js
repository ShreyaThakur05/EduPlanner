const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  addGrade,
  getGrades,
  getGradeStats,
  updateGrade,
  deleteGrade,
  getGradeTrends
} = require('../controllers/gradeController');

const router = express.Router();

// All grade routes require authentication
router.use(authenticateToken);

router.post('/', addGrade);
router.get('/', getGrades);
router.get('/stats', getGradeStats);
router.get('/trends', getGradeTrends);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

module.exports = router;