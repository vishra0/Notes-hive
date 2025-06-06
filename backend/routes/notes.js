const express = require('express');
const { uploadNote, getNotes, downloadNote, getFilterOptions } = require('../controllers/notesController');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

router.post('/upload', auth, upload.single('file'), handleMulterError, uploadNote);
router.get('/', getNotes);
router.get('/download/:id', downloadNote);
router.get('/filters', getFilterOptions);

module.exports = router;