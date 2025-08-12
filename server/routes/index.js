const express = require('express');
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const gradeRoutes = require('./gradeRoutes');
const noteRoutes = require('./noteRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/grades', gradeRoutes);
router.use('/notes', noteRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;