const { pool } = require('../config/database');
const Joi = require('joi');

const assignmentSchema = Joi.object({
  courseId: Joi.number().integer().required(),
  title: Joi.string().min(2).max(255).required(),
  description: Joi.string().optional(),
  dueDate: Joi.date().required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'overdue').default('pending')
});

const createAssignment = async (req, res) => {
  try {
    const { error, value } = assignmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { courseId, title, description, dueDate, priority, status } = value;
    const userId = req.user.id;

    // Verify course belongs to user
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const result = await pool.query(
      'INSERT INTO assignments (user_id, course_id, title, description, due_date, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, courseId, title, description, dueDate, priority, status]
    );

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, status, priority, limit = 50, offset = 0, sortBy = 'due_date', sortOrder = 'ASC' } = req.query;

    let query = `
      SELECT 
        a.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color,
        CASE 
          WHEN a.due_date < CURRENT_TIMESTAMP AND a.status != 'completed' THEN 'overdue'
          ELSE a.status
        END as current_status
      FROM assignments a
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

    if (status) {
      if (status === 'overdue') {
        query += ` AND a.due_date < CURRENT_TIMESTAMP AND a.status != 'completed'`;
      } else {
        query += ` AND a.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
    }

    if (priority) {
      query += ` AND a.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    const validSortColumns = ['due_date', 'created_at', 'title', 'priority'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'due_date';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    query += ` ORDER BY a.${sortColumn} ${sortDirection} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Update overdue assignments
    await pool.query(
      'UPDATE assignments SET status = \'overdue\' WHERE user_id = $1 AND due_date < CURRENT_TIMESTAMP AND status != \'completed\'',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        a.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = $1 AND a.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { error, value } = assignmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { courseId, title, description, dueDate, priority, status } = value;

    // Verify assignment belongs to user
    const assignmentCheck = await pool.query(
      'SELECT id FROM assignments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (assignmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify course belongs to user
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const result = await pool.query(
      'UPDATE assignments SET course_id = $1, title = $2, description = $3, due_date = $4, priority = $5, status = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [courseId, title, description, dueDate, priority, status, id, userId]
    );

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM assignments WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUpcomingDeadlines = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;

    const result = await pool.query(
      `SELECT 
        a.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color,
        EXTRACT(EPOCH FROM (a.due_date - CURRENT_TIMESTAMP))/3600 as hours_remaining
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.user_id = $1 
        AND a.status != 'completed'
        AND a.due_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '${days} days'
      ORDER BY a.due_date ASC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get upcoming deadlines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssignmentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_assignments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assignments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_assignments,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_assignments,
        COUNT(CASE WHEN due_date < CURRENT_TIMESTAMP AND status != 'completed' THEN 1 END) as overdue_assignments,
        COUNT(CASE WHEN priority = 'high' AND status != 'completed' THEN 1 END) as high_priority_pending,
        ROUND(
          (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
        ) as completion_rate
      FROM assignments 
      WHERE user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getUpcomingDeadlines,
  getAssignmentStats
};