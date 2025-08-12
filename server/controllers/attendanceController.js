const { pool } = require('../config/database');
const Joi = require('joi');

const markAttendanceSchema = Joi.object({
  courseId: Joi.number().integer().required(),
  date: Joi.date().required(),
  status: Joi.string().valid('present', 'absent', 'late').required(),
  notes: Joi.string().optional()
});

const getAttendanceStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, startDate, endDate } = req.query;

    let query = `
      SELECT 
        c.id as course_id,
        c.name as course_name,
        c.code as course_code,
        COUNT(a.id) as total_classes,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
        ROUND(
          (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 2
        ) as attendance_percentage
      FROM courses c
      LEFT JOIN attendance a ON c.id = a.course_id AND a.user_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (courseId) {
      query += ` WHERE c.id = $${paramIndex}`;
      params.push(courseId);
      paramIndex++;
    } else {
      query += ` WHERE c.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND a.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND a.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY c.id, c.name, c.code ORDER BY c.name`;

    const result = await pool.query(query, params);

    // Calculate predictions for 75% attendance
    const statsWithPredictions = result.rows.map(row => {
      const currentPercentage = parseFloat(row.attendance_percentage) || 0;
      const totalClasses = parseInt(row.total_classes) || 0;
      const presentCount = parseInt(row.present_count) || 0;
      
      let classesNeeded = 0;
      if (currentPercentage < 75 && totalClasses > 0) {
        // Calculate classes needed to reach 75%
        classesNeeded = Math.ceil((75 * totalClasses - 100 * presentCount) / 25);
      }

      return {
        ...row,
        classes_needed_for_75: Math.max(0, classesNeeded),
        status: currentPercentage >= 80 ? 'good' : currentPercentage >= 75 ? 'warning' : 'danger'
      };
    });

    res.json({
      success: true,
      data: statsWithPredictions
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { error, value } = markAttendanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { courseId, date, status, notes } = value;
    const userId = req.user.id;

    // Check if attendance already marked for this date
    const existingAttendance = await pool.query(
      'SELECT id FROM attendance WHERE user_id = $1 AND course_id = $2 AND date = $3',
      [userId, courseId, date]
    );

    if (existingAttendance.rows.length > 0) {
      // Update existing attendance
      const result = await pool.query(
        'UPDATE attendance SET status = $1, notes = $2, marked_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND course_id = $4 AND date = $5 RETURNING *',
        [status, notes, userId, courseId, date]
      );

      res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: result.rows[0]
      });
    } else {
      // Create new attendance record
      const result = await pool.query(
        'INSERT INTO attendance (user_id, course_id, date, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, courseId, date, status, notes]
      );

      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      WHERE a.user_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (courseId) {
      query += ` AND a.course_id = $${paramIndex}`;
      params.push(courseId);
      paramIndex++;
    }

    query += ` ORDER BY a.date DESC, a.marked_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM attendance WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAttendanceStats,
  markAttendance,
  getAttendanceHistory,
  deleteAttendance
};