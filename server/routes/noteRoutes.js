const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  downloadFile,
  getAllTags
} = require('../controllers/noteController');

const router = express.Router();

// All note routes require authentication
router.use(authenticateToken);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/tags', getAllTags);
router.get('/:id', getNote);
router.get('/:id/download', downloadFile);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;