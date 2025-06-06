const Note = require('../models/Note');
const path = require('path');
const fs = require('fs');

// Helper function to get the correct file path
const getFilePath = (filePath) => {
  // If the path is already absolute, return it
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  // Otherwise, construct the path relative to the backend directory
  return path.join(__dirname, '..', filePath);
};

exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { title, description, university, degree, semester, subject } = req.body;

    // Store the relative path from the uploads directory
    const relativePath = path.join('uploads', path.basename(req.file.path));

    const note = await Note.create({
      title,
      description,
      university,
      degree,
      semester,
      subject,
      fileName: req.file.originalname,
      filePath: relativePath,
      fileSize: req.file.size,
      uploadedBy: req.user._id
    });

    await note.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { university, degree, semester, subject, search } = req.query;
    
    let filter = {};
    
    if (university) filter.university = new RegExp(university, 'i');
    if (degree) filter.degree = new RegExp(degree, 'i');
    if (semester) filter.semester = new RegExp(semester, 'i');
    if (subject) filter.subject = new RegExp(subject, 'i');
    
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') }
      ];
    }

    const notes = await Note.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.downloadNote = async (req, res) => {
  try {
    console.log('Download request for note:', req.params.id);
    
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      console.log('Note not found:', req.params.id);
      return res.status(404).json({ message: 'Note not found' });
    }

    // Get the correct file path
    const filePath = getFilePath(note.filePath);
    console.log('Looking for file at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({ message: 'File not found' });
    }

    // Increment download count
    note.downloads += 1;
    await note.save();
    console.log('Download count incremented for note:', note._id);

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

exports.getFilterOptions = async (req, res) => {
  try {
    const universities = await Note.distinct('university');
    const degrees = await Note.distinct('degree');
    const semesters = await Note.distinct('semester');
    const subjects = await Note.distinct('subject');

    res.json({
      success: true,
      filters: {
        universities,
        degrees,
        semesters,
        subjects
      }
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ message: error.message });
  }
};