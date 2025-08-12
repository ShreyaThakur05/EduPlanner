const { pool } = require('../config/database');
const Joi = require('joi');

const gradeSchema = Joi.object({
  courseId: Joi.number().integer().required(),
  assignmentId: Joi.number().integer().optional(),
  title: Joi.string().min(2).max(255).required(),
  score: Joi.number().min(0).required(),
  maxScore: Joi.number().min(0.1).required(),
  weight: Joi.number().min(0.1).max(1.0).default(1.0),
  gradeDate: Joi.date().default(() => new Date())
});

const addGrade = async (req, res) => {
  try {
    const { error, value } = gradeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { courseId, assignmentId, title, score, maxScore, weight, gradeDate } = value;
    const userId = req.user.id;

    // Verify course belongs to user
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify assignment belongs to user if provided
    if (assignmentId) {
      const assignmentCheck = await pool.query(
        'SELECT id FROM assignments WHERE id = $1 AND user_id = $2',
        [assignmentId, userId]
      );

      if (assignmentCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
    }

    const result = await pool.query(
      'INSERT INTO grades (user_id, course_id, assignment_id, title, score, max_score, weight, grade_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, courseId, assignmentId, title, score, maxScore, weight, gradeDate]
    );

    res.status(201).json({
      success: true,
      message: 'Grade added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getGrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        g.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color,
        c.credits,
        a.title as assignment_title,
        ROUND((g.score / g.max_score * 100), 2) as percentage
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      LEFT JOIN assignments a ON g.assignment_id = a.id
      WHERE g.user_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (courseId) {
      query += ` AND g.course_id = $${paramIndex}`;
      params.push(courseId);
      paramIndex++;
    }

    query += ` ORDER BY g.grade_date DESC, g.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getGradeStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;

    let courseQuery = `
      SELECT 
        c.id,
        c.name,
        c.code,
        c.credits,
        c.color,
        COUNT(g.id) as total_grades,
        ROUND(AVG(g.score / g.max_score * 100), 2) as average_percentage,
        ROUND(
          SUM(g.score * g.weight) / NULLIF(SUM(g.max_score * g.weight), 0) * 100, 2
        ) as weighted_percentage,
        MIN(g.score / g.max_score * 100) as lowest_grade,
        MAX(g.score / g.max_score * 100) as highest_grade
      FROM courses c
      LEFT JOIN grades g ON c.id = g.course_id
      WHERE c.user_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (courseId) {
      courseQuery += ` AND c.id = $${paramIndex}`;
      params.push(courseId);
      paramIndex++;
    }

    courseQuery += ` GROUP BY c.id, c.name, c.code, c.credits, c.color ORDER BY c.name`;

    const courseResult = await pool.query(courseQuery, params);

    // Calculate overall GPA/CGPA
    const gpaResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_courses,
        SUM(c.credits) as total_credits,
        ROUND(
          SUM(
            CASE 
              WHEN course_avg.weighted_percentage >= 90 THEN 4.0 * c.credits
              WHEN course_avg.weighted_percentage >= 80 THEN 3.0 * c.credits
              WHEN course_avg.weighted_percentage >= 70 THEN 2.0 * c.credits
              WHEN course_avg.weighted_percentage >= 60 THEN 1.0 * c.credits
              ELSE 0.0 * c.credits
            END
          ) / NULLIF(SUM(c.credits), 0), 2
        ) as gpa_4_scale,
        ROUND(
          AVG(course_avg.weighted_percentage) / 10, 2
        ) as gpa_10_scale
      FROM courses c
      LEFT JOIN (
        SELECT 
          course_id,
          ROUND(
            SUM(score * weight) / NULLIF(SUM(max_score * weight), 0) * 100, 2
          ) as weighted_percentage
        FROM grades
        WHERE user_id = $1
        GROUP BY course_id
      ) course_avg ON c.id = course_avg.course_id
      WHERE c.user_id = $1
    `, [userId]);

    res.json({
      success: true,
      data: {
        courses: courseResult.rows,
        overall: gpaResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Get grade stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { error, value } = gradeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { courseId, assignmentId, title, score, maxScore, weight, gradeDate } = value;

    // Verify grade belongs to user
    const gradeCheck = await pool.query(
      'SELECT id FROM grades WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (gradeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Grade not found' });
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
      'UPDATE grades SET course_id = $1, assignment_id = $2, title = $3, score = $4, max_score = $5, weight = $6, grade_date = $7 WHERE id = $8 AND user_id = $9 RETURNING *',
      [courseId, assignmentId, title, score, maxScore, weight, gradeDate, id, userId]
    );

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM grades WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getGradeTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, period = '6months' } = req.query;

    let dateFilter = '';
    switch (period) {
      case '1month':
        dateFilter = "AND g.grade_date >= CURRENT_DATE - INTERVAL '1 month'";
        break;
      case '3months':
        dateFilter = "AND g.grade_date >= CURRENT_DATE - INTERVAL '3 months'";
        break;
      case '6months':
        dateFilter = "AND g.grade_date >= CURRENT_DATE - INTERVAL '6 months'";
        break;
      case '1year':
        dateFilter = "AND g.grade_date >= CURRENT_DATE - INTERVAL '1 year'";
        break;
      default:
        dateFilter = "AND g.grade_date >= CURRENT_DATE - INTERVAL '6 months'";
    }

    let query = `
      SELECT 
        DATE_TRUNC('week', g.grade_date) as week,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color,
        ROUND(AVG(g.score / g.max_score * 100), 2) as average_percentage,
        COUNT(g.id) as grade_count
      FROM grades g
      JOIN courses c ON g.course_id = c.id
      WHERE g.user_id = $1 ${dateFilter}
    `;

    const params = [userId];
    let paramIndex = 2;

    if (courseId) {
      query += ` AND g.course_id = $${paramIndex}`;
      params.push(courseId);
      paramIndex++;
    }

    query += ` GROUP BY DATE_TRUNC('week', g.grade_date), c.id, c.name, c.code, c.color ORDER BY week ASC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get grade trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addGrade,
  getGrades,
  getGradeStats,
  updateGrade,
  deleteGrade,
  getGradeTrends
};