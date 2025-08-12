const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');

const noteSchema = Joi.object({
  courseId: Joi.number().integer().required(),
  title: Joi.string().min(2).max(255).required(),
  content: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/notes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, images, and text files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB
  },
  fileFilter: fileFilter
});

const createNote = async (req, res) => {
  try {
    const { error, value } = noteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { courseId, title, content, tags } = value;
    const userId = req.user.id;

    // Verify course belongs to user
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let fileUrl = null;
    let fileType = null;

    if (req.file) {
      fileUrl = `/uploads/notes/${req.file.filename}`;
      fileType = req.file.mimetype;
    }

    const result = await pool.query(
      'INSERT INTO notes (user_id, course_id, title, content, file_url, file_type, tags) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, courseId, title, content, fileUrl, fileType, tags || []]
    );

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, search, tags, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        n.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color
      FROM notes n
      JOIN courses c ON n.course_id = c.id
      WHERE n.user_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    if (courseId) {
      query += ` AND n.course_id = $${paramIndex}`;
      params.push(courseId);
      paramIndex++;
    }

    if (search) {
      query += ` AND (n.title ILIKE $${paramIndex} OR n.content ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query += ` AND n.tags && $${paramIndex}`;
      params.push(tagArray);
      paramIndex++;
    }

    query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        n.*,
        c.name as course_name,
        c.code as course_code,
        c.color as course_color
      FROM notes n
      JOIN courses c ON n.course_id = c.id
      WHERE n.id = $1 AND n.user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { error, value } = noteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { courseId, title, content, tags } = value;

    // Verify note belongs to user
    const noteCheck = await pool.query(
      'SELECT id, file_url FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Verify course belongs to user
    const courseCheck = await pool.query(
      'SELECT id FROM courses WHERE id = $1 AND user_id = $2',
      [courseId, userId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let fileUrl = noteCheck.rows[0].file_url;
    let fileType = null;

    if (req.file) {
      // Delete old file if exists
      if (fileUrl) {
        const oldFilePath = path.join(__dirname, '..', fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      fileUrl = `/uploads/notes/${req.file.filename}`;
      fileType = req.file.mimetype;
    }

    const result = await pool.query(
      'UPDATE notes SET course_id = $1, title = $2, content = $3, file_url = $4, file_type = $5, tags = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [courseId, title, content, fileUrl, fileType, tags || [], id, userId]
    );

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING file_url',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete associated file if exists
    const fileUrl = result.rows[0].file_url;
    if (fileUrl) {
      const filePath = path.join(__dirname, '..', fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT file_url, title FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0 || !result.rows[0].file_url) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', result.rows[0].file_url);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    const fileName = result.rows[0].title + path.extname(filePath);
    res.download(filePath, fileName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllTags = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT DISTINCT unnest(tags) as tag FROM notes WHERE user_id = $1 AND tags IS NOT NULL ORDER BY tag',
      [userId]
    );

    const tags = result.rows.map(row => row.tag).filter(tag => tag && tag.trim());

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get all tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createNote: [upload.single('file'), createNote],
  getNotes,
  getNote,
  updateNote: [upload.single('file'), updateNote],
  deleteNote,
  downloadFile,
  getAllTags
};