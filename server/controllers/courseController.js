const { pool } = require('../config/database');
const Joi = require('joi');

const courseSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  code: Joi.string().min(2).max(50).required(),
  credits: Joi.number().integer().min(1).max(10).default(3),
  instructorName: Joi.string().max(255).optional(),
  instructorEmail: Joi.string().email().optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#2563EB')
});

const classScheduleSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  location: Joi.string().max(255).optional()
});

const createCourse = async (req, res) => {
  try {
    const { error, value } = courseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, code, credits, instructorName, instructorEmail, color } = value;
    const userId = req.user.id;

    // Check if course code already exists for this user
    const existingCourse = await pool.query(
      'SELECT id FROM courses WHERE user_id = $1 AND code = $2',
      [userId, code]
    );

    if (existingCourse.rows.length > 0) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    const result = await pool.query(
      'INSERT INTO courses (user_id, name, code, credits, instructor_name, instructor_email, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, name, code, credits, instructorName, instructorEmail, color]
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { includeStats } = req.query;

    let query = `
      SELECT 
        c.*,
        COUNT(cl.id) as class_count
      FROM courses c
      LEFT JOIN classes cl ON c.id = cl.course_id
      WHERE c.user_id = $1
      GROUP BY c.id
      ORDER BY c.name
    `;

    if (includeStats === 'true') {
      query = `
        SELECT 
          c.*,
          COUNT(cl.id) as class_count,
          COUNT(a.id) as total_attendance,
          COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
          ROUND(
            (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 2
          ) as attendance_percentage,
          COUNT(DISTINCT ass.id) as assignment_count,
          COUNT(CASE WHEN ass.status = 'completed' THEN 1 END) as completed_assignments
        FROM courses c
        LEFT JOIN classes cl ON c.id = cl.course_id
        LEFT JOIN attendance a ON c.id = a.course_id
        LEFT JOIN assignments ass ON c.id = ass.course_id
        WHERE c.user_id = $1
        GROUP BY c.id
        ORDER BY c.name
      `;
    }

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const courseResult = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const classesResult = await pool.query(
      'SELECT * FROM classes WHERE course_id = $1 ORDER BY day_of_week, start_time',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...courseResult.rows[0],
        classes: classesResult.rows
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { error, value } = courseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, code, credits, instructorName, instructorEmail, color } = value;

    // Check if course exists and belongs to user
    const existingCourse = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingCourse.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if new code conflicts with existing courses
    const codeConflict = await pool.query(
      'SELECT id FROM courses WHERE user_id = $1 AND code = $2 AND id != $3',
      [userId, code, id]
    );

    if (codeConflict.rows.length > 0) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    const result = await pool.query(
      'UPDATE courses SET name = $1, code = $2, credits = $3, instructor_name = $4, instructor_email = $5, color = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 AND user_id = $8 RETURNING *',
      [name, code, credits, instructorName, instructorEmail, color, id, userId]
    );

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM courses WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addClassSchedule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const { error, value } = classScheduleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { dayOfWeek, startTime, endTime, location } = value;

    // Verify course belongs to user
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check for time conflicts
    const conflictCheck = await pool.query(
      `SELECT c.name FROM classes cl
       JOIN courses c ON cl.course_id = c.id
       WHERE c.user_id = $1 AND cl.day_of_week = $2 
       AND (
         (cl.start_time <= $3 AND cl.end_time > $3) OR
         (cl.start_time < $4 AND cl.end_time >= $4) OR
         (cl.start_time >= $3 AND cl.end_time <= $4)
       )`,
      [userId, dayOfWeek, startTime, endTime]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: `Time conflict with ${conflictCheck.rows[0].name}` 
      });
    }

    const result = await pool.query(
      'INSERT INTO classes (course_id, day_of_week, start_time, end_time, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [courseId, dayOfWeek, startTime, endTime, location]
    );

    res.status(201).json({
      success: true,
      message: 'Class schedule added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add class schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteClassSchedule = async (req, res) => {
  try {
    const { courseId, classId } = req.params;
    const userId = req.user.id;

    // Verify course belongs to user and class belongs to course
    const result = await pool.query(
      `DELETE FROM classes 
       WHERE id = $1 AND course_id = $2 
       AND EXISTS (SELECT 1 FROM courses WHERE id = $2 AND user_id = $3)
       RETURNING *`,
      [classId, courseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class schedule not found' });
    }

    res.json({
      success: true,
      message: 'Class schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete class schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  addClassSchedule,
  deleteClassSchedule
};