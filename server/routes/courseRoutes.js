const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  addClassSchedule,
  deleteClassSchedule
} = require('../controllers/courseController');

const router = express.Router();

// All course routes require authentication
router.use(authenticateToken);

router.post('/', createCourse);
router.get('/', getCourses);
router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Class schedule routes
router.post('/:courseId/classes', addClassSchedule);
router.delete('/:courseId/classes/:classId', deleteClassSchedule);

module.exports = router;