const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get today's classes
    const todayClasses = await pool.query(`
      SELECT 
        c.name as course_name,
        c.code as course_code,
        c.color,
        cl.start_time,
        cl.end_time,
        cl.location,
        EXTRACT(DOW FROM CURRENT_DATE) as current_day
      FROM courses c
      JOIN classes cl ON c.id = cl.course_id
      WHERE c.user_id = $1 AND cl.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)
      ORDER BY cl.start_time
    `, [userId]);

    // Get attendance stats
    const attendanceStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_courses,
        ROUND(AVG(
          CASE 
            WHEN course_attendance.total_classes > 0 
            THEN (course_attendance.present_count * 100.0 / course_attendance.total_classes)
            ELSE 0 
          END
        ), 2) as overall_attendance
      FROM courses c
      LEFT JOIN (
        SELECT 
          course_id,
          COUNT(*) as total_classes,
          COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count
        FROM attendance
        WHERE user_id = $1
        GROUP BY course_id
      ) course_attendance ON c.id = course_attendance.course_id
      WHERE c.user_id = $1
    `, [userId]);

    // Get upcoming assignments
    const upcomingAssignments = await pool.query(`
      SELECT 
        a.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color,
        EXTRACT(EPOCH FROM (a.due_date - CURRENT_TIMESTAMP))/3600 as hours_remaining
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.user_id = $1 
        AND a.status != 'completed'
        AND a.due_date > CURRENT_TIMESTAMP
      ORDER BY a.due_date ASC
      LIMIT 5
    `, [userId]);

    // Get recent grades
    const recentGrades = await pool.query(`
      SELECT 
        g.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color,
        ROUND((g.score / g.max_score * 100), 2) as percentage
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      WHERE g.user_id = $1
      ORDER BY g.created_at DESC
      LIMIT 5
    `, [userId]);

    // Get assignment completion stats
    const assignmentStats = await pool.query(`
      SELECT 
        COUNT(*) as total_assignments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assignments,
        COUNT(CASE WHEN due_date < CURRENT_TIMESTAMP AND status != 'completed' THEN 1 END) as overdue_assignments
      FROM assignments 
      WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      data: {
        todayClasses: todayClasses.rows,
        attendanceStats: attendanceStats.rows[0],
        upcomingAssignments: upcomingAssignments.rows,
        recentGrades: recentGrades.rows,
        assignmentStats: assignmentStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current class
router.get('/current-class', async (req, res) => {
  try {
    const userId = req.user.id;
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
    const currentDay = new Date().getDay();

    const result = await pool.query(`
      SELECT 
        c.name as course_name,
        c.code as course_code,
        c.color,
        cl.start_time,
        cl.end_time,
        cl.location
      FROM courses c
      JOIN classes cl ON c.id = cl.course_id
      WHERE c.user_id = $1 
        AND cl.day_of_week = $2
        AND cl.start_time <= $3
        AND cl.end_time > $3
      LIMIT 1
    `, [userId, currentDay, currentTime]);

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Current class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get next class
router.get('/next-class', async (req, res) => {
  try {
    const userId = req.user.id;
    const currentTime = new Date().toTimeString().slice(0, 5);
    const currentDay = new Date().getDay();

    // First try to find next class today
    let result = await pool.query(`
      SELECT 
        c.name as course_name,
        c.code as course_code,
        c.color,
        cl.start_time,
        cl.end_time,
        cl.location,
        cl.day_of_week
      FROM courses c
      JOIN classes cl ON c.id = cl.course_id
      WHERE c.user_id = $1 
        AND cl.day_of_week = $2
        AND cl.start_time > $3
      ORDER BY cl.start_time ASC
      LIMIT 1
    `, [userId, currentDay, currentTime]);

    // If no class today, find next class this week
    if (result.rows.length === 0) {
      result = await pool.query(`
        SELECT 
          c.name as course_name,
          c.code as course_code,
          c.color,
          cl.start_time,
          cl.end_time,
          cl.location,
          cl.day_of_week
        FROM courses c
        JOIN classes cl ON c.id = cl.course_id
        WHERE c.user_id = $1 
          AND cl.day_of_week > $2
        ORDER BY cl.day_of_week ASC, cl.start_time ASC
        LIMIT 1
      `, [userId, currentDay]);
    }

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Next class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly schedule
router.get('/weekly-schedule', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        c.name as course_name,
        c.code as course_code,
        c.color,
        cl.day_of_week,
        cl.start_time,
        cl.end_time,
        cl.location
      FROM courses c
      JOIN classes cl ON c.id = cl.course_id
      WHERE c.user_id = $1
      ORDER BY cl.day_of_week, cl.start_time
    `, [userId]);

    // Group by day of week
    const schedule = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    dayNames.forEach((day, index) => {
      schedule[day] = result.rows.filter(row => row.day_of_week === index);
    });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Weekly schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;